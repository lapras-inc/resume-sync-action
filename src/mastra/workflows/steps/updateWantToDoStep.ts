import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import {
  ExperienceApiParamsListSchema,
  JobSummarySchema,
  LaprasStateSchema,
  WantToDoSchema,
} from "../../../types";
import { updateWantToDo as updateWantToDoApi } from "../../../utils/laprasApiClient";

/**
 * 今後のキャリア目標を更新するステップ
 */
export const updateWantToDoStep = createStep({
  id: "update-want-to-do",
  description: "Update want to do in LAPRAS",
  inputSchema: z.object({
    originalState: LaprasStateSchema,
    experienceParams: ExperienceApiParamsListSchema,
    jobSummary: JobSummarySchema,
    wantToDo: WantToDoSchema,
  }),
  outputSchema: z.object({
    success: z.boolean(),
    error: z.string().optional(),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();

    logger?.info("Updating want to do...");
    try {
      await updateWantToDoApi(inputData.wantToDo);
      logger?.info("Want to do updated successfully");
      return { success: true };
    } catch (error) {
      const errorMsg = `Failed to update want to do: ${error instanceof Error ? error.message : String(error)}`;
      logger?.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  },
});
