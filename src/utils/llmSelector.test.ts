import { beforeEach, describe, expect, it, vi } from "vitest";
import { selectLLMModel } from "./llmSelector";

describe("llmSelector", () => {
  beforeEach(() => {
    // 環境変数をリセット
    vi.unstubAllEnvs();
  });

  it("デフォルトでOpenAIモデルを返す", () => {
    // Arrange - APIキーなしでもデフォルトで動作

    // Act
    const result = selectLLMModel();

    // Assert
    expect(result).toBeDefined();
    expect(result.modelId).toBe("gpt-4.1-mini");
  });

  it("Anthropic APIキーが設定されている場合、Claudeモデルを返す", () => {
    // Arrange
    vi.stubEnv("ANTHROPIC_API_KEY", "test-anthropic-key");

    // Act
    const result = selectLLMModel();

    // Assert
    expect(result).toBeDefined();
    expect(result.modelId).toBe("claude-sonnet-4-20250514");
  });

  it("Google AI APIキーが設定されている場合、Geminiモデルを返す", () => {
    // Arrange
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "test-google-key");

    // Act
    const result = selectLLMModel();

    // Assert
    expect(result).toBeDefined();
    expect(result.modelId).toBe("gemini-2.5-flash");
  });

  it("複数のAPIキーが設定されている場合、優先順位に従って選択される", () => {
    // Arrange - Anthropicが最優先
    vi.stubEnv("OPENAI_API_KEY", "test-openai-key");
    vi.stubEnv("ANTHROPIC_API_KEY", "test-anthropic-key");
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "test-google-key");

    // Act
    const result = selectLLMModel();

    // Assert - Anthropicが優先される
    expect(result.modelId).toBe("claude-sonnet-4-20250514");
  });

  it("APIキーが設定されていない場合でもデフォルトのOpenAIモデルを返す", () => {
    // Arrange - 環境変数をクリア
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "");

    // Act
    const result = selectLLMModel();

    // Assert - デフォルトでOpenAIモデルを返す
    expect(result).toBeDefined();
    expect(result.modelId).toBe("gpt-4.1-mini");
  });

  it("カスタムモデル名が環境変数で指定されている場合、それを使用する", () => {
    // Arrange
    vi.stubEnv("LLM_MODEL", "gpt-4-turbo");

    // Act
    const result = selectLLMModel();

    // Assert
    expect(result.modelId).toBe("gpt-4-turbo");
  });
});
