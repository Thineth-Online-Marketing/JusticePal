"""
matcher.py  —  JusticePal Lawyer Matching Engine
=================================================
Provides find_matching_lawyers() which supports two complementary search modes:

  1. Manual Filter Mode  – If `manual_filters` dict contains any values,
     the lawyer database is filtered strictly by those key-value pairs.
     The result is then sorted by Rating (desc) or returned as-is.

  2. AI Semantic Mode    – If `manual_filters` is empty (or all values are
     None/""), the function matches `ai_suggestions.case_type` against
     lawyer "specialization + bio" texts using semantic or text similarity.

Lightweight & Serverless Compatible (Vercel/Render/Cloud).
"""

from __future__ import annotations

import hashlib
import json
import logging
from typing import Optional

import numpy as np
from models import CaseSuggestions

logger = logging.getLogger(__name__)

# Try importing heavy ML libraries if available, otherwise use lightweight fallback
try:
    import faiss
    from sentence_transformers import SentenceTransformer
    HAS_TRANSFORMERS = True
except ImportError:
    HAS_TRANSFORMERS = False
    logger.info("FAISS/SentenceTransformers not installed. Using lightweight matching engine.")

_EMBED_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
_embed_model = None


def _get_embed_model():
    global _embed_model
    if HAS_TRANSFORMERS and _embed_model is None:
        logger.info("Loading embedding model: %s", _EMBED_MODEL_NAME)
        _embed_model = SentenceTransformer(_EMBED_MODEL_NAME)
    return _embed_model


_faiss_cache: dict = {}


def _db_hash(lawyer_database: list[dict]) -> str:
    raw = json.dumps(lawyer_database, sort_keys=True, default=str)
    return hashlib.md5(raw.encode()).hexdigest()


def _build_faiss_index(lawyer_database: list[dict]):
    if not HAS_TRANSFORMERS:
        return None, lawyer_database[:]
    model = _get_embed_model()
    texts = [
        f"{l.get('specialization', '')} {l.get('bio', '')}".strip()
        for l in lawyer_database
    ]
    embeddings: np.ndarray = model.encode(
        texts,
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=False,
    ).astype("float32")

    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings)
    return index, lawyer_database[:]


def _get_faiss_index(lawyer_database: list[dict]):
    key = _db_hash(lawyer_database)
    if key not in _faiss_cache:
        _faiss_cache[key] = _build_faiss_index(lawyer_database)
    return _faiss_cache[key]


_SORT_BY_RATING = "rating"
_DEFAULT_TOP_K = 10


def find_matching_lawyers(
    ai_suggestions: CaseSuggestions,
    manual_filters: dict,
    lawyer_database: list[dict],
    *,
    top_k: int = _DEFAULT_TOP_K,
) -> list[dict]:
    if not lawyer_database:
        return []

    sort_by: str = (manual_filters.get("sort_by") or "relevance").lower()
    active_filters: dict[str, str] = {
        k: str(v).strip()
        for k, v in manual_filters.items()
        if k != "sort_by" and v and str(v).strip()
    }

    # Branch 1 – Manual Filter Mode
    if active_filters:
        results = _apply_manual_filters(lawyer_database, active_filters)
        for r in results:
            r.setdefault("_score", 1.0)
        return _sort_and_trim(results, sort_by=sort_by, top_k=top_k)

    # Branch 2 – AI Matcher Mode
    query_parts: list[str] = []
    if ai_suggestions.case_type:
        query_parts.append(ai_suggestions.case_type)

    pool = lawyer_database
    if ai_suggestions.location:
        pool = _filter_by_field(
            lawyer_database, "location", ai_suggestions.location
        )
        if not pool:
            return []

    if not query_parts:
        for r in pool:
            r.setdefault("_score", r.get("rating", 0) / 5.0)
        return _sort_and_trim(pool, sort_by="rating", top_k=top_k)

    query_text = " ".join(query_parts)
    results = _semantic_search(query_text, pool, top_k=top_k)

    return _sort_and_trim(results, sort_by=sort_by, top_k=top_k)


def _apply_manual_filters(lawyers: list[dict], filters: dict[str, str]) -> list[dict]:
    results = lawyers
    for key, value in filters.items():
        results = _filter_by_field(results, key, value)
    return results


def _filter_by_field(lawyers: list[dict], field: str, value: str) -> list[dict]:
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
    # If FAISS & SentenceTransformers are available, use them
    if HAS_TRANSFORMERS:
        try:
            model = _get_embed_model()
            index, indexed_lawyers = _get_faiss_index(pool)

            query_vec: np.ndarray = model.encode(
                [query],
                convert_to_numpy=True,
                normalize_embeddings=True,
                show_progress_bar=False,
            ).astype("float32")

            k = min(top_k, len(indexed_lawyers))
            distances, indices = index.search(query_vec, k)

            results: list[dict] = []
            for dist, idx in zip(distances[0], indices[0]):
                if idx == -1:
                    continue
                score = float(np.clip(dist, 0.0, 1.0))
                if score < 0.20:
                    continue

                lawyer = dict(indexed_lawyers[idx])
                lawyer["_score"] = score
                results.append(lawyer)

            return results
        except Exception as e:
            logger.warning("Transformers matching failed, falling back: %s", e)

    # Lightweight Keyword / Jaccard Fallback (Serverless / No PyTorch)
    results = []
    query_words = set(query.lower().split())

    for lawyer in pool:
        specs = " ".join(lawyer.get("specialization", [])) if isinstance(lawyer.get("specialization"), list) else str(lawyer.get("specialization", ""))
        bio = str(lawyer.get("bio", ""))
        text_words = set(f"{specs} {bio}".lower().split())

        if not query_words or not text_words:
            score = 0.5
        else:
            intersection = query_words.intersection(text_words)
            union = query_words.union(text_words)
            score = len(intersection) / len(union) if union else 0.5

        # Boost rating
        rating_boost = (lawyer.get("rating", 0) / 5.0) * 0.3
        final_score = min(1.0, score + rating_boost)

        lawyer_copy = dict(lawyer)
        lawyer_copy["_score"] = round(final_score, 2)
        results.append(lawyer_copy)

    return results


def _sort_and_trim(
    lawyers: list[dict],
    *,
    sort_by: str,
    top_k: int,
) -> list[dict]:
    if sort_by == _SORT_BY_RATING:
        lawyers = sorted(lawyers, key=lambda l: l.get("rating", 0), reverse=True)
    else:
        lawyers = sorted(lawyers, key=lambda l: l.get("_score", 0), reverse=True)

    return lawyers[:top_k]
