import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import type { ExperienceList } from "../../../types";
import { parseExperiences } from "../../agents/experienceParseAgent";

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
