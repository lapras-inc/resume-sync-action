import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import {
  ExperienceApiParamsListSchema,
  JobSummarySchema,
  LaprasStateSchema,
  WantToDoSchema,
} from "../../../types";
import { createExperience } from "../../../utils/laprasApiClient";

/**
 * 新しい職歴を同期するステップ
 */
export const syncExperiencesStep = createStep({
  id: "sync-experiences",
  description: "Sync new experiences to LAPRAS",
  inputSchema: z.object({
    originalState: LaprasStateSchema,
    experienceParams: ExperienceApiParamsListSchema,
    jobSummary: JobSummarySchema,
    wantToDo: WantToDoSchema,
  }),
  outputSchema: z.object({
    success: z.boolean(),
    errors: z.array(z.string()).optional(),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    const total = inputData.experienceParams.experiences.length;
    const errors: string[] = [];

    logger?.info(`Syncing ${total} experiences...`);

    for (let i = 0; i < total; i++) {
      const exp = inputData.experienceParams.experiences[i];
      const current = i + 1;

      try {
        await createExperience(exp);
        logger?.info(`Experience ${current}/${total} created successfully`);
      } catch (error) {
        const errorMsg = `Failed to create experience ${current}: ${error instanceof Error ? error.message : String(error)}`;
        logger?.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  },
});
