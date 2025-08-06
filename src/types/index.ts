import { z } from "zod";

// LAPRAS API関連の型定義
export const PositionSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
});

export const ExperiencePositionSchema = z.object({
  id: z.number(),
  job_position_name: z.string(),
});

export const ExperienceSchema = z.object({
  id: z.number(),
  organization_name: z.string(),
  is_client_work: z.boolean(),
  client_company_name: z.string().nullable(),
  positions: z.array(ExperiencePositionSchema),
  position_name: z.string(),
  start_year: z.number(),
  start_month: z.number(),
  end_year: z.number().nullable(),
  end_month: z.number().nullable(),
  description: z.string(),
  updated_at: z.string(),
});

// 職務経歴書全体のスキーマ
export const ParsedResumeSchema = z.object({
  experience_list: z.array(
    z.object({
      start_year: z.number(),
      start_month: z.number(),
      end_year: z.number().nullable(),
      end_month: z.number().nullable(),
      description: z.string(),
    }),
  ),
  want_to_do: z.string(),
  job_summary: z.string(),
});

// LAPRAS現在状態のスキーマ
export const LaprasStateSchema = z.object({
  experience_list: z.array(ExperienceSchema),
  want_to_do: z.string(),
  job_summary: z.string(),
});

// Phase 1: 新しい個別スキーマの定義
// 自然言語解析の出力（人間が理解しやすい形式）
export const ParsedExperienceSchema = z.object({
  company_name: z.string(),
  position_name: z.string(),
  start_date: z.string(), // "2020年4月" のような形式
  end_date: z.string().optional(), // "現在" または "2023年3月"
  is_ongoing: z.boolean(),
  is_client_work: z.boolean(),
  client_name: z.string().optional(),
  description: z.string(),
});

export const ExperienceListSchema = z.object({
  experiences: z.array(ParsedExperienceSchema),
});

export const JobSummarySchema = z.object({
  job_summary: z.string(),
});

export const WantToDoSchema = z.object({
  want_to_do: z.string(),
});

// APIパラメータ形式のスキーマ
export const ExperienceApiParamsSchema = z.object({
  organization_name: z.string(),
  positions: z.array(z.object({ id: z.number() })),
  position_name: z.string().optional(),
  start_year: z.number(),
  start_month: z.number(),
  end_year: z.number(), // 0 if ongoing
  end_month: z.number(), // 0 if ongoing
  is_client_work: z.boolean(),
  client_company_name: z.string().optional(),
  description: z.string(),
});

export const ExperienceApiParamsListSchema = z.object({
  experiences: z.array(ExperienceApiParamsSchema),
});

// バリデーション結果のスキーマ
export const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.string()).optional(),
  retryCount: z.number().default(0),
});

export const SyncResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  errors: z.array(z.string()).optional(),
  artifacts: z.object({
    before: z.string(),
    after: z.string(),
  }),
});

// 型定義のエクスポート
export type Experience = z.infer<typeof ExperienceSchema>;
export type ParsedResume = z.infer<typeof ParsedResumeSchema>;
export type LaprasState = z.infer<typeof LaprasStateSchema>;
export type ParsedExperience = z.infer<typeof ParsedExperienceSchema>;
export type ExperienceList = z.infer<typeof ExperienceListSchema>;
export type JobSummary = z.infer<typeof JobSummarySchema>;
export type WantToDo = z.infer<typeof WantToDoSchema>;
export type ExperienceApiParams = z.infer<typeof ExperienceApiParamsSchema>;
export type ExperienceApiParamsList = z.infer<typeof ExperienceApiParamsListSchema>;
export type ValidationResult = z.infer<typeof ValidationResultSchema>;
export type SyncResult = z.infer<typeof SyncResultSchema>;
