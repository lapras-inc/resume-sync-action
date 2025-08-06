import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import type { ExperienceApiParamsList, ExperienceList, ValidationResult } from "../../types";
import { buildExperienceParams } from "../agents/experienceParamsBuilderAgent";
import { parseExperiences } from "../agents/experienceParseAgent";
import { validateExperienceStep } from "./steps/validateExperienceStep";

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
    experienceList: z.custom<ExperienceList>(),
  }),
  execute: async ({ inputData }) => {
    const experienceList = await parseExperiences(inputData.resumeContent);
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
    experienceList: z.custom<ExperienceList>(),
    validation: z.custom<ValidationResult>().optional(),
  }),
  outputSchema: z.object({
    experienceParams: z.custom<ExperienceApiParamsList>(),
    validation: z.custom<ValidationResult>(),
  }),
  execute: async ({ inputData }) => {
    // パラメータを組み立て
    const errors = inputData.validation?.errors;
    const experienceParams = await buildExperienceParams(inputData.experienceList, errors);

    // バリデーション
    const validation = validateExperienceStep(experienceParams);

    // リトライカウントを更新
    const retryCount = (inputData.validation?.retryCount ?? 0) + 1;

    return {
      experienceParams,
      validation: {
        ...validation,
        retryCount,
      },
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
    experienceParams: z.custom<ExperienceApiParamsList>(),
  }),
})
  // まず職歴を解析（1回のみ）
  .then(parseExperienceStep)
  // パラメータ組み立てとバリデーションをリトライループで実行
  .dountil(buildAndValidateStep, async ({ inputData }) => {
    // バリデーションが成功するか、3回リトライしたら終了
    return inputData.validation?.isValid === true || inputData.validation?.retryCount >= 3;
  })
  // 最終的な出力を整形
  .then(
    createStep({
      id: "format-output",
      description: "Format the final output",
      inputSchema: z.object({
        experienceParams: z.custom<ExperienceApiParamsList>(),
        validation: z.custom<ValidationResult>(),
      }),
      outputSchema: z.object({
        experienceParams: z.custom<ExperienceApiParamsList>(),
      }),
      execute: async ({ inputData }) => {
        if (!inputData.validation.isValid && inputData.validation.retryCount >= 3) {
          console.warn(
            "Experience validation failed after 3 retries:",
            inputData.validation.errors,
          );
        }
        return {
          experienceParams: inputData.experienceParams,
        };
      },
    }),
  )
  .commit();
