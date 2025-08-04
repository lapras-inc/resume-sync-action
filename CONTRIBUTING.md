# Contributing to LAPRAS Resume Sync Action

## 開発環境のセットアップ

```bash
# リポジトリのクローン
git clone https://github.com/lapras-inc/resume-sync-action.git
cd resume-sync-action

# 依存関係のインストール
npm install
```

## 開発コマンド

```bash
# ビルド (GitHub Action用のdist/index.jsを生成)
npm run build

# Lint + フォーマットのチェック
npm run check

# mastraのローカル開発サーバーの起動
npm run dev
```

## リリース方法

1. コードの変更を実装し、テストを確認
2. `npm run check`でLintとフォーマットをチェック
3. `npm run build`でdistディレクトリを更新
4. 変更内容（srcとdist両方）をコミット
5. セマンティックバージョニングに従ってタグを作成
   ```bash
   git tag -a v1.0.1 -m "Release v1.0.1"
   git push origin v1.0.1
   ```
6. GitHub Actions でリリースが作成される

## Pull Requestのガイドライン

- 変更前に必ず`npm run build`を実行し、dist/index.jsを更新してください
- すべてのコードは`npm run check`を通過する必要があります
- コミットメッセージは明確で簡潔に
