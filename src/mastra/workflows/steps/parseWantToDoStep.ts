import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import type { WantToDo } from "../../../types";
import { parseWantToDo } from "../../agents/wantToDoParseAgent";

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
