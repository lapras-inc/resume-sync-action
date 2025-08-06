import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import type { ExperienceList, JobSummary, WantToDo } from "../../../types";
import { parseExperiences } from "../../agents/experienceParseAgent";
import { parseJobSummary } from "../../agents/jobSummaryParseAgent";
import { parseWantToDo } from "../../agents/wantToDoParseAgent";

/**
 * 職歴をパースするステップ
 */
export const parseExperienceStep = createStep({
  id: "parse-experience",
  description: "Parse experiences from resume",
  inputSchema: z.object({
    resumeContent: z.string(),
  }),
  outputSchema: z.object({
    experienceList: z.custom<ExperienceList>(),
  }),
  execute: async ({ inputData }) => {
    console.log("📝 Parsing experiences from resume...");
    const experienceList = await parseExperiences(inputData.resumeContent);
    return { experienceList };
  },
});

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

/**
 * 今後のキャリアをパースするステップ
 */
export const parseWantToDoStep = createStep({
  id: "parse-want-to-do",
  description: "Parse want to do from resume",
  inputSchema: z.object({
    resumeContent: z.string(),
  }),
  outputSchema: z.object({
    wantToDo: z.custom<WantToDo>(),
  }),
  execute: async ({ inputData }) => {
    console.log("📝 Parsing want to do from resume...");
    const wantToDo = await parseWantToDo(inputData.resumeContent);
    return { wantToDo };
  },
});
