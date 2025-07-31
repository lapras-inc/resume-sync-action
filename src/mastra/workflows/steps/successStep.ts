import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { type LaprasState, SyncResultSchema } from "../../../types";
import { getCurrentLaprasState } from "../../../utils/laprasApiClient";
import { formatState } from "../utils/formatState";

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
