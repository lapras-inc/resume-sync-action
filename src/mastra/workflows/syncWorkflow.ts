import { createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { SyncResultSchema } from "../../types";
import { experienceWorkflow } from "./experienceWorkflow";
import { collectSyncResultsStep } from "./steps/collectSyncResultsStep";
import { deleteExperiencesStep } from "./steps/deleteExperiencesStep";
import { getCurrentStateStep } from "./steps/getCurrentStateStep";
import { processJobSummaryStep } from "./steps/processJobSummaryStep";
import { processWantToDoStep } from "./steps/processWantToDoStep";
import { rollbackStep } from "./steps/rollbackStep";
import { successStep } from "./steps/successStep";
import { syncExperiencesStep } from "./steps/syncExperiencesStep";
import { updateJobSummaryStep } from "./steps/updateJobSummaryStep";
import { updateWantToDoStep } from "./steps/updateWantToDoStep";

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
  // 初期処理を実行
  .parallel([getCurrentStateStep, experienceWorkflow, processJobSummaryStep, processWantToDoStep])
  // データをmapping
  .map(async ({ inputData }) => ({
    originalState: inputData["get-current-state"].originalState,
    experienceParams: inputData["experience-workflow"].experienceParams,
    jobSummary: inputData["process-job-summary"].jobSummary,
    wantToDo: inputData["process-want-to-do"].wantToDo,
  }))
  // 既存の職歴を削除
  .then(deleteExperiencesStep)
  // 新しいデータを同期
  .parallel([syncExperiencesStep, updateJobSummaryStep, updateWantToDoStep])
  // 同期結果を収集
  .then(collectSyncResultsStep)
  // 条件分岐: 成功時は成功処理、失敗時はロールバック
  .branch([
    [async ({ inputData }) => inputData.success === true, successStep],
    [async ({ inputData }) => inputData.success === false, rollbackStep],
  ])
  .commit();
