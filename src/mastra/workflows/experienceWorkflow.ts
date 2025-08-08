import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import {
  ExperienceApiParamsListSchema,
  ExperienceListSchema,
  ValidationResultSchema,
} from "../../types";
import { buildExperienceParams } from "../agents/experienceParamsBuilderAgent";
import { parseExperiences } from "../agents/experienceParseAgent";
import { validateExperience } from "../validators/validateExperience";

/**
 * 職歴を解析するステップ
 */
const parseExperienceStep = createStep({
  id: "parse-experience",
  description: "Parse experience from resume",
  inputSchema: z.object({
    resumeContent: z.string(),
  }),
  outputSchema: z.object({
    experienceList: ExperienceListSchema,
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();

    logger?.info("Parsing experiences from resume...");
    const experienceList = await parseExperiences(inputData.resumeContent);
    logger?.info(`✅ Parsed ${experienceList.experiences.length} experiences`);

    return { experienceList };
  },
});

/**
 * 職歴パラメータを組み立ててバリデーションするステップ
 */
const buildAndValidateStep = createStep({
  id: "build-validate",
  description: "Build and validate experience parameters",
  inputSchema: z.object({
    experienceList: ExperienceListSchema,
    validation: ValidationResultSchema.optional(),
    retryCount: z.number().default(0),
  }),
  outputSchema: z.object({
    experienceParams: ExperienceApiParamsListSchema,
    validation: ValidationResultSchema,
    retryCount: z.number(),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();

    // パラメータを組み立て
    const errors = inputData.validation?.errors;

    if (errors && errors.length > 0) {
      logger?.info(
        `Retrying experience parameter building (attempt ${(inputData.retryCount || 0) + 1})`,
      );
    } else {
      logger?.info("Building experience parameters...");
    }

    const experienceParams = await buildExperienceParams(inputData.experienceList, errors);

    // バリデーション
    const validation = validateExperience(experienceParams);

    // リトライカウントを更新
    const retryCount = (inputData.retryCount || 0) + 1;

    if (validation.isValid) {
      logger?.info("✅ Experience parsed successfully!");
    } else {
      logger?.warn(
        `⚠️ Experience validation failed: ${validation.errors?.join(", ") || "Unknown error"}`,
      );
    }

    return {
      experienceParams,
      validation,
      retryCount,
      experienceList: inputData.experienceList,
    };
  },
});

/**
 * 職歴解析とパラメータ化のワークフロー
 * 解析 → パラメータ組み立て・バリデーション（リトライループ付き）
 */
export const experienceWorkflow = createWorkflow({
  id: "experience-workflow",
  description: "Parse and process experience with validation retry",
  inputSchema: z.object({
    resumeContent: z.string(),
  }),
  outputSchema: z.object({
    experienceParams: ExperienceApiParamsListSchema,
  }),
})
  // まず職歴を解析（1回のみ）
  .then(parseExperienceStep)
  // パラメータ組み立てとバリデーションをリトライループで実行
  .dountil(buildAndValidateStep, async ({ inputData }) => {
    return inputData.validation?.isValid === true || inputData.retryCount >= 5;
  })
  // 最終的な出力を整形
  .then(
    createStep({
      id: "format-output",
      description: "Format the final output",
      inputSchema: z.object({
        experienceParams: ExperienceApiParamsListSchema,
        validation: ValidationResultSchema,
        retryCount: z.number(),
      }),
      outputSchema: z.object({
        experienceParams: ExperienceApiParamsListSchema,
      }),
      execute: async ({ inputData, mastra }) => {
        const logger = mastra?.getLogger();

        if (!inputData.validation.isValid) {
          logger?.error(`Experience validation failed after ${inputData.retryCount} attempts`);
          throw new Error("Experience validation failed. Parse experience failed. Please retry.");
        }

        return {
          experienceParams: inputData.experienceParams,
        };
      },
    }),
  )
  .commit();
