import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { type LaprasState, SyncResultSchema } from "../../../types";
import { getCurrentLaprasState, restoreLaprasState } from "../../../utils/laprasApiClient";
import { formatState } from "../utils/formatState";

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

    // ロールバック処理を実行
    console.log("Rolling back to original state...");
    try {
      await restoreLaprasState(inputData.originalState);
      console.log("Successfully rolled back to original state");
    } catch (error) {
      console.error("Failed to rollback:", error);
      throw new Error(
        `Critical error: Failed to rollback to original state. Manual intervention may be required. ${error instanceof Error ? error.message : String(error)}`,
      );
    }

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
