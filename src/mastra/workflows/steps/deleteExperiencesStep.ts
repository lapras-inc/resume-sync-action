import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import type { ExperienceApiParamsList, JobSummary, LaprasState, WantToDo } from "../../../types";
import { deleteAllExperiences } from "../../../utils/laprasApiClient";

/**
 * 既存の職歴をすべて削除するステップ
 */
export const deleteExperiencesStep = createStep({
  id: "delete-experiences",
  description: "Delete all existing experiences",
  inputSchema: z.object({
    originalState: z.custom<LaprasState>(),
    experienceParams: z.custom<ExperienceApiParamsList>(),
    jobSummary: z.custom<JobSummary>(),
    wantToDo: z.custom<WantToDo>(),
  }),
  outputSchema: z.object({
    originalState: z.custom<LaprasState>(),
    experienceParams: z.custom<ExperienceApiParamsList>(),
    jobSummary: z.custom<JobSummary>(),
    wantToDo: z.custom<WantToDo>(),
  }),
  execute: async ({ inputData }) => {
    console.log("Deleting all existing experiences...");
    await deleteAllExperiences();
    console.log("All experiences deleted successfully");

    // Pass through the data for the next steps
    return inputData;
  },
});
