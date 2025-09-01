import { Agent } from "@mastra/core";
import { JobSummarySchema } from "../../types";
import { selectLLMModel } from "../../utils/llmSelector";

/**
 * 職務経歴書から職務要約を抽出するエージェント
 */
export const jobSummaryParseAgent = new Agent({
  name: "job-summary-parser",
  instructions: `あなたは職務経歴書から職務要約を抽出する専門のアシスタントです。

以下の観点から職務要約を作成してください：

- 過去何をやっていたか
- 今どのような環境で何を頑張っているのか
- 転職した場合はその理由や背景
- 業務での実績
- キャリアの中で一貫した軸

重要:
- 職務経歴書の内容を基に、読みやすい文章として要約する
- 最大10,000文字以内で作成
- 職務経歴書に記載されていない内容は含めない
- 該当する内容がない場合は空文字列を返す
- 対象者が自分で書いたような文章にする（ただし、私は・・という書き出しにはしない）`,
  model: () => selectLLMModel(),
});

/**
 * 職務経歴書から職務要約を抽出する
 */
export async function parseJobSummary(resumeContent: string) {
  const result = await jobSummaryParseAgent.generateVNext(
    `以下の職務経歴書から職務要約を作成してください。

# 職務経歴書
${resumeContent}`,
    {
      output: JobSummarySchema,
      maxRetries: 3,
    },
  );

  return result.object;
}
