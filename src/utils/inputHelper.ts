import * as core from "@actions/core";

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
    googleApiKey: core.getInput("GOOGLE_GENERATIVE_AI_API_KEY") || undefined,
    llmModel: core.getInput("llm_model") || undefined,
  };
}

/**
 * 環境変数を設定
 */
export function setupEnvironmentVariables(inputs: ActionInputs): void {
  console.log("🔧 Setting up environment variables:");
  console.log(`  LAPRAS_API_KEY: ${inputs.laprasApiKey ? "SET" : "NOT SET"}`);
  console.log(`  OPENAI_API_KEY: ${inputs.openaiApiKey ? "SET" : "NOT SET"}`);
  console.log(`  ANTHROPIC_API_KEY: ${inputs.anthropicApiKey ? "SET" : "NOT SET"}`);
  console.log(`  GOOGLE_GENERATIVE_AI_API_KEY: ${inputs.googleApiKey ? "SET" : "NOT SET"}`);
  console.log(`  LLM_MODEL: ${inputs.llmModel || "NOT SET"}`);

  process.env.LAPRAS_API_KEY = inputs.laprasApiKey;
  if (inputs.openaiApiKey) process.env.OPENAI_API_KEY = inputs.openaiApiKey;
  if (inputs.anthropicApiKey) process.env.ANTHROPIC_API_KEY = inputs.anthropicApiKey;
  if (inputs.googleApiKey) process.env.GOOGLE_GENERATIVE_AI_API_KEY = inputs.googleApiKey;
  if (inputs.llmModel) process.env.LLM_MODEL = inputs.llmModel;

  console.log("✅ Environment variables set successfully");
}
