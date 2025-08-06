import type { LaprasState } from "../../../types";

/**
 * LAPRAS状態をフォーマットして可読性の高い文字列に変換
 */
export function formatState(state: LaprasState): string {
  const experiences = state.experience_list
    .map(
      (exp) =>
        `- ${exp.organization_name} (${exp.start_year}/${exp.start_month} - ${
          exp.end_year || "現在"
        }/${exp.end_month || ""})
  ${exp.position_name}
  ${exp.description}`,
    )
    .join("\n\n");

  return `# LAPRAS Career State

## 職歴
${experiences}

## 職務要約
${state.job_summary}

## 今後やりたいこと
${state.want_to_do}`;
}
