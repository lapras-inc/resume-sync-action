import { API_CONFIG } from "../config/constants";
import { getEnvironmentVariable } from "../config/environment";
import type { Experience, ExperienceApiParams, JobSummary, LaprasState, WantToDo } from "../types";

const BASE_URL = API_CONFIG.LAPRAS_BASE_URL;

/**
 * HTTPメソッドの型定義
 */
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * APIクライアントのオプション
 */
interface ApiClientOptions {
  baseUrl: string;
  headers?: () => Record<string, string>;
  timeout?: number;
}

/**
 * リクエストオプション
 */
interface RequestOptions<T = unknown> {
  method?: HttpMethod;
  body?: T;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/**
 * 汎用APIクライアントクラス
 */
class ApiClient {
  private readonly baseUrl: string;
  private readonly getHeaders: () => Record<string, string>;
  private readonly timeout: number;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl;
    this.getHeaders = options.headers || (() => ({}));
    this.timeout = options.timeout || 30000;
  }

  /**
   * タイムアウト付きfetchラッパー
   */
  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: options.signal || controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * レスポンス処理
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return response.json() as Promise<T>;
    }

    // JSONでない場合はテキストとして返す
    return response.text() as Promise<T>;
  }

  /**
   * GETリクエスト
   */
  async get<T = unknown>(
    path: string,
    options?: Omit<RequestOptions, "method" | "body">,
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  /**
   * POSTリクエスト
   */
  async post<T = unknown, B = unknown>(
    path: string,
    body?: B,
    options?: Omit<RequestOptions<B>, "method" | "body">,
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  /**
   * PUTリクエスト
   */
  async put<T = unknown, B = unknown>(
    path: string,
    body?: B,
    options?: Omit<RequestOptions<B>, "method" | "body">,
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  /**
   * DELETEリクエスト
   */
  async delete<T = unknown>(
    path: string,
    options?: Omit<RequestOptions, "method" | "body">,
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }

  /**
   * 汎用リクエストメソッド
   */
  async request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
    const pathWithSource = path.includes("?")
      ? `${path}&${API_CONFIG.SOURCE_QUERY.substring(1)}`
      : `${path}${API_CONFIG.SOURCE_QUERY}`;
    const url = `${this.baseUrl}${pathWithSource}`;
    const headers = {
      ...this.getHeaders(),
      ...options.headers,
    };

    const fetchOptions: RequestInit = {
      method: options.method || "GET",
      headers,
    };

    if (options.body !== undefined) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await this.fetchWithTimeout(url, fetchOptions);
    return this.handleResponse<T>(response);
  }
}

/**
 * LAPRAS API用のクライアントインスタンス
 */
const laprasApiClient = new ApiClient({
  baseUrl: BASE_URL,
  headers: () => {
    const apiKey = getEnvironmentVariable("LAPRAS_API_KEY");
    if (!apiKey) {
      throw new Error("LAPRAS_API_KEY is not set in environment variables");
    }
    return {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
  },
  timeout: 30000,
});

/**
 * 現在のLAPRAS状態を取得
 */
export const getCurrentLaprasState = async (): Promise<LaprasState> => {
  const [experiences, jobSummary, wantToDo] = await Promise.all([
    laprasApiClient.get<{ experience_list: Experience[] }>("/experiences"),
    laprasApiClient.get<{ job_summary: string }>("/job_summary"),
    laprasApiClient.get<{ want_to_do: string }>("/want_to_do"),
  ]);

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
  return laprasApiClient.post<Experience>("/experiences", params);
};

/**
 * 職歴を更新
 */
export const updateExperience = async (
  experienceId: number,
  params: ExperienceApiParams,
): Promise<Experience> => {
  return laprasApiClient.put<Experience>(`/experiences/${experienceId}`, params);
};

/**
 * 職歴を削除
 */
export const deleteExperience = async (experienceId: number): Promise<void> => {
  await laprasApiClient.delete(`/experiences/${experienceId}`);
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
  await laprasApiClient.put("/job_summary", jobSummary);
};

/**
 * 今後のキャリア目標を更新
 */
export const updateWantToDo = async (wantToDo: WantToDo): Promise<void> => {
  await laprasApiClient.put("/want_to_do", wantToDo);
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
