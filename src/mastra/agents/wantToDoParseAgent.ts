import { Agent } from "@mastra/core";
import { WantToDoSchema } from "../../types";
import { selectLLMModel } from "../../utils/llmSelector";

/**
 * 職務経歴書から今後のキャリア目標を抽出するエージェント
 */
export const wantToDoParseAgent = new Agent({
  name: "want-to-do-parser",
  instructions: `あなたは職務経歴書から今後のキャリア目標・希望を抽出する専門のアシスタントです。

以下の観点から「今後やりたいこと」を抽出してください：

抽出する内容
- 近い将来やりたい仕事・技術・業界・事業内容
- 働きたい環境 (チーム感、使用ツールや技術など)
- 仕事でやりがいを感じること
- 将来の夢や長期的な展望
- 希望する働き方 (ワークライフバランスや裁量など)　

重要:
- 最大1,000文字以内で作成
- 職務経歴書に記載されていない内容は含めない
- 抽出する内容の記載がない場合は空文字列を返す
- 対象者が自分で書いたような文章にする（ただし、私は・・という書き出しにはしない）`,
  model: () => selectLLMModel(),
});

/**
 * 職務経歴書から今後のキャリア目標を抽出する
 */
export async function parseWantToDo(resumeContent: string) {
  const result = await wantToDoParseAgent.generateVNext(
    `以下の職務経歴書から今後のキャリア目標・希望を抽出してください。

# 職務経歴書
${resumeContent}`,
    {
      output: WantToDoSchema,
      maxRetries: 3,
    },
  );

  return result.object;
}
