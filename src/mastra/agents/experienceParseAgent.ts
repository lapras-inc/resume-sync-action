import { Agent } from "@mastra/core";
import { ExperienceListSchema } from "../../types";
import { selectLLMModel } from "../../utils/llmSelector";

/**
 * 職務経歴書から職歴情報を抽出するエージェント
 * 自然な形式で職歴を抽出し、後続のパラメータ組み立てエージェントが処理しやすい形に変換
 */
export const experienceParseAgent = new Agent({
  name: "experience-parser",
  instructions: `あなたは職務経歴書から職歴情報を抽出する専門のアシスタントです。

以下のルールに従って職歴を抽出してください：

1. **会社名(company_name)**
   - 所属した会社・組織名を正確に抽出
   - フリーランスの場合は「フリーランス」と記載

2. **役職名(position_name)**
   - 実際の役職名・ポジション名を抽出
   - 例：「フロントエンドエンジニア」「テックリード」「プロジェクトマネージャー」

3. **期間(start_date, end_date)**
   - 開始日：「2020年4月」のような年月形式で抽出
   - 終了日：「2023年3月」または継続中の場合は「現在」と記載
   - is_ongoing: 現在も継続中の場合はtrue

4. **クライアントワーク判定(is_client_work, client_name)**
   - 受託開発やクライアントワークの場合はis_client_work: true
   - クライアント企業名が記載されている場合はclient_nameに記載

5. **業務内容(description)**
   - 具体的な業務内容、プロジェクト内容、実績を抽出
   - 使用技術、チーム規模、成果なども含める
   - Markdown形式で整形して記載

重要:
- 時系列順（古い順）に抽出する
- 職務経歴書に記載されている内容をそのまま抽出する（誇張しない）
- 該当する内容がない場合は空の配列を返す`,
  model: () => selectLLMModel(),
});

/**
 * 職務経歴書から職歴を抽出する
 */
export async function parseExperiences(resumeContent: string) {
  const result = await experienceParseAgent.generate(
    `以下の職務経歴書から職歴情報を抽出してください。

# 職務経歴書
${resumeContent}`,
    {
      output: ExperienceListSchema,
      maxRetries: 3,
    },
  );

  return result.object;
}
