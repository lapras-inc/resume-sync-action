import type { Experience, LaprasState } from "../types";
import { getEnvironmentVariable } from "../config/environment";
import { API_CONFIG } from "../config/constants";

const BASE_URL = API_CONFIG.LAPRAS_BASE_URL;

export const getCurrentLaprasState = async (): Promise<LaprasState> => {
  const apiKey = getEnvironmentVariable('LAPRAS_API_KEY');
  if (!apiKey) {
    throw new Error('LAPRAS_API_KEY is not set in environment variables');
  }
  
  const headers = {
    Authorization: `Bearer ${apiKey}`,
  };
  
  const [experiences, jobSummary, wantToDo] = (await Promise.all(
    [
      fetch(`${BASE_URL}/experiences`, { headers }),
      fetch(`${BASE_URL}/job_summary`, { headers }),
      fetch(`${BASE_URL}/want_to_do`, { headers }),
    ].map((res) => res.then((res) => res.json())),
  )) as [
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
