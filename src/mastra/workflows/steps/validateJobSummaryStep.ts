import type { JobSummary, ValidationResult } from "../../../types";

/**
 * 職務要約の機械的バリデーション
 * AIを使わずに、純粋なロジックで検証を行う
 */
export function validateJobSummaryStep(jobSummary: JobSummary): ValidationResult {
  const errors: string[] = [];

  if (jobSummary.job_summary) {
    // 文字数制限チェック（最大10,000文字）
    if (jobSummary.job_summary.length > 10000) {
      errors.push(
        `職務要約が長すぎます（現在: ${jobSummary.job_summary.length}文字、最大: 10,000文字）`,
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    retryCount: 0,
  };
}
