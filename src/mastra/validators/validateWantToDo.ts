import type { ValidationResult, WantToDo } from "../../types";

/**
 * 今後のキャリア目標の機械的バリデーション
 * AIを使わずに、純粋なロジックで検証を行う
 */
export function validateWantToDo(wantToDo: WantToDo): ValidationResult {
  const errors: string[] = [];

  if (wantToDo.want_to_do) {
    // 文字数制限チェック（最大1,000文字）
    if (wantToDo.want_to_do.length > 1000) {
      errors.push(
        `今後のキャリア目標が長すぎます（現在: ${wantToDo.want_to_do.length}文字、最大: 1,000文字）`,
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
