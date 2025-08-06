import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import type { LaprasState } from "../../../types";
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
    originalState: z.custom<LaprasState>(),
  }),
  execute: async () => {
    console.log("🔍 Getting current LAPRAS state...");
    const state = await getCurrentLaprasState();
    return { originalState: state };
  },
});
