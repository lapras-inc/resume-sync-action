import { Agent } from "@mastra/core";
import { ParsedResumeSchema } from "../../types";
import { selectLLMModel } from "../../utils/llmSelector";

/**
 * 職務経歴書を解析して構造化データに変換するエージェント
 */
export const parseAgent = new Agent({
  name: "resume-parser",
  instructions: `あなたは職務経歴書を解析し、構造化データに変換するアシスタントです。

以下のルールに従って解析してください：

1. **職歴の抽出(experience_list)**
   - 職務経歴書全体から職歴セクションを特定し、各職歴を時系列で抽出する
      - 会社名、役職、期間、業務内容を正確に抽出
      - 受託開発の場合は、クライアント企業名も抽出
   - experience_listとしてプロジェクト or 会社ごとなど期間を把握できる単位で文字列の配列で返す。内容は誇張せず、職務経歴書記載の内容をそのまま返す
   - もし該当する内容がない場合は空の配列を返す

2. **キャリアビジョンの抽出(want_to_do)**
   - 職務経歴書全体から以下の内容を抽出する
      - ​近い将来やりたい仕事・技術・業界・事業内容、働きたい環境 (チーム感、使用ツールや技術など)
      - 仕事でやりがいを感じること
      - 将来の夢や長期的な展望
      - 希望する働き方 (ワークライフバランスや裁量など)
   - want_to_doとして内容を文字列で返す。誇張せず、職務経歴書記載の内容をそのまま返す
   - もし該当する内容がない場合は空文字列を返す

3. **職務要約の抽出(job_summary)**
   - 職務経歴書全体から以下の内容を抽出する
      - 過去何をやっていたか
      - 今どのような環境で何を頑張っているのか
      - 転職した場合はその理由や背景
      - 業務での実績
      - キャリアの中で一貫した軸
   - job_summaryとして内容を文字列で返す。誇張せず、職務経歴書記載の内容をそのまま返す
   - もし該当する内容がない場合は空文字列を返す

重要:
- 該当する内容がない場合は誇張や創作をせず空文字列を返す
- 職務経歴書に記載されていない内容は空文字列を返す`,
  model: () => selectLLMModel(),
});

/**
 * 職務経歴書を解析する
 */
export async function parseResume(resumeContent: string) {
  const result = await parseAgent.generate(
    `以下の職務経歴書を解析して、構造化データに変換してください。

# 職務経歴書
${resumeContent}`,
    {
      output: ParsedResumeSchema,
      maxRetries: 3,
    },
  );

  return result.object;
}
