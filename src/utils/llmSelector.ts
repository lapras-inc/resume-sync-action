import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";

/**
 * 利用可能なLLMプロバイダーを検出して適切なモデルを返す
 */
export function selectLLMModel():
  | ReturnType<typeof openai>
  | ReturnType<typeof anthropic>
  | ReturnType<typeof google> {
  // Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    const model = process.env.LLM_MODEL || "claude-sonnet-4-20250514";
    return anthropic(model);
  }

  // Google
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    const model = process.env.LLM_MODEL || "gemini-2.5-flash";
    return google(model);
  }

  // OpenAI
  const model = process.env.LLM_MODEL || "gpt-4.1-mini";
  return openai(model);
}

/**
 * LLMプロバイダーが設定されているかチェック
 */
export function hasLLMProvider(): boolean {
  const providers = [
    process.env.OPENAI_API_KEY,
    process.env.ANTHROPIC_API_KEY,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  ].filter(Boolean);

  return providers.length === 1;
}

/**
 * 現在のLLMプロバイダー名を取得
 */
export function getLLMProviderName(): string {
  if (process.env.OPENAI_API_KEY) return "OpenAI";
  if (process.env.ANTHROPIC_API_KEY) return "Anthropic";
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) return "Google";
  return "None";
}
