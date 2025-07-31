import * as core from "@actions/core";
import { readFile } from "fs/promises";
import { mastra } from "./mastra";
import { getLLMProviderName, hasLLMProvider } from "./utils/llmSelector";
import { closeMCPClient } from "./utils/mcpHelper";
import { getActionInputs, setupEnvironmentVariables } from "./utils/inputHelper";
import { handleWorkflowOutput } from "./utils/outputHelper";

/**
 * GitHub Actionsのメインエントリーポイント
 */
async function run(): Promise<void> {
  try {
    // 入力パラメータの取得
    const inputs = getActionInputs();

    // 環境変数の設定
    setupEnvironmentVariables(inputs);

    // LLMプロバイダーのチェック
    if (!hasLLMProvider()) {
      throw new Error(
        "Exactly one LLM API key must be set. Please specify only one of: openai_api_key, anthropic_api_key, or GOOGLE_GENERATIVE_AI_API_KEY.",
      );
    }

    core.info(`Using LLM Provider: ${getLLMProviderName()}`);
    if (inputs.llmModel) {
      core.info(`Using LLM Model: ${inputs.llmModel}`);
    }

    // 職務経歴書ファイルの読み込み
    core.info(`Reading resume from: ${inputs.resumePath}`);
    const resumeContent = await readFile(inputs.resumePath, "utf-8");

    // ワークフローの実行
    core.info("Starting sync workflow...");
    const run = await mastra.getWorkflow("syncWorkflow").createRunAsync();
    const result = await run.start({
      inputData: {
        resumeContent,
      },
    });

    // 結果の出力
    if (result.status === "success") {
      core.info("Sync completed!");
      const finalResult = result.result;

      // ワークフローの結果を処理してアウトプットを設定
      await handleWorkflowOutput(finalResult);
    } else {
      throw new Error(`Workflow failed with status: ${result.status}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed("An unexpected error occurred");
    }
  } finally {
    // MCPクライアントのクリーンアップ
    await closeMCPClient();
  }
}

// エラーハンドリング付きで実行
run().catch((error) => {
  console.error(error);
  core.setFailed(error instanceof Error ? error.message : "Unknown error");
});
