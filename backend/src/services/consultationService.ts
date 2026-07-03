import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface ConsultationSummaryInput {
  caseDescription: string;
  lawyerNotes: string;
  chatHistory: { senderRole: string; text: string; createdAt: Date }[];
  participantNames: { lawyer: string; client: string };
}

export interface ConsultationSummaryOutput {
  title: string;
  date: string;
  participants: string;
  summary: string;
  keyOutcomes: string[];
  nextSteps: string[];
}

/**
 * Uses Gemini to generate a structured legal consultation summary
 * from the lawyer's notes and the chat history.
 */
export async function generateConsultationSummary(
  input: ConsultationSummaryInput
): Promise<ConsultationSummaryOutput> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const chatText = input.chatHistory
    .map((m) => `[${m.senderRole.toUpperCase()}]: ${m.text}`)
    .join('\n');

  const prompt = `You are a legal assistant AI. Analyze the following legal consultation and produce a professional, structured consultation summary.

CASE DESCRIPTION:
${input.caseDescription}

LAWYER NOTES (taken during the session):
${input.lawyerNotes || 'No notes provided.'}

CHAT TRANSCRIPT:
${chatText || 'No chat messages.'}

Respond ONLY with a JSON object (no markdown fences) matching this schema:
{
  "summary": "2-3 sentence executive summary of what was discussed",
  "keyOutcomes": ["outcome 1", "outcome 2", "outcome 3"],
  "nextSteps": ["next step 1", "next step 2", "next step 3"]
}`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text().trim();

  // Strip possible markdown fences
  const cleaned = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  const parsed = JSON.parse(cleaned);

  return {
    title: 'JusticePal Legal Consultation Summary',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    participants: `${input.participantNames.lawyer} (Advocate) & ${input.participantNames.client} (Client)`,
    summary: parsed.summary || '',
    keyOutcomes: Array.isArray(parsed.keyOutcomes) ? parsed.keyOutcomes : [],
    nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
  };
}
