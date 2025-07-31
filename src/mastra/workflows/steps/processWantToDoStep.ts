import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { ValidationResultSchema, type WantToDo, WantToDoSchema } from "../../../types";
import { parseWantToDo } from "../../agents/wantToDoParseAgent";
import { validateWantToDo } from "../../validators/validateWantToDo";

/**
 * キャリア目標をパースしてバリデーションするワークフロー
 */
const parseAndValidateWantToDoWorkflow = createWorkflow({
  id: "parse-validate-want-to-do",
  inputSchema: z.object({
    resumeContent: z.string(),
  }),
  outputSchema: z.object({
    wantToDo: WantToDoSchema,
    validation: ValidationResultSchema,
  }),
})
  .dountil(
    createStep({
      id: "parse-validate-want-to-do-loop",
      description: "Parse and validate want to do",
      inputSchema: z.object({
        resumeContent: z.string(),
        validation: ValidationResultSchema.optional(),
        retryCount: z.number().default(0),
      }),
      outputSchema: z.object({
        wantToDo: WantToDoSchema,
        validation: ValidationResultSchema,
        retryCount: z.number(),
      }),
      execute: async ({ inputData }) => {
        // エラーがある場合はプロンプトに含める
        const errors = inputData.validation?.errors;
        let wantToDo: WantToDo;

        if (errors && errors.length > 0) {
          // リトライ時はエラー内容を考慮して再生成
          console.log(`📝 Retrying want to do parsing with error feedback...`);
          const errorFeedback = `前回のバリデーションエラー:\n${errors.join("\n")}\n\nこれらのエラーを修正して、適切なキャリア目標を生成してください。`;
          wantToDo = await parseWantToDo(`${inputData.resumeContent}\n\n${errorFeedback}`);
        } else {
          // 初回のパース
          console.log("📝 Parsing want to do from resume...");
          wantToDo = await parseWantToDo(inputData.resumeContent);
        }

        // バリデーション
        const validation = validateWantToDo(wantToDo);

        // リトライカウントを更新
        const retryCount = inputData.retryCount + 1;

        return {
          wantToDo,
          validation,
          retryCount,
        };
      },
    }),
    async ({ inputData }) => {
      // バリデーションが成功するか、3回リトライしたら終了
      return inputData.validation?.isValid === true || inputData.retryCount >= 3;
    },
  )
  .commit();

/**
 * キャリア目標をパースしてバリデーションするステップ
 */
export const processWantToDoStep = createStep({
  id: "process-want-to-do",
  description: "Process and validate want to do",
  inputSchema: z.object({
    resumeContent: z.string(),
  }),
  outputSchema: z.object({
    wantToDo: WantToDoSchema,
  }),
  execute: async ({ inputData }) => {
    const workflow = parseAndValidateWantToDoWorkflow;
    const run = workflow.createRun();
    const result = await run.start({
      inputData: { resumeContent: inputData.resumeContent },
    });

    if (result.status === "success") {
      return {
        wantToDo: result.result.wantToDo,
      };
    }
    throw new Error("Failed to process want to do");
  },
});
