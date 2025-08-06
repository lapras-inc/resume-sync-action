import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import type { JobSummary } from "../../../types";
import { parseJobSummary } from "../../agents/jobSummaryParseAgent";

/**
 * 職務要約をパースするステップ
 */
export const parseJobSummaryStep = createStep({
  id: "parse-job-summary",
  description: "Parse job summary from resume",
  inputSchema: z.object({
    resumeContent: z.string(),
  }),
  outputSchema: z.object({
    jobSummary: z.custom<JobSummary>(),
  }),
  execute: async ({ inputData }) => {
    console.log("📝 Parsing job summary from resume...");
    const jobSummary = await parseJobSummary(inputData.resumeContent);
    return { jobSummary };
  },
});
