import { Agent } from "@mastra/core/agent";
import type { z } from "zod";
import type { LaprasStateSchema, ParsedResumeSchema } from "../../types";
import { selectLLMModel } from "../../utils/llmSelector";
import { getMCPClient } from "../../utils/mcpHelper";

/**
 * LAPRASへの同期を実行するエージェント
 */
export const syncExecutorAgent = new Agent({
  name: "lapras-sync-executor",
  instructions: `あなたは受け取った職務経歴書の内容をLAPRAS MCP Serverを使って、LAPRASに同期するアシスタントです。

## 同期手順
1. 職歴(experience_list)
- LAPRAS上の現在の職歴の状態と、新しい職歴の内容を比較して、適切なツールを利用してLAPRASの職歴に同期する
- 同じような期間・内容の職歴がLAPRASの職歴に既にある場合 -> 現在の職歴のidと対応する新しい職歴の内容をもとに update_experience ツールを実行する
- LAPRASの職歴には存在しない新しい職歴がある場合 -> create_experience ツールを実行する
- LAPRASの職歴には存在するが、新しい職歴にはない場合 -> delete_experience ツールを実行する

2. 活かせる経験・スキル(want_to_do)
- 新しい活かせる経験・スキルの内容を update_want_to_do ツールを実行して同期する
- もし、新しい活かせる経験・スキルがない場合は、何もしない

3. 職務要約(job_summary)
- 新しい職務要約の内容を update_job_summary ツールを実行して同期する
- もし、新しい職務要約がない場合は、何もしない

## 重要:
- **内容の誇張はしない。正確に同期する**
- 職歴のdescriptionと活かせる経験・スキル、職務要約は**markdown形式で構造化して同期する**
`,
  model: () => selectLLMModel(),
  tools: async () => await getMCPClient().getTools(),
});

/**
 * 同期を実行する
 */
export async function executeSync(
  parsedResume: z.infer<typeof ParsedResumeSchema>,
  currentState: z.infer<typeof LaprasStateSchema>,
) {
  const result = await syncExecutorAgent.generate(
    `以下の職務経歴書の内容をLAPRASに同期してください。

** 1. 職歴**
現在のLAPRASの職歴:
${JSON.stringify(currentState.experience_list, null, 2)}

新しい職務経歴書の内容:
${JSON.stringify(parsedResume.experience_list, null, 2)}

** 2. 活かせる経験・スキル**
新しい職務経歴書の内容:
${parsedResume.want_to_do}

** 3. 職務要約**
新しい職務経歴書の内容:
${parsedResume.job_summary}

## 重要:
- **内容の誇張はしない。正確に同期する**
- experience_listのdescription, want_to_do, job_summaryの内容は読みやすいように**markdown形式で構造化して同期する**
`,
  );
  return result;
}
