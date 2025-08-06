import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { SyncResultSchema, type LaprasState } from "../../../types";
import { getCurrentLaprasState } from "../../../utils/laprasApiClient";
import { rollbackStep as executeRollback } from "./syncSteps";

/**
 * ロールバックステップ
 */
export const rollbackStep = createStep({
  id: "rollback",
  description: "Rollback to original state",
  inputSchema: z.object({
    success: z.boolean(),
    errors: z.array(z.string()).optional(),
    originalState: z.custom<LaprasState>(),
  }),
  outputSchema: SyncResultSchema,
  execute: async ({ inputData }) => {
    console.error("❌ Sync failed, rolling back...");
    await executeRollback(inputData.originalState);

    // アーティファクト用に状態をフォーマット
    const formatState = (state: LaprasState): string => {
      const experiences = state.experience_list
        .map(
          (exp) =>
            `- ${exp.organization_name} (${exp.start_year}/${exp.start_month} - ${
              exp.end_year || "現在"
            }/${exp.end_month || ""})
  ${exp.position_name}
  ${exp.description}`,
        )
        .join("\n\n");

      return `# LAPRAS Career State

## 職歴
${experiences}

## 職務要約
${state.job_summary}

## 今後やりたいこと
${state.want_to_do}`;
    };

    return {
      success: false,
      message: "Sync failed and rolled back to original state",
      errors: inputData.errors,
      artifacts: {
        before: formatState(inputData.originalState),
        after: formatState(inputData.originalState), // ロールバック後は元の状態
      },
    };
  },
});

/**
 * 成功ステップ
 */
export const successStep = createStep({
  id: "success",
  description: "Process successful sync",
  inputSchema: z.object({
    success: z.boolean(),
    errors: z.array(z.string()).optional(),
    originalState: z.custom<LaprasState>(),
  }),
  outputSchema: SyncResultSchema,
  execute: async ({ inputData }) => {
    // 更新後の状態を取得
    const newState = await getCurrentLaprasState();
    console.log("✅ Sync completed successfully");

    // アーティファクト用に状態をフォーマット
    const formatState = (state: LaprasState): string => {
      const experiences = state.experience_list
        .map(
          (exp) =>
            `- ${exp.organization_name} (${exp.start_year}/${exp.start_month} - ${
              exp.end_year || "現在"
            }/${exp.end_month || ""})
  ${exp.position_name}
  ${exp.description}`,
        )
        .join("\n\n");

      return `# LAPRAS Career State

## 職歴
${experiences}

## 職務要約
${state.job_summary}

## 今後やりたいこと
${state.want_to_do}`;
    };

    return {
      success: true,
      message: "Successfully synced resume to LAPRAS",
      artifacts: {
        before: formatState(inputData.originalState),
        after: formatState(newState),
      },
    };
  },
});
