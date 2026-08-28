import { OpenAI } from 'openai';

function getOpenAIClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: apiKey,
  });
}

function getLlmModel() {
  return process.env.LLM_MODEL || 'google/gemini-2.5-flash';
}

/**
 * Sends extracted document text to the LLM for classification and metadata extraction.
 * @param {string} text - The raw text from the document
 * @param {string} filename - The filename for context
 * @returns {Promise<Object>} The parsed JSON containing document_type, confidence, reason, and metadata
 */
export async function analyzeDocumentIntelligence(text, filename) {
  if (!getOpenAIClient()) {
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
    console.warn("OPENROUTER_API_KEY not configured. Skipping embedding generation.");
    return Array(1536).fill(0.1); 
  }

  try {
    const response = await getOpenAIClient().embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
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
    return "AI Assistant is currently offline. Please configure OPENROUTER_API_KEY.";
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
    throw new Error("AI Assistant is currently offline. Please configure OPENROUTER_API_KEY.");
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
    throw new Error("AI service is offline. Missing OPENROUTER_API_KEY.");
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

export async function findContradictions(documentsWithText) {
  if (!documentsWithText || documentsWithText.length < 2) {
    return []; // Can't find contradictions with less than 2 docs
  }

  const caseContext = documentsWithText.map(d => 
    `--- DOCUMENT: ${d.filename} (${d.document_category}) ---\n${d.extracted_text || 'No text extracted'}`
  ).join('\n\n');

  const systemPrompt = `You are a forensic legal AI assistant. Your job is to analyze multiple documents from a single case and identify any factual, temporal, or logical contradictions between them.
For example: If the FIR states the incident occurred at 10 PM, but the Medical Report says the injuries were examined at 9 PM the same day, that is a temporal contradiction.
If there are no clear contradictions, return an empty JSON array.

Analyze the following documents:
${caseContext}

OUTPUT INSTRUCTIONS:
Return a strict JSON array of objects. Do not include markdown code blocks like \`\`\`json. Return ONLY the JSON array.
Each object must have these exact keys:
- "description": A clear explanation of the contradiction.
- "doc1": The filename of the first document involved.
- "doc2": The filename of the second document involved.
- "severity": Either "HIGH", "MEDIUM", or "LOW".`;

  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: getLlmModel(),
      max_tokens: 1500,
      messages: [{ role: 'system', content: systemPrompt }],
    });
    
    let content = completion.choices[0].message.content.trim();
    if (content.startsWith('\`\`\`json')) {
      content = content.replace(/^\`\`\`json/m, '').replace(/\`\`\`$/m, '').trim();
    }
    
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("AI returned malformed JSON for contradictions:", content);
      return [];
    }
  } catch (err) {
    console.error("Failed to find contradictions:", err.message);
    return [];
  }
}

export default {
  analyzeDocumentIntelligence,
  generateEmbedding,
  generateRagResponse,
  suggestRedactions,
  generateCaseSummary,
  findContradictions
};
