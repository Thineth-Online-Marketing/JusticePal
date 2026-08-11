"""
matcher.py  —  JusticePal Lawyer Matching Engine
=================================================
Provides find_matching_lawyers() which supports two complementary search modes:

  1. Manual Filter Mode  – If `manual_filters` dict contains any values,
     the lawyer database is filtered strictly by those key-value pairs.
     The result is then sorted by Rating (desc) or returned as-is.

  2. AI Semantic Mode    – If `manual_filters` is empty (or all values are
     None/""), the function embeds `ai_suggestions.case_type` using the
     sentence-transformers/all-MiniLM-L6-v2 model and performs a FAISS
     cosine-similarity search against a pre-built index of lawyer
     "specialization + bio" texts.  Results are ranked by similarity score.

A lazy-initialised FAISS index is rebuilt whenever the lawyer_database
contents change, keyed by a hash of the database snapshot.
"""

from __future__ import annotations

import hashlib
import json
import logging
from typing import Optional

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

from models import CaseSuggestions  # shared Pydantic model from models.py

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Embedding model – loaded once at import time (small, CPU-friendly)
# ---------------------------------------------------------------------------

_EMBED_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
_embed_model: Optional[SentenceTransformer] = None


def _get_embed_model() -> SentenceTransformer:
    global _embed_model
    if _embed_model is None:
        logger.info("Loading embedding model: %s", _EMBED_MODEL_NAME)
        _embed_model = SentenceTransformer(_EMBED_MODEL_NAME)
    return _embed_model


# ---------------------------------------------------------------------------
# FAISS index cache
# ---------------------------------------------------------------------------

_faiss_cache: dict[str, tuple[faiss.IndexFlatIP, list[dict]]] = {}
# Maps database_hash -> (faiss_index, ordered_lawyer_list)


def _db_hash(lawyer_database: list[dict]) -> str:
    """Cheap fingerprint so we only rebuild the index when data changes."""
    raw = json.dumps(lawyer_database, sort_keys=True, default=str)
    return hashlib.md5(raw.encode()).hexdigest()


def _build_faiss_index(
    lawyer_database: list[dict],
) -> tuple[faiss.IndexFlatIP, list[dict]]:
    """
    Embed each lawyer's `specialization` + `bio` concatenation and build
    a FAISS Inner-Product (cosine after L2-normalisation) index.
    """
    model = _get_embed_model()

    texts = [
        f"{l.get('specialization', '')} {l.get('bio', '')}".strip()
        for l in lawyer_database
    ]

    embeddings: np.ndarray = model.encode(
        texts,
        convert_to_numpy=True,
        normalize_embeddings=True,   # cosine via inner-product
        show_progress_bar=False,
    ).astype("float32")

    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings)  # type: ignore[arg-type]

    logger.info("FAISS index built: %d lawyers, %d dims", len(lawyer_database), dim)
    return index, lawyer_database[:]


def _get_faiss_index(
    lawyer_database: list[dict],
) -> tuple[faiss.IndexFlatIP, list[dict]]:
    """Return a cached (or freshly built) FAISS index for the given database."""
    key = _db_hash(lawyer_database)
    if key not in _faiss_cache:
        _faiss_cache[key] = _build_faiss_index(lawyer_database)
    return _faiss_cache[key]


# ---------------------------------------------------------------------------
# Core matching function
# ---------------------------------------------------------------------------

_SORT_BY_RATING = "rating"
_DEFAULT_TOP_K = 10


