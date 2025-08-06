import { API_CONFIG } from "../config/constants";
import { getEnvironmentVariable } from "../config/environment";
import type { Experience, ExperienceApiParams, JobSummary, LaprasState, WantToDo } from "../types";

const BASE_URL = API_CONFIG.LAPRAS_BASE_URL;

/**
 * 共通のAPIヘッダーを取得
 */
const getApiHeaders = () => {
  const apiKey = getEnvironmentVariable("LAPRAS_API_KEY");
  if (!apiKey) {
    throw new Error("LAPRAS_API_KEY is not set in environment variables");
  }
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
};

/**
 * APIエラーハンドリング
 */
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LAPRAS API Error (${response.status}): ${errorText}`);
  }
  return response.json();
};

/**
 * 現在のLAPRAS状態を取得
 */
export const getCurrentLaprasState = async (): Promise<LaprasState> => {
  const headers = getApiHeaders();

  const [experiences, jobSummary, wantToDo] = (await Promise.all([
    fetch(`${BASE_URL}/experiences`, { headers }).then(handleApiResponse),
    fetch(`${BASE_URL}/job_summary`, { headers }).then(handleApiResponse),
    fetch(`${BASE_URL}/want_to_do`, { headers }).then(handleApiResponse),
  ])) as [
    {
      experience_list: Experience[];
    },
    {
      job_summary: string;
    },
    {
      want_to_do: string;
    },
  ];

  return {
    ...experiences,
    ...jobSummary,
    ...wantToDo,
  };
};

/**
 * 職歴を追加
 */
export const createExperience = async (params: ExperienceApiParams): Promise<Experience> => {
  const headers = getApiHeaders();
  const response = await fetch(`${BASE_URL}/experiences`, {
    method: "POST",
    headers,
    body: JSON.stringify(params),
  });
  return handleApiResponse(response) as Promise<Experience>;
};

/**
 * 職歴を更新
 */
export const updateExperience = async (
  experienceId: number,
  params: ExperienceApiParams,
): Promise<Experience> => {
  const headers = getApiHeaders();
  const response = await fetch(`${BASE_URL}/experiences/${experienceId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(params),
  });
  return handleApiResponse(response) as Promise<Experience>;
};

/**
 * 職歴を削除
 */
export const deleteExperience = async (experienceId: number): Promise<void> => {
  const headers = getApiHeaders();
  const response = await fetch(`${BASE_URL}/experiences/${experienceId}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete experience ${experienceId}: ${errorText}`);
  }
};

/**
 * すべての職歴を削除
 */
export const deleteAllExperiences = async (): Promise<void> => {
  const state = await getCurrentLaprasState();
  const deletePromises = state.experience_list.map((exp) => deleteExperience(exp.id));
  await Promise.all(deletePromises);
};

/**
 * 職務要約を更新
 */
export const updateJobSummary = async (jobSummary: JobSummary): Promise<void> => {
  const headers = getApiHeaders();
  const response = await fetch(`${BASE_URL}/job_summary`, {
    method: "PUT",
    headers,
    body: JSON.stringify(jobSummary),
  });
  await handleApiResponse(response);
};

/**
 * 今後のキャリア目標を更新
 */
export const updateWantToDo = async (wantToDo: WantToDo): Promise<void> => {
  const headers = getApiHeaders();
  const response = await fetch(`${BASE_URL}/want_to_do`, {
    method: "PUT",
    headers,
    body: JSON.stringify(wantToDo),
  });
  await handleApiResponse(response);
};

/**
 * LAPRASの状態を完全に更新（ロールバック用）
 */
export const restoreLaprasState = async (state: LaprasState): Promise<void> => {
  // 既存の職歴をすべて削除
  await deleteAllExperiences();

  // 職歴を復元
  for (const exp of state.experience_list) {
    const params: ExperienceApiParams = {
      organization_name: exp.organization_name,
      positions: exp.positions.map((p) => ({ id: p.id })),
      position_name: exp.position_name,
      start_year: exp.start_year,
      start_month: exp.start_month,
      end_year: exp.end_year ?? 0,
      end_month: exp.end_month ?? 0,
      is_client_work: exp.is_client_work,
      client_company_name: exp.client_company_name ?? undefined,
      description: exp.description,
    };
    await createExperience(params);
  }

  // 職務要約と今後のキャリア目標を復元
  await Promise.all([
    updateJobSummary({ job_summary: state.job_summary }),
    updateWantToDo({ want_to_do: state.want_to_do }),
  ]);
};
