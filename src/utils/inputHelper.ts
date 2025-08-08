import * as core from "@actions/core";
import { ENV_VARS } from "../config/constants";

export interface ActionInputs {
  resumePath: string;
  laprasApiKey: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  googleApiKey?: string;
  llmModel?: string;
}

/**
 * GitHub Actionsの入力パラメータを取得
 */
export function getActionInputs(): ActionInputs {
  return {
    resumePath: core.getInput("resume_path", { required: true }),
    laprasApiKey: core.getInput("lapras_api_key", { required: true }),
    openaiApiKey: core.getInput("openai_api_key") || undefined,
    anthropicApiKey: core.getInput("anthropic_api_key") || undefined,
    googleApiKey: core.getInput("google_generative_ai_api_key") || undefined,
    llmModel: core.getInput("llm_model") || undefined,
  };
}

/**
 * 環境変数を設定
 */
export function setupEnvironmentVariables(inputs: ActionInputs): void {
  core.info("🔧 Setting up environment variables:");
  core.info(`  LAPRAS_API_KEY: ${inputs.laprasApiKey ? "✓ SET" : "✗ NOT SET"}`);
  core.info(`  OPENAI_API_KEY: ${inputs.openaiApiKey ? "✓ SET" : "✗ NOT SET"}`);
  core.info(`  ANTHROPIC_API_KEY: ${inputs.anthropicApiKey ? "✓ SET" : "✗ NOT SET"}`);
  core.info(`  GOOGLE_GENERATIVE_AI_API_KEY: ${inputs.googleApiKey ? "✓ SET" : "✗ NOT SET"}`);
  core.info(`  LLM_MODEL: ${inputs.llmModel || "DEFAULT"}`);

  process.env[ENV_VARS.LAPRAS_API_KEY] = inputs.laprasApiKey;
  if (inputs.openaiApiKey) process.env[ENV_VARS.OPENAI_API_KEY] = inputs.openaiApiKey;
  if (inputs.anthropicApiKey) process.env[ENV_VARS.ANTHROPIC_API_KEY] = inputs.anthropicApiKey;
  if (inputs.googleApiKey) process.env[ENV_VARS.GOOGLE_GENERATIVE_AI_API_KEY] = inputs.googleApiKey;
  if (inputs.llmModel) process.env[ENV_VARS.LLM_MODEL] = inputs.llmModel;

  core.info("✅ Environment variables configured");
}
