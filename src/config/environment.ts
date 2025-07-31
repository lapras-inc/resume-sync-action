import { z } from "zod";
import { ENV_VARS } from "./constants";

/**
 * 環境変数のスキーマ定義
 */
const EnvironmentSchema = z.object({
  // 必須の環境変数
  [ENV_VARS.LAPRAS_API_KEY]: z.string().min(1),

  // LLMプロバイダーのAPIキー（いずれか1つが必須）
  [ENV_VARS.OPENAI_API_KEY]: z.string().optional(),
  [ENV_VARS.ANTHROPIC_API_KEY]: z.string().optional(),
  [ENV_VARS.GOOGLE_GENERATIVE_AI_API_KEY]: z.string().optional(),

  // オプション
  [ENV_VARS.LLM_MODEL]: z.string().optional(),
  [ENV_VARS.RUNNER_TEMP]: z.string().optional(),
});

export type Environment = z.infer<typeof EnvironmentSchema>;

/**
 * 環境変数を取得して検証する
 */
export function getEnvironment(): Environment {
  return EnvironmentSchema.parse(process.env);
}

/**
 * 環境変数が設定されているかチェック
 */
export function hasEnvironmentVariable(key: keyof typeof ENV_VARS): boolean {
  return Boolean(process.env[ENV_VARS[key]]);
}

/**
 * 環境変数を取得（型安全）
 */
export function getEnvironmentVariable<K extends keyof typeof ENV_VARS>(
  key: K,
): string | undefined {
  return process.env[ENV_VARS[key]];
}

/**
 * LLMプロバイダーが設定されているかチェック
 */
export function hasValidLLMProvider(): boolean {
  const providers = [
    hasEnvironmentVariable("OPENAI_API_KEY"),
    hasEnvironmentVariable("ANTHROPIC_API_KEY"),
    hasEnvironmentVariable("GOOGLE_GENERATIVE_AI_API_KEY"),
  ].filter(Boolean);

  return providers.length === 1;
}

/**
 * 設定されているLLMプロバイダー名を取得
 */
export function getLLMProviderName(): string {
  if (hasEnvironmentVariable("OPENAI_API_KEY")) return "OpenAI";
  if (hasEnvironmentVariable("ANTHROPIC_API_KEY")) return "Anthropic";
  if (hasEnvironmentVariable("GOOGLE_GENERATIVE_AI_API_KEY")) return "Google";
  return "Unknown";
}
