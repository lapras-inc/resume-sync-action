import * as core from "@actions/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getActionInputs } from "./inputHelper";

// @actions/coreのモック
vi.mock("@actions/core", () => ({
  getInput: vi.fn(),
  getBooleanInput: vi.fn(),
  setFailed: vi.fn(),
}));

describe("inputHelper", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.unstubAllEnvs();
  });

  it("必須入力を正しく取得する", () => {
    // Arrange
    const mockedGetInput = vi.mocked(core.getInput);

    mockedGetInput.mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        resume_path: "./resume.md",
        lapras_api_key: "test-lapras-key",
        openai_api_key: "",
        anthropic_api_key: "",
        google_generative_ai_api_key: "",
        llm_model: "",
      };
      return inputs[name] || "";
    });

    // Act
    const result = getActionInputs();

    // Assert
    expect(result.resumePath).toBe("./resume.md");
    expect(result.laprasApiKey).toBe("test-lapras-key");
    expect(mockedGetInput).toHaveBeenCalledWith("resume_path", { required: true });
    expect(mockedGetInput).toHaveBeenCalledWith("lapras_api_key", { required: true });
  });

  it("オプションのLLMモデル名を取得できる", () => {
    // Arrange
    const mockedGetInput = vi.mocked(core.getInput);

    mockedGetInput.mockImplementation((name: string) => {
      if (name === "resume_path") return "./resume.md";
      if (name === "lapras_api_key") return "test-lapras-key";
      if (name === "llm_model") return "gpt-4-turbo";
      return "";
    });

    // Act
    const result = getActionInputs();

    // Assert
    expect(result.llmModel).toBe("gpt-4-turbo");
  });

  it("APIキーを正しく取得する", () => {
    // Arrange
    const mockedGetInput = vi.mocked(core.getInput);

    mockedGetInput.mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        resume_path: "./resume.md",
        lapras_api_key: "test-lapras-key",
        openai_api_key: "test-openai-key",
        anthropic_api_key: "test-anthropic-key",
        google_generative_ai_api_key: "test-google-key",
      };
      return inputs[name] || "";
    });

    // Act
    const result = getActionInputs();

    // Assert
    expect(result.openaiApiKey).toBe("test-openai-key");
    expect(result.anthropicApiKey).toBe("test-anthropic-key");
    expect(result.googleApiKey).toBe("test-google-key");
  });

  it("resume_pathが指定されていない場合、エラーをスローする", () => {
    // Arrange
    const mockedGetInput = vi.mocked(core.getInput);

    // biome-ignore lint/suspicious/noExplicitAny: test
    mockedGetInput.mockImplementation((name: string, options?: any) => {
      if (name === "resume_path" && options?.required) {
        throw new Error("Input required and not supplied: resume_path");
      }
      if (name === "lapras_api_key" && options?.required) {
        return "test-lapras-key";
      }
      return "";
    });

    // Act & Assert
    expect(() => getActionInputs()).toThrow("Input required and not supplied: resume_path");
  });
});
