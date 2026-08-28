import { OpenAI } from 'openai';

const GOOGLE_AI_STUDIO_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export function getAiConfig() {
  const googleApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (googleApiKey) {
    return {
      provider: 'google-ai-studio',
      apiKey: googleApiKey,
      baseURL: GOOGLE_AI_STUDIO_BASE_URL,
      chatModel: process.env.LLM_MODEL || 'gemini-3.6-flash',
      embeddingModel: process.env.EMBEDDING_MODEL || 'gemini-embedding-001',
    };
  }

  if (process.env.OPENROUTER_API_KEY) {
    return {
      provider: 'openrouter',
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: OPENROUTER_BASE_URL,
      chatModel: process.env.LLM_MODEL || 'google/gemini-2.5-flash',
      embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
    };
  }

  return null;
}

function getOpenAIClient() {
  const config = getAiConfig();
  if (!config) return null;
  return new OpenAI({
    baseURL: config.baseURL,
    apiKey: config.apiKey,
  });
}

function getLlmModel() {
  return getAiConfig()?.chatModel || 'google/gemini-2.5-flash';
}

function getEmbeddingModel() {
  return getAiConfig()?.embeddingModel || 'text-embedding-3-small';
}

/**
 * Sends extracted document text to the LLM for classification and metadata extraction.
 * @param {string} text - The raw text from the document
 * @param {string} filename - The filename for context
 * @returns {Promise<Object>} The parsed JSON containing document_type, confidence, reason, and metadata
 */
export async function analyzeDocumentIntelligence(text, filename) {
  if (!getOpenAIClient()) {
    console.warn("AI API key not configured. Skipping AI analysis.");
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
- Complaint
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
    const completion = await getOpenAIClient().chat.completions.create({
      model: getLlmModel(),
      max_tokens: 4000,
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
 */
export async function generateEmbedding(text) {
  if (!getOpenAIClient()) {
    console.warn("AI API key not configured. Skipping embedding generation.");
    return Array(1536).fill(0.1); 
  }

  try {
    const response = await getOpenAIClient().embeddings.create({
      model: getEmbeddingModel(),
      input: text,
      dimensions: 1536,
      encoding_format: 'float'
    });
    return response.data[0].embedding;
  } catch (err) {
    console.error("Embedding generation failed:", err.message);
    return Array(1536).fill(0.1);
  }
}

export async function generateRagResponse(userMessage, contextChunks) {
  if (!getOpenAIClient()) {
    return "AI Assistant is currently offline. Please configure GEMINI_API_KEY or OPENROUTER_API_KEY.";
  }

  const contextText = contextChunks.map((chunk, i) => 
    `[Document snippet ${i + 1} | File: ${chunk.filename}]:\n${chunk.text_content}`
  ).join('\n\n');

  const systemPrompt = `You are a highly capable AI Assistant for law enforcement and legal professionals.
Your task is to answer the user's question accurately based ONLY on the evidence snippets provided below.
If the answer is not contained in the provided evidence, explicitly state that you cannot answer based on the current case files. 
Do not invent or hallucinate information. When answering, reference the document snippets (e.g. "According to the Medical Report...").

=== CASE EVIDENCE CONTEXT ===
${contextText}
=============================
`;

  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: getLlmModel(),
      max_tokens: 4000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
    });
    return completion.choices[0].message.content;
  } catch (err) {
    console.error("RAG completion failed:", err.message);
    throw new Error("Failed to generate AI response.");
  }
}

/**
 * Uses AI to identify sensitive PII information for redaction.
 */
export async function suggestRedactions(text) {
  if (!getOpenAIClient()) {
    throw new Error("AI Assistant is currently offline. Please configure GEMINI_API_KEY or OPENROUTER_API_KEY.");
  }

  const truncatedText = text.substring(0, 15000);

  const systemPrompt = `
You are an expert data privacy redaction engine.
Analyze the following document text and identify all sensitive PII (Personally Identifiable Information).
This includes:
- Full Names of people (except public figures or officers if explicitly stated)
- Phone Numbers
- Email Addresses
- Physical Addresses
- Bank Account / Credit Card / Financial Numbers
- Social Security / National ID Numbers

Return your response ONLY as a valid JSON object with the following schema:
{
  "redactions": [
    {
      "exact_text": "string (the exact string in the text to redact)",
      "type": "string (e.g. 'NAME', 'PHONE', 'ADDRESS', 'FINANCIAL')",
      "reason": "string (why it should be redacted)"
    }
  ]
}
Do not wrap the JSON in markdown code blocks. Just output raw JSON.
`;

  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: getLlmModel(),
      max_tokens: 4000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: truncatedText }
      ],
      response_format: { type: "json_object" },
    });

    let rawJson = completion.choices[0].message.content;
    if (rawJson.startsWith('\`\`\`json')) {
      rawJson = rawJson.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    }

    const result = JSON.parse(rawJson);
    return result.redactions || [];
  } catch (err) {
    console.error("AI Redaction Suggestion failed:", err.message);
    throw new Error(`AI Redaction Failed: ${err.message}`);
  }
}

export async function generateCaseSummary(caseTitle, caseNumber, documentsWithText) {
  if (!getOpenAIClient()) {
    throw new Error("AI service is offline. Missing GEMINI_API_KEY or OPENROUTER_API_KEY.");
  }

  const contextText = documentsWithText.map((doc, i) => 
    `[Document ${i + 1} - ${doc.document_category} - ${doc.filename} - Uploaded by ${doc.uploaded_by_name} (${doc.uploaded_by_role})]:\n${doc.extracted_text ? doc.extracted_text.substring(0, 5000) : 'No text content extracted.'}`
  ).join('\n\n---\n\n').substring(0, 30000); // 30k char limit

  const systemPrompt = `You are a highly capable AI Assistant for law enforcement and legal professionals (Smart India Hackathon Evidence Vault).
Your task is to generate a comprehensive, executive 1-page Case Summary Report based on the provided evidence documents.
Format the output in professional Markdown.

Case Details:
- Title: ${caseTitle}
- Case Number: ${caseNumber}

The report MUST contain these exact sections:
1. **Case Overview**: High-level summary of the crime/incident.
2. **Chronological Timeline**: Bullet points of key events extracted from the evidence.
3. **Key Evidence Analysis**: Summarize the most critical documents (e.g., Forensics, FIR).
4. **Current Status & Pending Actions**: Based on the latest documents.

Evidence Context:
${contextText}
`;

  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: getLlmModel(),
      max_tokens: 3000,
      messages: [{ role: 'system', content: systemPrompt }],
    });
    return completion.choices[0].message.content;
  } catch (err) {
    throw new Error("Failed to generate Case Summary: " + err.message);
  }
}

export default {
  analyzeDocumentIntelligence,
  generateEmbedding,
  generateRagResponse,
  suggestRedactions,
  generateCaseSummary,
  getAiConfig
};
