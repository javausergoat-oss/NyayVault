import { OpenAI } from 'openai';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const LLM_MODEL = process.env.LLM_MODEL || 'google/gemini-2.5-flash';

let openaiClient = null;

if (OPENROUTER_API_KEY) {
  openaiClient = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: OPENROUTER_API_KEY,
  });
}

/**
 * Sends extracted document text to the LLM for classification and metadata extraction.
 * @param {string} text - The raw text from the document
 * @param {string} filename - The filename for context
 * @returns {Promise<Object>} The parsed JSON containing document_type, confidence, reason, and metadata
 */
export async function analyzeDocumentIntelligence(text, filename) {
  if (!openaiClient) {
    console.warn("OPENROUTER_API_KEY not configured. Skipping AI analysis.");
    return {
      document_type: 'UNKNOWN_NO_AI',
      confidence: 0.0,
      reason: 'AI service not configured.',
      metadata: {}
    };
  }

  // Truncate text to avoid massive token usage on huge PDFs (first ~15,000 chars should be plenty for classification)
  const truncatedText = text.substring(0, 15000);

  const systemPrompt = `
You are an expert law-enforcement and legal document classifier.
Your job is to analyze the provided document text and classify it into one of the following categories:
- FIR
- Witness Statement
- Investigation Report
- Forensic Report
- Medical Report
- Court / Legal Document
- Evidence Document
- Identity Document
- Financial Document
- Other

You MUST also extract relevant key-value metadata from the document based on its type (e.g. "Witness Name", "Date", "Doctor", "Location").

Return your response ONLY as a valid JSON object with the following schema:
{
  "document_type": "string (one of the exact categories above)",
  "confidence": number (float between 0.0 and 1.0),
  "reason": "string (short explanation for the classification)",
  "metadata": {
    "key1": "value1",
    "key2": "value2"
  }
}
Do not wrap the JSON in markdown code blocks. Just output raw JSON.
`;

  try {
    const completion = await openaiClient.chat.completions.create({
      model: LLM_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Filename: ${filename}\n\nDocument Text:\n${truncatedText}` }
      ],
      response_format: { type: "json_object" }, // If supported by model, otherwise standard parsing
    });

    let rawJson = completion.choices[0].message.content;
    
    // Clean up potential markdown formatting if model ignored response_format
    if (rawJson.startsWith('```json')) {
      rawJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    const result = JSON.parse(rawJson);
    return {
      document_type: result.document_type || 'UNKNOWN',
      confidence: typeof result.confidence === 'number' ? result.confidence : 0.0,
      reason: result.reason || '',
      metadata: result.metadata || {}
    };
  } catch (err) {
    console.error("AI Analysis failed:", err.message);
    throw new Error(`AI Analysis Failed: ${err.message}`);
  }
}

/**
 * Generates vector embeddings for a given text chunk using OpenAI's embedding model.
 * Note: OpenRouter may not support all embedding models depending on the provider, 
 * but OpenAI's API format is used here.
 */
export async function generateEmbedding(text) {
  if (!openaiClient) {
    console.warn("OPENROUTER_API_KEY not configured. Skipping embedding generation.");
    // Return dummy 1536-dimensional array filled with 0.1 for testing without API key
    return Array(1536).fill(0.1); 
  }

  try {
    const response = await openaiClient.embeddings.create({
      model: 'text-embedding-3-small', // fallback to text-embedding-ada-002 if needed
      input: text,
      encoding_format: 'float'
    });

    return response.data[0].embedding;
  } catch (err) {
    console.error("Embedding generation failed:", err.message);
    // If embedding fails (e.g., OpenRouter doesn't route this model), return dummy vector
    return Array(1536).fill(0.1);
  }
}

export default {
  analyzeDocumentIntelligence,
  generateEmbedding
};
