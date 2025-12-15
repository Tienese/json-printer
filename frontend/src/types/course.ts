/**
 * DTO for Canvas course data from API.
 * Represents minimal course data for dashboard display.
 * Maps to GET /api/v1/courses response.
 */
export interface Course {
  id: number;
  name: string;
  courseCode: string;
  workflowState: string;
}
