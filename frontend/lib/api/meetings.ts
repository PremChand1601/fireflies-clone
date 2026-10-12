import { API_URL } from "@/lib/api";

import type {
  MeetingCreatePayload,
  MeetingDetail,
  MeetingFilters,
  MeetingListResponse,
  MeetingUpdatePayload,
  TranscriptSegment,
} from "@/types";

export class MeetingsApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "MeetingsApiError";
  }
}

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
          if (typeof issue === "object" && issue !== null && "msg" in issue) {
            return String(issue.msg);
          }

          return "Invalid request.";
        })
        .join(" ");
    }
  }

  return new MeetingsApiError(message, response.status);
}

export async function getMeetings(
  filters: MeetingFilters,
): Promise<MeetingListResponse> {
  const searchParams = new URLSearchParams();

  if (filters.q) {
    searchParams.set("q", filters.q);
  }

  searchParams.set("sort", filters.sort);

  if (filters.participant) {
    searchParams.set("participant", filters.participant);
  }

  if (filters.date_from) {
    searchParams.set("date_from", filters.date_from);
  }

  if (filters.date_to) {
    searchParams.set("date_to", filters.date_to);
  }

  const response = await fetch(
    `${API_URL}/api/meetings?${searchParams.toString()}`,
  );

  if (!response.ok) {
    throw await getApiError(response, "Could not load meetings");
  }

  return (await response.json()) as MeetingListResponse;
}

export async function getMeeting(
  meetingId: number,
  signal?: AbortSignal,
): Promise<MeetingDetail> {
  const response = await fetch(
    `${API_URL}/api/meetings/${meetingId}`,
    { signal },
  );

  if (!response.ok) {
    throw await getApiError(response, "Could not load meeting");
  }

  return (await response.json()) as MeetingDetail;
}

export async function createMeeting(
  payload: MeetingCreatePayload,
): Promise<MeetingDetail> {
  const response = await fetch(`${API_URL}/api/meetings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await getApiError(response, "Could not create meeting");
  }

  return (await response.json()) as MeetingDetail;
}

export async function updateMeeting({
  meetingId,
  payload,
}: {
  meetingId: number;
  payload: MeetingUpdatePayload;
}): Promise<MeetingDetail> {
  const response = await fetch(
    `${API_URL}/api/meetings/${meetingId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw await getApiError(response, "Could not update meeting");
  }

  return (await response.json()) as MeetingDetail;
}

export async function deleteMeeting(
  meetingId: number,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/meetings/${meetingId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw await getApiError(response, "Could not delete meeting");
  }
}

export async function getTranscript(
  meetingId: number,
  signal?: AbortSignal,
): Promise<TranscriptSegment[]> {
  const response = await fetch(
    `${API_URL}/api/meetings/${meetingId}/transcript`,
    { signal },
  );

  if (!response.ok) {
    throw await getApiError(response, "Could not load transcript");
  }

  return (await response.json()) as TranscriptSegment[];
}