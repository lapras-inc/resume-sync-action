import { Agent } from "@mastra/core";
import { POSITION_TYPE_MAPPING } from "../../config/constants";
import { ExperienceApiParamsListSchema, type ExperienceList } from "../../types";
import { selectLLMModel } from "../../utils/llmSelector";

/**
 * 自然言語の職歴情報をLAPRAS APIパラメータ形式に変換するエージェント
 * ポジションタイプIDのマッピングと日付形式の正規化を行う
 */
export const experienceParamsBuilderAgent = new Agent({
  name: "experience-params-builder",
  instructions: `あなたは職歴情報をLAPRAS APIパラメータ形式に変換する専門のアシスタントです。

以下のルールに従ってパラメータを組み立ててください：

1. **組織名(organization_name)**
   - company_nameの値をそのまま使用

2. **ポジションタイプ(positions)**
   - position_nameから適切なポジションタイプIDを選択
   - 複数該当する場合は配列で複数指定可能
   - マッピングリスト：${JSON.stringify(POSITION_TYPE_MAPPING, null, 2)}

3. **役職名(position_name)**
   - 元のposition_nameをそのまま使用（任意フィールド）

4. **期間の変換**
   - start_date「2020年4月」→ start_year: 2020, start_month: 4
   - end_date「2023年3月」→ end_year: 2023, end_month: 3
   - end_date「現在」またはis_ongoing: true → end_year: 0, end_month: 0

5. **クライアントワーク(is_client_work, client_company_name)**
   - is_client_workの値をそのまま使用
   - client_nameがある場合はclient_company_nameに設定

6. **詳細説明(description)**
   - 元のdescriptionをそのまま使用

重要:
- 年月の整合性を保つ（開始日は終了日より前）
- 継続中の職歴はend_year: 0, end_month: 0に設定
- ポジションタイプIDは1-100の範囲内で選択`,
  model: () => selectLLMModel(),
});

/**
 * 自然言語の職歴情報をAPIパラメータに変換する
 */
export async function buildExperienceParams(
  experienceList: ExperienceList,
  validationErrors?: string[],
) {
  const prompt = validationErrors?.length
    ? `以下の職歴情報をLAPRAS APIパラメータ形式に変換してください。

前回のバリデーションエラー:
${validationErrors.join("\n")}

これらのエラーを修正して、正しいパラメータを生成してください。

# 職歴情報
${JSON.stringify(experienceList, null, 2)}`
    : `以下の職歴情報をLAPRAS APIパラメータ形式に変換してください。

# 職歴情報
${JSON.stringify(experienceList, null, 2)}`;

  const result = await experienceParamsBuilderAgent.generate(prompt, {
    output: ExperienceApiParamsListSchema,
    maxRetries: 3,
  });

  return result.object;
}
