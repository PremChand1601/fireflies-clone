import { API_URL } from "@/lib/api";
import type {
  ActionItem,
  ActionItemCreatePayload,
  ActionItemUpdatePayload,
} from "@/types";

import { MeetingsApiError } from "@/lib/api/meetings";

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

export async function getMeetingActionItems(
  meetingId: number,
  signal?: AbortSignal,
): Promise<ActionItem[]> {
  const response = await fetch(
    `${API_URL}/api/meetings/${meetingId}/action-items`,
    { signal },
  );

  if (!response.ok) {
    throw await getApiError(response, "Could not load action items");
  }

  return (await response.json()) as ActionItem[];
}

export async function createMeetingActionItem({
  meetingId,
  payload,
}: {
  meetingId: number;
  payload: ActionItemCreatePayload;
}): Promise<ActionItem> {
  const response = await fetch(
    `${API_URL}/api/meetings/${meetingId}/action-items`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw await getApiError(response, "Could not add action item");
  }

  return (await response.json()) as ActionItem;
}

export async function updateActionItem({
  actionItemId,
  payload,
}: {
  actionItemId: number;
  payload: ActionItemUpdatePayload;
}): Promise<ActionItem> {
  const response = await fetch(
    `${API_URL}/api/action-items/${actionItemId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw await getApiError(response, "Could not update action item");
  }

  return (await response.json()) as ActionItem;
}

export async function deleteActionItem(
  actionItemId: number,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/action-items/${actionItemId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw await getApiError(response, "Could not delete action item");
  }
}