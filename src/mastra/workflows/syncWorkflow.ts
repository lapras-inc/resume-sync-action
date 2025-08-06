import { createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { experienceWorkflow } from "./experienceWorkflow";
import { getCurrentStateStep } from "./steps/getCurrentStateStep";
import { mergeDataStep } from "./steps/mergeDataStep";
import { processJobSummaryStep } from "./steps/processJobSummaryStep";
import { processWantToDoStep } from "./steps/processWantToDoStep";
import { rollbackStep, successStep } from "./steps/resultSteps";
import { deleteExperiencesStep, syncAllStep } from "./steps/syncAllStep";
import { SyncResultSchema } from "../../types";

/**
 * メインの並列同期ワークフロー
 */
export const syncWorkflow = createWorkflow({
  id: "parallel-sync-workflow",
  description: "Sync resume to LAPRAS with parallel processing and validation",
  inputSchema: z.object({
    resumeContent: z.string(),
  }),
  outputSchema: z.object({
    success: SyncResultSchema,
    rollback: SyncResultSchema,
  }),
})
  // 並列で初期処理を実行（リトライループ付き）
  .parallel([
    getCurrentStateStep,
    experienceWorkflow,
    processJobSummaryStep,
    processWantToDoStep,
  ])
  // データを統合
  .then(mergeDataStep)
  // 既存の職歴を削除
  .then(deleteExperiencesStep)
  // LAPRASに同期
  .then(syncAllStep)
  // 条件分岐: 成功時は成功処理、失敗時はロールバック
  .branch([
    [async ({ inputData }) => inputData.success === true, successStep],
    [async ({ inputData }) => inputData.success === false, rollbackStep],
  ])
  .commit();
