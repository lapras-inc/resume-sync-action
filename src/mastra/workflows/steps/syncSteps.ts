import type { ExperienceApiParamsList, JobSummary, LaprasState, WantToDo } from "../../../types";
import {
  createExperience,
  deleteAllExperiences,
  restoreLaprasState,
  updateJobSummary as updateJobSummaryApi,
  updateWantToDo as updateWantToDoApi,
} from "../../../utils/laprasApiClient";

/**
 * 既存の職歴をすべて削除するステップ
 */
export async function deleteExperiencesStep(): Promise<void> {
  console.log("Deleting all existing experiences...");
  await deleteAllExperiences();
  console.log("All experiences deleted successfully");
}

/**
 * 新しい職歴を同期するステップ
 */
export async function syncExperiencesStep(params: ExperienceApiParamsList): Promise<{
  success: boolean;
  errors?: string[];
}> {
  console.log(`Syncing ${params.experiences.length} experiences...`);
  const errors: string[] = [];

  for (let i = 0; i < params.experiences.length; i++) {
    const exp = params.experiences[i];
    try {
      await createExperience(exp);
      console.log(`Experience ${i + 1}/${params.experiences.length} created successfully`);
    } catch (error) {
      const errorMsg = `Failed to create experience ${i + 1}: ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMsg);
      errors.push(errorMsg);
    }
  }

  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * 職務要約を更新するステップ
 */
export async function updateJobSummaryStep(jobSummary: JobSummary): Promise<{
  success: boolean;
  error?: string;
}> {
  console.log("Updating job summary...");
  try {
    await updateJobSummaryApi(jobSummary);
    console.log("Job summary updated successfully");
    return { success: true };
  } catch (error) {
    const errorMsg = `Failed to update job summary: ${error instanceof Error ? error.message : String(error)}`;
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * 今後のキャリア目標を更新するステップ
 */
export async function updateWantToDoStep(wantToDo: WantToDo): Promise<{
  success: boolean;
  error?: string;
}> {
  console.log("Updating want to do...");
  try {
    await updateWantToDoApi(wantToDo);
    console.log("Want to do updated successfully");
    return { success: true };
  } catch (error) {
    const errorMsg = `Failed to update want to do: ${error instanceof Error ? error.message : String(error)}`;
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * ロールバックステップ（元の状態に戻す）
 */
export async function rollbackStep(originalState: LaprasState): Promise<void> {
  console.log("Rolling back to original state...");
  try {
    await restoreLaprasState(originalState);
    console.log("Successfully rolled back to original state");
  } catch (error) {
    console.error("Failed to rollback:", error);
    throw new Error(
      `Critical error: Failed to rollback to original state. Manual intervention may be required. ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
