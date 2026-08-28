import assert from 'node:assert/strict';
import test from 'node:test';

import { getAiConfig } from '../src/services/aiService.js';

test('uses Google AI Studio OpenAI-compatible endpoint when GEMINI_API_KEY is set', () => {
  const previous = {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    LLM_MODEL: process.env.LLM_MODEL,
    EMBEDDING_MODEL: process.env.EMBEDDING_MODEL,
  };

  delete process.env.OPENROUTER_API_KEY;
  delete process.env.GOOGLE_API_KEY;
  process.env.GEMINI_API_KEY = 'test-gemini-key';
  delete process.env.LLM_MODEL;
  delete process.env.EMBEDDING_MODEL;

  try {
    assert.deepEqual(getAiConfig(), {
      provider: 'google-ai-studio',
      apiKey: 'test-gemini-key',
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
      chatModel: 'gemini-3.6-flash',
      embeddingModel: 'gemini-embedding-001',
    });
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
});
