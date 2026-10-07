"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_URL } from "@/lib/api";
import type {
  ActionItem,
  ActionItemCreatePayload,
  ActionItemUpdatePayload,
  Chapter,
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

async function getApiError(response: Response, fallback: string): Promise<MeetingsApiError> {
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

async function postMeeting(payload: MeetingCreatePayload) {
  const response = await fetch(`${API_URL}/api/meetings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await getApiError(response, "Could not create meeting");
  }

  return response.json();
}

async function putMeeting({
  meetingId,
  payload,
}: {
  meetingId: number;
  payload: MeetingUpdatePayload;
}): Promise<MeetingDetail> {
  const response = await fetch(`${API_URL}/api/meetings/${meetingId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw await getApiError(response, "Could not update meeting");
  }
  return (await response.json()) as MeetingDetail;
}

async function removeMeeting(meetingId: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/meetings/${meetingId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw await getApiError(response, "Could not delete meeting");
  }
}

async function fetchMeeting(meetingId: number, signal: AbortSignal): Promise<MeetingDetail> {
  const response = await fetch(`${API_URL}/api/meetings/${meetingId}`, { signal });
  if (!response.ok) {
    throw await getApiError(response, "Could not load meeting");
  }
  return (await response.json()) as MeetingDetail;
}

async function fetchTranscript(
  meetingId: number,
  signal: AbortSignal,
): Promise<TranscriptSegment[]> {
  const response = await fetch(`${API_URL}/api/meetings/${meetingId}/transcript`, { signal });
  if (!response.ok) {
    throw await getApiError(response, "Could not load transcript");
  }
  return (await response.json()) as TranscriptSegment[];
}

async function fetchMeetingActionItems(
  meetingId: number,
  signal: AbortSignal,
): Promise<ActionItem[]> {
  const response = await fetch(`${API_URL}/api/meetings/${meetingId}/action-items`, { signal });
  if (!response.ok) {
    throw await getApiError(response, "Could not load action items");
  }
  return (await response.json()) as ActionItem[];
}

async function fetchMeetingChapters(meetingId: number, signal: AbortSignal): Promise<Chapter[]> {
  const response = await fetch(`${API_URL}/api/meetings/${meetingId}/chapters`, { signal });
  if (!response.ok) {
    throw await getApiError(response, "Could not load chapters");
  }
  return (await response.json()) as Chapter[];
}

async function createMeetingActionItem({
  meetingId,
  payload,
}: {
  meetingId: number;
  payload: ActionItemCreatePayload;
}): Promise<ActionItem> {
  const response = await fetch(`${API_URL}/api/meetings/${meetingId}/action-items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw await getApiError(response, "Could not add action item");
  }
  return (await response.json()) as ActionItem;
}

async function updateActionItem({
  actionItemId,
  payload,
}: {
  actionItemId: number;
  payload: ActionItemUpdatePayload;
}): Promise<ActionItem> {
  const response = await fetch(`${API_URL}/api/action-items/${actionItemId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw await getApiError(response, "Could not update action item");
  }
  return (await response.json()) as ActionItem;
}

async function deleteActionItem(actionItemId: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/action-items/${actionItemId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw await getApiError(response, "Could not delete action item");
  }
}

async function fetchMeetings(filters: MeetingFilters): Promise<MeetingListResponse> {
  const searchParams = new URLSearchParams();
  if (filters.q) searchParams.set("q", filters.q);
  searchParams.set("sort", filters.sort);
  if (filters.participant) searchParams.set("participant", filters.participant);
  if (filters.date_from) searchParams.set("date_from", filters.date_from);
  if (filters.date_to) searchParams.set("date_to", filters.date_to);

  const response = await fetch(`${API_URL}/api/meetings?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error(`Could not load meetings (${response.status})`);
  }

  return (await response.json()) as MeetingListResponse;
}

export function useMeetings(filters: MeetingFilters) {
  return useQuery({
    queryKey: ["meetings", filters],
    queryFn: () => fetchMeetings(filters),
  });
}

export function useMeeting(meetingId: number) {
  return useQuery({
    queryKey: ["meeting", meetingId],
    queryFn: ({ signal }) => fetchMeeting(meetingId, signal),
    enabled: Number.isInteger(meetingId) && meetingId > 0,
  });
}

export function useUpdateMeeting(meetingId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MeetingUpdatePayload) => putMeeting({ meetingId, payload }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["meeting", meetingId] }),
        queryClient.invalidateQueries({ queryKey: ["meetings"] }),
      ]);
    },
  });
}

export function useDeleteMeeting(meetingId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => removeMeeting(meetingId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.removeQueries({ queryKey: ["meeting", meetingId] });
    },
  });
}

export function useMeetingTranscript(meetingId: number) {
  return useQuery({
    queryKey: ["meeting-transcript", meetingId],
    queryFn: ({ signal }) => fetchTranscript(meetingId, signal),
    enabled: Number.isInteger(meetingId) && meetingId > 0,
  });
}

export function useMeetingActionItems(meetingId: number) {
  return useQuery({
    queryKey: ["meeting-action-items", meetingId],
    queryFn: ({ signal }) => fetchMeetingActionItems(meetingId, signal),
    enabled: Number.isInteger(meetingId) && meetingId > 0,
  });
}

export function useMeetingChapters(meetingId: number) {
  return useQuery({
    queryKey: ["meeting-chapters", meetingId],
    queryFn: ({ signal }) => fetchMeetingChapters(meetingId, signal),
    enabled: Number.isInteger(meetingId) && meetingId > 0,
  });
}

export function useCreateMeetingActionItem(meetingId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ActionItemCreatePayload) =>
      createMeetingActionItem({ meetingId, payload }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["meeting-action-items", meetingId] }),
  });
}

export function useUpdateActionItem(meetingId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      actionItemId,
      payload,
    }: {
      actionItemId: number;
      payload: ActionItemUpdatePayload;
    }) => updateActionItem({ actionItemId, payload }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["meeting-action-items", meetingId] }),
  });
}

export function useDeleteActionItem(meetingId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteActionItem,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["meeting-action-items", meetingId] }),
  });
}

export function useCreateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postMeeting,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meetings"] }),
  });
}
