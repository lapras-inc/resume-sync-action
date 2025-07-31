import type { ExperienceApiParamsList, ValidationResult } from "../../types";

/**
 * 職歴パラメータの機械的バリデーション
 * AIを使わずに、純粋なロジックで検証を行う
 */
export function validateExperience(params: ExperienceApiParamsList): ValidationResult {
  const errors: string[] = [];

  if (!params.experiences || params.experiences.length === 0) {
    return {
      isValid: false,
      errors: ["職歴が1件も含まれていません"],
    };
  }

  for (let i = 0; i < params.experiences.length; i++) {
    const exp = params.experiences[i];
    const prefix = `職歴${i + 1}件目: `;

    // 必須フィールドの確認
    if (!exp.organization_name || exp.organization_name.trim() === "") {
      errors.push(`${prefix}組織名が設定されていません`);
    }

    if (!exp.positions || exp.positions.length === 0) {
      errors.push(`${prefix}ポジションタイプが設定されていません`);
    } else {
      // ポジションタイプIDの範囲チェック
      for (const pos of exp.positions) {
        if (pos.id < 1 || pos.id > 100) {
          errors.push(
            `${prefix}ポジションタイプID ${pos.id} は無効です（1-100の範囲で指定してください）`,
          );
        }
      }
    }

    // 年月の妥当性チェック
    if (!exp.start_year || exp.start_year < 1900 || exp.start_year > 2100) {
      errors.push(`${prefix}開始年が不正です: ${exp.start_year}`);
    }

    if (!exp.start_month || exp.start_month < 1 || exp.start_month > 12) {
      errors.push(`${prefix}開始月が不正です: ${exp.start_month}`);
    }

    // 終了日の検証（継続中の場合は0）
    if (exp.end_year !== 0) {
      if (exp.end_year < 1900 || exp.end_year > 2100) {
        errors.push(`${prefix}終了年が不正です: ${exp.end_year}`);
      }

      if (exp.end_month < 1 || exp.end_month > 12) {
        errors.push(`${prefix}終了月が不正です: ${exp.end_month}`);
      }

      // 開始日と終了日の整合性チェック
      const startDate = exp.start_year * 12 + exp.start_month;
      const endDate = exp.end_year * 12 + exp.end_month;
      if (startDate > endDate) {
        errors.push(
          `${prefix}開始日（${exp.start_year}年${exp.start_month}月）が終了日（${exp.end_year}年${exp.end_month}月）より後になっています`,
        );
      }
    } else {
      // 継続中の場合、end_monthも0である必要がある
      if (exp.end_month !== 0) {
        errors.push(`${prefix}継続中の職歴の場合、end_monthも0にする必要があります`);
      }
    }

    // クライアントワークの検証
    if (exp.is_client_work && (!exp.client_company_name || exp.client_company_name.trim() === "")) {
      errors.push(`${prefix}クライアントワークの場合、クライアント企業名が必須です`);
    }

    // 説明文の長さチェック
    if (exp.description && exp.description.length > 10000) {
      errors.push(`${prefix}説明文が長すぎます（最大10000文字）`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
