import { Agent } from "@mastra/core";
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
   - 完全なマッピングリスト：
     【ITエンジニア系】
     - フロントエンドエンジニア → id: 1
     - バックエンドエンジニア → id: 2
     - Webアプリケーションエンジニア → id: 3
     - インフラエンジニア → id: 4
     - SRE → id: 5
     - Android アプリエンジニア → id: 6
     - iOS アプリエンジニア → id: 7
     - モバイルエンジニア → id: 8
     - 機械学習エンジニア → id: 9
     - データサイエンティスト → id: 10
     - リサーチエンジニア → id: 15
     - QA・テストエンジニア → id: 16
     - アーキテクト → id: 17
     - システムエンジニア → id: 18
     - 組み込みエンジニア → id: 19
     - データベースエンジニア → id: 20
     - ネットワークエンジニア → id: 21
     - セキュリティエンジニア → id: 22
     - ゲームエンジニア → id: 24
     - コーポレートエンジニア → id: 26
     - データエンジニア → id: 28
     - CRE・テクニカルサポート → id: 29
     - セールスエンジニア・プリセールス → id: 30
     - ITエンジニアその他 → id: 32
     【管理・リーダー系】
     - プロジェクトマネージャー → id: 11
     - プロダクトマネージャー → id: 12
     - テックリード → id: 13
     - エンジニアリングマネージャー → id: 14
     - スクラムマスター → id: 23
     - CTO → id: 25
     【デザイナー・制作系】
     - デザイナーその他 → id: 27
     - UI/UXデザイナー → id: 33
     - Webデザイナー → id: 34
     - ゲームデザイナー → id: 35
     - 動画制作・編集 → id: 36
     - アートディレクター → id: 42
     【プロデューサー・ディレクター系】
     - Webプロデューサー・ディレクター → id: 37
     - Webコンテンツ企画・編集・ライティング → id: 38
     - ゲームプロデューサー・ディレクター → id: 39
     - プロダクトマーケティングマネージャー → id: 40
     - 動画プロデューサー・ディレクター → id: 41
     - PM/ディレクターその他 → id: 43
     【営業系】
     - 営業 → id: 44
     - 法人営業 → id: 45
     - 個人営業 → id: 46
     - 営業企画 → id: 47
     - 営業事務 → id: 48
     - 代理店営業 → id: 49
     - インサイドセールス → id: 50
     - セールスその他 → id: 51
     【事業開発系】
     - 事業企画 → id: 52
     - 経営企画 → id: 53
     - 新規事業開発 → id: 54
     - 事業開発その他 → id: 55
     【カスタマーサクセス・サポート系】
     - カスタマーサクセス → id: 56
     - カスタマーサポート → id: 57
     - ヘルプデスク → id: 58
     - コールセンター管理・運営 → id: 59
     - カスタマーサクセス・サポートその他 → id: 60
     【マーケティング系】
     - 広報・PR・広告宣伝 → id: 61
     - リサーチ・データ分析 → id: 62
     - 商品企画・開発 → id: 63
     - 販促 → id: 64
     - MD・VMD・バイヤー → id: 65
     - Web広告運用・SEO・SNS運用 → id: 66
     - CRM → id: 67
     - 広報・マーケティングその他 → id: 68
     【経営系】
     - 経営者・CEO・COO等 → id: 69
     - CFO → id: 70
     - CIO → id: 71
     - 監査役 → id: 72
     - 経営・CXOその他 → id: 73
     【コーポレート系】
     - 経理 → id: 74
     - 財務 → id: 75
     - 法務 → id: 76
     - 総務 → id: 77
     - 労務 → id: 78
     - 秘書 → id: 79
     - 事務 → id: 80
     - コーポレートその他 → id: 81
     【人事系】
     - 採用 → id: 82
     - 人材開発・人材育成・研修 → id: 83
     - 制度企画・組織開発 → id: 84
     - 労務・給与 → id: 85
     - 人事その他 → id: 86
     【コンサルタント系】
     - システムコンサルタント → id: 87
     - パッケージ導入コンサルタント → id: 88
     - セキュリティコンサルタント → id: 89
     - ネットワークコンサルタント → id: 90
     - ITコンサルタントその他 → id: 91
     - 戦略コンサルタント → id: 92
     - DXコンサルタント → id: 93
     - 財務・会計コンサルタント → id: 94
     - 組織・人事コンサルタント → id: 95
     - 業務プロセスコンサルタント → id: 96
     - 物流コンサルタント → id: 97
     - リサーチャー・調査員 → id: 98
     - コンサルタントその他 → id: 99
     - その他 → id: 100

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