def find_matching_lawyers(
    ai_suggestions: CaseSuggestions,
    manual_filters: dict,
    lawyer_database: list[dict],
    *,
    top_k: int = _DEFAULT_TOP_K,
) -> list[dict]:
    """
    Find and rank lawyers from `lawyer_database`.

    Parameters
    ----------
    ai_suggestions : CaseSuggestions
        Structured output from the extract-case-details endpoint.
        `case_type` drives semantic search; `location` is used as a
        soft secondary filter when no manual filters are set.
    manual_filters : dict
        Supported keys:
          - "specialization" (str)  – exact case-insensitive match
          - "location"       (str)  – exact case-insensitive match
          - "sort_by"        (str)  – "rating" | "relevance" (default)
        Any key with an empty/None value is ignored.
    lawyer_database : list[dict]
        Each dict must have at minimum:
          id, name, specialization, location, rating, bio, image_url
    top_k : int
        Maximum number of results to return (default 10).

    Returns
    -------
    list[dict]
        Ranked lawyer dicts, each augmented with a "_score" key
        (float 0-1, higher = more relevant).
    """
    if not lawyer_database:
        return []

    # ------------------------------------------------------------------
    # Normalise manual_filters: strip empty/None values and "sort_by"
    # ------------------------------------------------------------------
    sort_by: str = (manual_filters.get("sort_by") or "relevance").lower()
    active_filters: dict[str, str] = {
        k: v.strip()
        for k, v in manual_filters.items()
        if k != "sort_by" and v and str(v).strip()
    }

    # ------------------------------------------------------------------
    # Branch 1 – Manual Filter Mode
    # ------------------------------------------------------------------
    if active_filters:
        results = _apply_manual_filters(lawyer_database, active_filters)

        # Attach neutral score
        for r in results:
            r.setdefault("_score", 1.0)

        return _sort_and_trim(results, sort_by=sort_by, top_k=top_k)

    # ------------------------------------------------------------------
    # Branch 2 – AI Semantic Search Mode
    # ------------------------------------------------------------------
    query_parts: list[str] = []
    if ai_suggestions.case_type:
        query_parts.append(ai_suggestions.case_type)

    # If location was extracted by AI, narrow the pool strictly
    pool = lawyer_database
    if ai_suggestions.location:
        pool = _filter_by_field(
            lawyer_database, "location", ai_suggestions.location
        )
        if not pool:
            return []

    if not query_parts:
        # No case_type from AI – fall back to rating sort over full pool
        logger.info("No AI case_type available; falling back to rating sort")
        for r in pool:
            r.setdefault("_score", r.get("rating", 0) / 5.0)
        return _sort_and_trim(pool, sort_by="rating", top_k=top_k)

    query_text = " ".join(query_parts)
    results = _semantic_search(query_text, pool, top_k=top_k)

    return _sort_and_trim(results, sort_by=sort_by, top_k=top_k)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _apply_manual_filters(
    lawyers: list[dict], filters: dict[str, str]
) -> list[dict]:
    """Strict case-insensitive AND filter across all active filter keys."""
    results = lawyers
    for key, value in filters.items():
        results = _filter_by_field(results, key, value)
    return results


def _filter_by_field(
    lawyers: list[dict], field: str, value: str
) -> list[dict]:
    """Return lawyers where `field` matches `value` (case-insensitive)."""
    target = value.lower()
    return [
        l for l in lawyers
        if str(l.get(field, "")).lower() == target
    ]


def _semantic_search(
    query: str,
    pool: list[dict],
    *,
    top_k: int,
) -> list[dict]:
    """
    Embed `query`, run FAISS nearest-neighbour search over `pool`,
    and return annotated lawyer dicts sorted by similarity score.
    """
    model = _get_embed_model()
    index, indexed_lawyers = _get_faiss_index(pool)

    query_vec: np.ndarray = model.encode(
        [query],
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=False,
    ).astype("float32")

    k = min(top_k, len(indexed_lawyers))
    distances, indices = index.search(query_vec, k)  # type: ignore[arg-type]

    results: list[dict] = []
    for dist, idx in zip(distances[0], indices[0]):
        if idx == -1:
            continue
        score = float(np.clip(dist, 0.0, 1.0))
        if score < 0.20:
            continue
            
        lawyer = dict(indexed_lawyers[idx])          # shallow copy
        lawyer["_score"] = score  # IP is cosine
        results.append(lawyer)

    return results


def _sort_and_trim(
    lawyers: list[dict],
    *,
    sort_by: str,
    top_k: int,
) -> list[dict]:
    """Sort the result list and return at most `top_k` items."""
    if sort_by == _SORT_BY_RATING:
        lawyers = sorted(lawyers, key=lambda l: l.get("rating", 0), reverse=True)
    else:
        # Default: sort by AI similarity score (highest first)
        lawyers = sorted(lawyers, key=lambda l: l.get("_score", 0), reverse=True)

    return lawyers[:top_k]
