import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import {
  hasEnvironmentVariable,
  getEnvironmentVariable,
  hasValidLLMProvider,
  getLLMProviderName as getProviderName,
} from "../config/environment";
import { DEFAULT_LLM_MODELS } from "../config/constants";

/**
 * 利用可能なLLMプロバイダーを検出して適切なモデルを返す
 */
export function selectLLMModel():
  | ReturnType<typeof openai>
  | ReturnType<typeof anthropic>
  | ReturnType<typeof google> {
  const customModel = getEnvironmentVariable("LLM_MODEL");

  // Anthropic
  if (hasEnvironmentVariable("ANTHROPIC_API_KEY")) {
    const model = customModel || DEFAULT_LLM_MODELS.ANTHROPIC;
    return anthropic(model);
  }

  // Google
  if (hasEnvironmentVariable("GOOGLE_GENERATIVE_AI_API_KEY")) {
    const model = customModel || DEFAULT_LLM_MODELS.GOOGLE;
    return google(model);
  }

  // OpenAI
  const model = customModel || DEFAULT_LLM_MODELS.OPENAI;
  return openai(model);
}

/**
 * LLMプロバイダーが設定されているかチェック
 */
export function hasLLMProvider(): boolean {
  return hasValidLLMProvider();
}

/**
 * 現在のLLMプロバイダー名を取得
 */
export function getLLMProviderName(): string {
  return getProviderName();
}
