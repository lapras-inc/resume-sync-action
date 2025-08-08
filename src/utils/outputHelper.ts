import artifactClient from "@actions/artifact";
import * as core from "@actions/core";
import { createPatch } from "diff";
import { writeFile } from "fs/promises";
import { join } from "path";
import { getEnvironmentVariable } from "../config/environment";
import type { SyncResult } from "../types";

/**
 * Artifactをアップロード
 */
async function uploadArtifacts(before: string, after: string, diff: string): Promise<void> {
  const artifactName = "lapras-sync-results";
  const tmpDir = getEnvironmentVariable("RUNNER_TEMP") || "/tmp";
  const beforePath = join(tmpDir, "before.md");
  const afterPath = join(tmpDir, "after.md");
  const diffPath = join(tmpDir, "diff.patch");

  await writeFile(beforePath, before);
  await writeFile(afterPath, after);
  await writeFile(diffPath, diff);

  const files = [beforePath, afterPath, diffPath];
  await artifactClient.uploadArtifact(artifactName, files, tmpDir);
}

/**
 * GitHub Actionsのアウトプットを設定
 */
function setActionOutputs(before: string, after: string, diff: string): void {
  core.setOutput("before_state", before);
  core.setOutput("after_state", after);
  core.setOutput("diff", diff);
}

/**
 * 差分を生成
 */
function generateDiff(before: string, after: string): string {
  return createPatch("LAPRAS Career", before, after, "Before", "After");
}

/**
 * ワークフローの結果を処理してアウトプットを設定
 */
export async function handleWorkflowOutput(result: SyncResult): Promise<void> {
  core.info("📦 Creating artifacts...");

  // 差分を生成
  const diff = generateDiff(result.artifacts.before, result.artifacts.after);

  // 差分のサマリーを表示
  const diffLines = diff.split("\n");
  let addedCount = 0;
  let removedCount = 0;

  diffLines.forEach((line) => {
    if (line.startsWith("+") && !line.startsWith("+++")) addedCount++;
    if (line.startsWith("-") && !line.startsWith("---")) removedCount++;
  });

  core.info(`📊 Changes Summary:`);
  core.info(`  Added lines: ${addedCount}`);
  core.info(`  Removed lines: ${removedCount}`);

  core.info(`🔍 Diff:`);
  core.info(diff);

  // Artifactをアップロード（diffも含む）
  await uploadArtifacts(result.artifacts.before, result.artifacts.after, diff);
  core.info("✅ Artifacts uploaded successfully");

  core.info("--------------------------------");
  core.info("LAPRASへの同期が完了しました🎉 https://lapras.com/cv から結果をご確認ください！");

  // GitHub Actionsのアウトプットを設定
  setActionOutputs(result.artifacts.before, result.artifacts.after, diff);

  await core.summary.write();
}
