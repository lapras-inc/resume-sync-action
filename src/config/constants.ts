/**
 * アプリケーション全体で使用する定数
 */

// API設定
export const API_CONFIG = {
  LAPRAS_BASE_URL: 'https://api.lapras.com/public/me',
  MCP_SERVER: {
    COMMAND: 'npx',
    ARGS: ['-y', '@lapras-inc/lapras-mcp-server'],
  },
} as const;

// デフォルトLLMモデル設定
export const DEFAULT_LLM_MODELS = {
  OPENAI: 'gpt-4.1-mini',
  ANTHROPIC: 'claude-sonnet-4-20250514',
  GOOGLE: 'gemini-2.5-flash',
} as const;

// 環境変数名
export const ENV_VARS = {
  // API Keys
  LAPRAS_API_KEY: 'LAPRAS_API_KEY',
  OPENAI_API_KEY: 'OPENAI_API_KEY',
  ANTHROPIC_API_KEY: 'ANTHROPIC_API_KEY',
  GOOGLE_GENERATIVE_AI_API_KEY: 'GOOGLE_GENERATIVE_AI_API_KEY',
  
  // Model settings
  LLM_MODEL: 'LLM_MODEL',
  
  // Runtime
  RUNNER_TEMP: 'RUNNER_TEMP',
} as const;