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
  execute: async ({ inputData }) => {
    console.log("Deleting all existing experiences...");
    await deleteAllExperiences();
    console.log("All experiences deleted successfully");

    // Pass through the data for the next steps
    return inputData;
  },
});
