import type { Experience, LaprasState } from "../types";

const BASE_URL = "https://lapras.com/api/mcp";

export const getCurrentLaprasState = async (): Promise<LaprasState> => {
  const headers = {
    Authorization: `Bearer ${process.env.LAPRAS_API_KEY}`,
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
