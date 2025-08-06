import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { type JobSummary, JobSummarySchema, ValidationResultSchema } from "../../../types";
import { parseJobSummary } from "../../agents/jobSummaryParseAgent";
import { validateJobSummary } from "../../validators/validateJobSummary";

/**
 * 職務要約をパースしてバリデーションするワークフロー
 */
const parseAndValidateJobSummaryWorkflow = createWorkflow({
  id: "parse-validate-job-summary",
  inputSchema: z.object({
    resumeContent: z.string(),
  }),
  outputSchema: z.object({
    jobSummary: JobSummarySchema,
    validation: ValidationResultSchema,
  }),
})
  .dountil(
    createStep({
      id: "parse-validate-job-summary-loop",
      description: "Parse and validate job summary",
      inputSchema: z.object({
        resumeContent: z.string(),
        validation: ValidationResultSchema.optional(),
        retryCount: z.number().default(0),
      }),
      outputSchema: z.object({
        jobSummary: JobSummarySchema,
        validation: ValidationResultSchema,
        retryCount: z.number(),
      }),
      execute: async ({ inputData }) => {
        // エラーがある場合はプロンプトに含める
        const errors = inputData.validation?.errors;
        let jobSummary: JobSummary;

        if (errors && errors.length > 0) {
          // リトライ時はエラー内容を考慮して再生成
          console.log(`📝 Retrying job summary parsing with error feedback...`);
          const errorFeedback = `前回のバリデーションエラー:\n${errors.join("\n")}\n\nこれらのエラーを修正して、適切な職務要約を生成してください。`;
          jobSummary = await parseJobSummary(`${inputData.resumeContent}\n\n${errorFeedback}`);
        } else {
          // 初回のパース
          console.log("📝 Parsing job summary from resume...");
          jobSummary = await parseJobSummary(inputData.resumeContent);
        }

        // バリデーション
        const validation = validateJobSummary(jobSummary);

        // リトライカウントを更新
        const retryCount = inputData.retryCount + 1;

        return {
          jobSummary,
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
 * 職務要約をパースしてバリデーションするステップ
 */
export const processJobSummaryStep = createStep({
  id: "process-job-summary",
  description: "Process and validate job summary",
  inputSchema: z.object({
    resumeContent: z.string(),
  }),
  outputSchema: z.object({
    jobSummary: JobSummarySchema,
  }),
  execute: async ({ inputData }) => {
    const workflow = parseAndValidateJobSummaryWorkflow;
    const run = workflow.createRun();
    const result = await run.start({
      inputData: { resumeContent: inputData.resumeContent },
    });

    if (result.status === "success") {
      return {
        jobSummary: result.result.jobSummary,
      };
    }
    throw new Error("Failed to process job summary");
  },
});
