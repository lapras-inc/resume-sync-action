import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import {
  ExperienceApiParamsListSchema,
  JobSummarySchema,
  LaprasStateSchema,
  WantToDoSchema,
} from "../../../types";
import { deleteAllExperiences } from "../../../utils/laprasApiClient";

/**
 * 既存の職歴をすべて削除するステップ
 */
export const deleteExperiencesStep = createStep({
  id: "delete-experiences",
  description: "Delete all existing experiences",
  inputSchema: z.object({
    originalState: LaprasStateSchema,
    experienceParams: ExperienceApiParamsListSchema,
    jobSummary: JobSummarySchema,
    wantToDo: WantToDoSchema,
  }),
  outputSchema: z.object({
    originalState: LaprasStateSchema,
    experienceParams: ExperienceApiParamsListSchema,
    jobSummary: JobSummarySchema,
    wantToDo: WantToDoSchema,
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    const count = inputData.originalState.experience_list.length;

    logger?.info(`Deleting ${count} existing experiences...`);
    await deleteAllExperiences();
    logger?.info(`✅ Deleted ${count} experiences`);

    // Pass through the data for the next steps
    return inputData;
  },
});
