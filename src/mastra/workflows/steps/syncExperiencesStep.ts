import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import type { ExperienceApiParamsList } from "../../../types";
import { createExperience } from "../../../utils/laprasApiClient";

/**
 * 新しい職歴を同期するステップ
 */
export const syncExperiencesStep = createStep({
  id: "sync-experiences",
  description: "Sync new experiences to LAPRAS",
  inputSchema: z.object({
    experienceParams: z.custom<ExperienceApiParamsList>(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    errors: z.array(z.string()).optional(),
  }),
  execute: async ({ inputData }) => {
    console.log(`Syncing ${inputData.experienceParams.experiences.length} experiences...`);
    const errors: string[] = [];

    for (let i = 0; i < inputData.experienceParams.experiences.length; i++) {
      const exp = inputData.experienceParams.experiences[i];
      try {
        await createExperience(exp);
        console.log(
          `Experience ${i + 1}/${inputData.experienceParams.experiences.length} created successfully`,
        );
      } catch (error) {
        const errorMsg = `Failed to create experience ${i + 1}: ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  },
});
