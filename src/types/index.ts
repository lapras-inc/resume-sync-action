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

// 型定義のエクスポート
export type Experience = z.infer<typeof ExperienceSchema>;
export type ParsedResume = z.infer<typeof ParsedResumeSchema>;
export type LaprasState = z.infer<typeof LaprasStateSchema>;
