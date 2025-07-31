import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createExperience,
  deleteExperience,
  getCurrentLaprasState,
  updateJobSummary,
  updateWantToDo,
} from "./laprasApiClient";

// fetch関数のモック
global.fetch = vi.fn();

describe("laprasApiClient", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("LAPRAS_API_KEY", "test-api-key");
  });

  describe("getCurrentLaprasState", () => {
    it("現在の状態を正しく取得する", async () => {
      // Arrange
      const mockExperiencesResponse = {
        experience_list: [
          {
            id: 1,
            organization_name: "Test Company",
            position_name: "Engineer",
          },
        ],
      };
      const mockJobSummaryResponse = {
        job_summary: "test summary",
      };
      const mockWantToDoResponse = {
        want_to_do: "test want to do",
      };

      // 3つの並列APIコールをモック
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => mockExperiencesResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => mockJobSummaryResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => mockWantToDoResponse,
        } as Response);

      // Act
      const result = await getCurrentLaprasState();

      // Assert
      expect(result).toEqual({
        ...mockExperiencesResponse,
        ...mockJobSummaryResponse,
        ...mockWantToDoResponse,
      });
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it("APIエラー時に適切なエラーをスローする", async () => {
      // Arrange
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      } as Response);

      // Act & Assert
      await expect(getCurrentLaprasState()).rejects.toThrow();
    });
  });

  describe("deleteExperience", () => {
    it("職務経歴を正しく削除する", async () => {
      // Arrange
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ success: true }),
      } as Response);

      // Act
      await deleteExperience(123);

      // Assert
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/experiences/123"),
        expect.objectContaining({
          method: "DELETE",
          headers: expect.objectContaining({
            Authorization: "Bearer test-api-key",
            "Content-Type": "application/json",
          }),
        }),
      );
    });
  });

  describe("createExperience", () => {
    it("新規職務経歴を正しく作成する", async () => {
      // Arrange
      const experienceData = {
        organization_name: "New Company",
        position_name: "Senior Engineer",
        positions: [{ id: 1 }],
        is_client_work: false,
        start_year: 2024,
        start_month: 1,
        end_year: 0,
        end_month: 0,
        description: "Test description",
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ id: 456, ...experienceData }),
      } as Response);

      // Act
      const result = await createExperience(experienceData);

      // Assert
      expect(result).toEqual({ id: 456, ...experienceData });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/experiences"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-api-key",
            "Content-Type": "application/json",
          }),
          body: JSON.stringify(experienceData),
        }),
      );
    });
  });

  describe("updateJobSummary", () => {
    it("ジョブサマリーを正しく更新する", async () => {
      // Arrange
      const jobSummary = "Updated job summary";

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ job_summary: jobSummary }),
      } as Response);

      // Act
      await updateJobSummary({ job_summary: jobSummary });

      // Assert
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/job_summary"),
        expect.objectContaining({
          method: "PUT",
          headers: expect.objectContaining({
            Authorization: "Bearer test-api-key",
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({ job_summary: jobSummary }),
        }),
      );
    });
  });

  describe("updateWantToDo", () => {
    it("want_to_doを正しく更新する", async () => {
      // Arrange
      const wantToDo = "Updated want to do";

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ want_to_do: wantToDo }),
      } as Response);

      // Act
      await updateWantToDo({ want_to_do: wantToDo });

      // Assert
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/want_to_do"),
        expect.objectContaining({
          method: "PUT",
          headers: expect.objectContaining({
            Authorization: "Bearer test-api-key",
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({ want_to_do: wantToDo }),
        }),
      );
    });
  });
});
