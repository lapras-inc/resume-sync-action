import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { type LaprasState, SyncResultSchema } from "../../../types";
import { restoreLaprasState } from "../../../utils/laprasApiClient";
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
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();

    logger?.error("❌ Sync failed, rolling back...");

    // ロールバック処理を実行
    logger?.info("Rolling back to original state...");
    try {
      await restoreLaprasState(inputData.originalState);
      logger?.info("Successfully rolled back to original state");
    } catch (error) {
      logger?.error(
        `Failed to rollback: ${error instanceof Error ? error.message : String(error)}`,
      );
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
