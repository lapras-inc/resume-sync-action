import { join } from "path";
import artifactClient from "@actions/artifact";
import * as core from "@actions/core";
import { writeFile } from "fs/promises";
import { createPatch } from "diff";
import { getEnvironmentVariable } from "../config/environment";

export interface WorkflowResult {
  artifacts: {
    before: string;
    after: string;
  };
}

/**
 * Artifactをアップロード
 */
async function uploadArtifacts(before: string, after: string, diff: string): Promise<void> {
  const artifactName = "lapras-sync-results";
  const tmpDir = getEnvironmentVariable('RUNNER_TEMP') || "/tmp";
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
export async function handleWorkflowOutput(result: WorkflowResult): Promise<void> {
  core.info("Creating artifacts...");

  // 差分を生成
  const diff = generateDiff(result.artifacts.before, result.artifacts.after);
  console.log("🔍 Diff:");
  console.log(diff);

  // Artifactをアップロード（diffも含む）
  await uploadArtifacts(result.artifacts.before, result.artifacts.after, diff);

  // GitHub Actionsのアウトプットを設定
  setActionOutputs(result.artifacts.before, result.artifacts.after, diff);

  await core.summary.write();
}
