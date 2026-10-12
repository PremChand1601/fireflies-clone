import { API_URL } from "@/lib/api";
import { MeetingsApiError } from "@/lib/api/meetings";

import type { Chapter } from "@/types";

async function getApiError(
  response: Response,
  fallback: string,
): Promise<MeetingsApiError> {
  const body: unknown = await response.json().catch(() => null);

  let message = `${fallback} (${response.status})`;

  if (typeof body === "object" && body !== null && "detail" in body) {
    const detail = body.detail;

    if (typeof detail === "string") {
      message = detail;
    } else if (Array.isArray(detail)) {
      message = detail
        .map((issue) => {
          if (
            typeof issue === "object" &&
            issue !== null &&
            "msg" in issue
          ) {
            return String(issue.msg);
          }

          return "Invalid request.";
        })
        .join(" ");
    }
  }

  return new MeetingsApiError(message, response.status);
}

export async function getMeetingChapters(
  meetingId: number,
  signal?: AbortSignal,
): Promise<Chapter[]> {
  const response = await fetch(
    `${API_URL}/api/meetings/${meetingId}/chapters`,
    { signal },
  );

  if (!response.ok) {
    throw await getApiError(response, "Could not load chapters");
  }

  return (await response.json()) as Chapter[];
}