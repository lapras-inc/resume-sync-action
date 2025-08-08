import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { LaprasStateSchema } from "../../../types";
import { getCurrentLaprasState } from "../../../utils/laprasApiClient";

/**
 * 現在のLAPRAS状態を取得するステップ
 */
export const getCurrentStateStep = createStep({
  id: "get-current-state",
  description: "Get current LAPRAS state",
  inputSchema: z.object({
    resumeContent: z.string(),
  }),
  outputSchema: z.object({
    originalState: LaprasStateSchema,
  }),
  execute: async ({ mastra }) => {
    const logger = mastra?.getLogger();

    logger?.info("Getting current LAPRAS state...");
    const state = await getCurrentLaprasState();
    logger?.info(`✅ Current state: ${state.experience_list.length} experiences`);

    return { originalState: state };
  },
});
