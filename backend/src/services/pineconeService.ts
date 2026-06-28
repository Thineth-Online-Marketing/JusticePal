import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Types ---
export interface LegalDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  source: string;
  type: 'law' | 'faq' | 'procedure';
}

export interface LawyerProfile {
  id: string;
  name: string;
  specializations: string[];
  location: string;
  bio: string;
  hourlyRate: number | null;
}

export interface PineconeResult {
  id: string;
  score: number;
  metadata: Record<string, any>;
}

// --- Singleton Clients ---
let pineconeClient: Pinecone | null = null;
let genAI: GoogleGenerativeAI | null = null;

function getPinecone(): Pinecone {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pineconeClient;
}

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }
  return genAI;
}

function getIndex() {
  const pc = getPinecone();
  return pc.index(process.env.PINECONE_INDEX || 'justicepal-legal');
}

// --- Embedding ---
export async function generateEmbedding(text: string): Promise<number[]> {
  const ai = getGenAI();
  const model = ai.getGenerativeModel({ model: 'gemini-embedding-2' });
  const result = await model.embedContent({
    content: { role: 'user', parts: [{ text }] },
    outputDimensionality: 1024,
  } as any);
  return result.embedding.values;
}

// --- Upsert Legal Knowledge ---
export async function upsertKnowledge(docs: LegalDocument[]): Promise<number> {
  const index = getIndex();
  const batchSize = 50;
  let upserted = 0;

  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize);

    const vectors = await Promise.all(
      batch.map(async (doc) => {
        const embedding = await generateEmbedding(`${doc.title}\n${doc.content}`);
        return {
          id: `legal-${doc.id}`,
          values: embedding,
          metadata: {
            title: doc.title,
            content: doc.content,
            category: doc.category,
            source: doc.source,
            type: doc.type,
          },
        };
      })
    );

    console.log(`Prepared ${vectors.length} vectors for batch ${Math.floor(i / batchSize) + 1}`);
    await index.upsert({ records: vectors });
    upserted += vectors.length;
    console.log(`  Upserted batch ${Math.floor(i / batchSize) + 1}: ${vectors.length} vectors`);
  }

  return upserted;
}

// --- Upsert Lawyer Profiles ---
export async function upsertLawyerProfiles(lawyers: LawyerProfile[]): Promise<number> {
  const index = getIndex();
  const batchSize = 50;
  let upserted = 0;

  for (let i = 0; i < lawyers.length; i += batchSize) {
    const batch = lawyers.slice(i, i + batchSize);

    const vectors = await Promise.all(
      batch.map(async (lawyer) => {
        const textToEmbed = [
          `Lawyer: ${lawyer.name}`,
          `Specializations: ${lawyer.specializations.join(', ')}`,
          `Location: ${lawyer.location}`,
          `About: ${lawyer.bio || 'No bio available'}`,
        ].join('\n');

        const embedding = await generateEmbedding(textToEmbed);
        return {
          id: `lawyer-${lawyer.id}`,
          values: embedding,
          metadata: {
            name: lawyer.name,
            content: textToEmbed,
            category: 'lawyer-profile',
            source: 'database',
            type: 'lawyer',
            specializations: lawyer.specializations.join(', '),
            location: lawyer.location,
            hourlyRate: lawyer.hourlyRate ?? 0,
          },
        };
      })
    );

    await index.upsert({ records: vectors });
    upserted += vectors.length;
    console.log(`  Upserted batch ${Math.floor(i / batchSize) + 1}: ${vectors.length} lawyer profiles`);
  }

  return upserted;
}

// --- Query Legal Knowledge ---
export async function queryKnowledge(
  question: string,
  topK: number = 5
): Promise<PineconeResult[]> {
  const index = getIndex();
  const queryEmbedding = await generateEmbedding(question);

  const result = await index.query({
    vector: queryEmbedding,
    topK,
    filter: { type: { $ne: 'lawyer' } },
    includeMetadata: true,
  });

  return (result.matches || []).map((match) => ({
    id: match.id,
    score: match.score || 0,
    metadata: (match.metadata || {}) as Record<string, any>,
  }));
}

// --- Query Lawyer Profiles ---
export async function queryLawyers(
  issueDescription: string,
  topK: number = 5
): Promise<PineconeResult[]> {
  const index = getIndex();
  const queryEmbedding = await generateEmbedding(issueDescription);

  const result = await index.query({
    vector: queryEmbedding,
    topK,
    filter: { type: { $eq: 'lawyer' } },
    includeMetadata: true,
  });

  return (result.matches || []).map((match) => ({
    id: match.id,
    score: match.score || 0,
    metadata: (match.metadata || {}) as Record<string, any>,
  }));
}

// --- List All Legal Knowledge (for Admin) ---
export async function listAllKnowledge(): Promise<PineconeResult[]> {
  const index = getIndex();

  // Use a zero-vector query with high topK to retrieve all legal knowledge entries.
  // This works well for knowledge bases under ~1000 entries.
  const zeroVector = new Array(1024).fill(0);

  const result = await index.query({
    vector: zeroVector,
    topK: 10000,
    filter: { type: { $ne: 'lawyer' } },
    includeMetadata: true,
  });

  return (result.matches || []).map((match) => ({
    id: match.id,
    score: match.score || 0,
    metadata: (match.metadata || {}) as Record<string, any>,
  }));
}

// --- Delete a Knowledge Entry (for Admin) ---
export async function deleteKnowledge(id: string): Promise<void> {
  const index = getIndex();
  await index.deleteOne({ id });
}
