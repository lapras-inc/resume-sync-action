import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import type { LaprasState } from "../../../types";

/**
 * 並列同期の結果を収集するステップ
 */
export const collectSyncResultsStep = createStep({
  id: "collect-sync-results",
  description: "Collect results from parallel sync operations",
  inputSchema: z.object({
    "sync-experiences": z.object({
      success: z.boolean(),
      errors: z.array(z.string()).optional(),
    }),
    "update-job-summary": z.object({
      success: z.boolean(),
      error: z.string().optional(),
    }),
    "update-want-to-do": z.object({
      success: z.boolean(),
      error: z.string().optional(),
    }),
    "delete-experiences": z.object({
      originalState: z.custom<LaprasState>(),
    }),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    errors: z.array(z.string()).optional(),
    originalState: z.custom<LaprasState>(),
  }),
  execute: async ({ inputData }) => {
    const errors: string[] = [];

    // Collect errors from all sync operations
    if (!inputData["sync-experiences"].success && inputData["sync-experiences"].errors) {
      errors.push(...inputData["sync-experiences"].errors);
    }
    if (!inputData["update-job-summary"].success && inputData["update-job-summary"].error) {
      errors.push(inputData["update-job-summary"].error);
    }
    if (!inputData["update-want-to-do"].success && inputData["update-want-to-do"].error) {
      errors.push(inputData["update-want-to-do"].error);
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      originalState: inputData["delete-experiences"].originalState,
    };
  },
});
