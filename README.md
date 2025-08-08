# LAPRAS Resume Sync Action（α版）

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/lapras-inc/resume-sync-action?style=flat-square)](https://github.com/lapras-inc/resume-sync-action/releases)
[![License](https://img.shields.io/github/license/lapras-inc/resume-sync-action?style=flat-square)](LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/lapras-inc/resume-sync-action?style=flat-square)](https://github.com/lapras-inc/resume-sync-action/issues)
[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-Resume%20Sync%20Action-blue?style=flat-square&logo=github)](https://github.com/marketplace/actions/lapras-resume-sync-action)

> [!WARNING]
> このプロジェクトはα版です。機能や仕様が予告なく変更される可能性があります。本番環境での使用は推奨しません。

GitHubで管理している職務経歴書を[LAPRAS](https://lapras.com)のCareer情報に自動同期するGitHub Actionです。

指定したパスの職務経歴書の情報をもとに[LAPRASのCareerページ](https://lapras.com/cv)の以下情報を更新します。
- 職務経歴
- 今後のキャリアでやりたいこと
- 職務要約
- 活かせる経験スキル (近日対応予定)
- Tech Skill (近日対応予定)


## Usage

### APIキーの取得

1. **LAPRAS APIキー**の取得
   - [LAPRAS](https://lapras.com)にログイン
   - [設定画面](https://lapras.com/config/api-key)からMCP Server用のAPIキーを発行

2. **LLM APIキー**の取得（以下のいずれか1つ）
   - [OpenAI API Key](https://platform.openai.com/api-keys)
   - [Anthropic API Key](https://console.anthropic.com/)
   - [Google AI API Key](https://makersuite.google.com/app/apikey)

### GitHub Actionsの設定

```yaml
name: Sync Resume to LAPRAS

on:
  push:
    branches:
      - main
      - master
    paths:
      - 'resume.md' # 職務経歴書markdownファイルのパスを指定
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4

      - name: Sync Resume to LAPRAS
        uses: lapras-inc/resume-sync-action@v0.0.7
        with:
          resume_path: ./resume.md # 職務経歴書markdownファイルのパス
          lapras_api_key: ${{ secrets.LAPRAS_API_KEY }} # LAPRASの設定画面で発行したAPIキー
          openai_api_key: ${{ secrets.OPENAI_API_KEY }} # OpenAIのAPIキー（AnthropicやGoogle AIの場合はanthropic_api_keyやGOOGLE_GENERATIVE_AI_API_KEYを使用）
```

## Options

| Parameter | Required | Description |
|---------|------|------|
| `resume_path` | True | 職務経歴書Markdownファイルのパス |
| `lapras_api_key` | True | LAPRAS APIキー |
| `openai_api_key` | False* | OpenAI APIキー |
| `anthropic_api_key` | False* | Anthropic APIキー |
| `GOOGLE_GENERATIVE_AI_API_KEY` | False* | Google AI APIキー |
| `llm_model` | False | 使用するLLMモデル名 |

* LLMキーのいずれか1つが必須です。

## Outputs

| Output Name | Description |
|-------|------|
| `before_state` | 同期前のLAPRASのCareer情報 |
| `after_state` | 同期後のLAPRASのCareer情報 |
| `diff` | 変更内容のサマリー |

## Artifacts

同期完了後、以下のファイルがArtifactsとして保存されます：

- `before.md` - 同期前のLAPRASプロフィール
- `after.md` - 同期後のLAPRASプロフィール
- `diff.md` - 変更内容のサマリー

## Troubleshooting

### Error: "No LLM API key provided"

LLMのAPIキーが設定されていません。`openai_api_key`、`anthropic_api_key`、`GOOGLE_GENERATIVE_AI_API_KEY`のいずれか1つを設定してください。

## License

MIT License

## Support

- [Issues](https://github.com/lapras-inc/resume-sync-action/issues)
- [Discussions](https://github.com/lapras-inc/resume-sync-action/discussions)
