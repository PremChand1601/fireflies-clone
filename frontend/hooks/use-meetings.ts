"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createMeetingActionItem,
  deleteActionItem,
  getMeetingActionItems,
  updateActionItem,
} from "@/lib/api/action-items";

import { getMeetingChapters } from "@/lib/api/chapters";

import {
  createMeeting,
  deleteMeeting,
  getMeeting,
  getMeetings,
  getTranscript,
  updateMeeting,
} from "@/lib/api/meetings";

import type {
  ActionItemCreatePayload,
  ActionItemUpdatePayload,
  MeetingCreatePayload,
  MeetingFilters,
  MeetingUpdatePayload,
} from "@/types";

export function useMeetings(filters: MeetingFilters) {
  return useQuery({
    queryKey: ["meetings", filters],
    queryFn: () => getMeetings(filters),
  });
}

export function useMeeting(meetingId: number) {
  return useQuery({
    queryKey: ["meeting", meetingId],
    queryFn: ({ signal }) => getMeeting(meetingId, signal),
    enabled: Number.isInteger(meetingId) && meetingId > 0,
  });
}

export function useUpdateMeeting(meetingId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MeetingUpdatePayload) =>
      updateMeeting({ meetingId, payload }),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["meeting", meetingId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["meetings"],
        }),
      ]);
    },
  });
}

export function useDeleteMeeting(meetingId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteMeeting(meetingId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["meetings"],
      });

      queryClient.removeQueries({
        queryKey: ["meeting", meetingId],
      });
    },
  });
}

export function useMeetingTranscript(meetingId: number) {
  return useQuery({
    queryKey: ["meeting-transcript", meetingId],
    queryFn: ({ signal }) => getTranscript(meetingId, signal),
    enabled: Number.isInteger(meetingId) && meetingId > 0,
  });
}

export function useMeetingActionItems(meetingId: number) {
  return useQuery({
    queryKey: ["meeting-action-items", meetingId],
    queryFn: ({ signal }) =>
      getMeetingActionItems(meetingId, signal),
    enabled: Number.isInteger(meetingId) && meetingId > 0,
  });
}

export function useMeetingChapters(meetingId: number) {
  return useQuery({
    queryKey: ["meeting-chapters", meetingId],
    queryFn: ({ signal }) =>
      getMeetingChapters(meetingId, signal),
    enabled: Number.isInteger(meetingId) && meetingId > 0,
  });
}

export function useCreateMeetingActionItem(meetingId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ActionItemCreatePayload) =>
      createMeetingActionItem({
        meetingId,
        payload,
      }),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["meeting-action-items", meetingId],
      }),
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
    }) =>
      updateActionItem({
        actionItemId,
        payload,
      }),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["meeting-action-items", meetingId],
      }),
  });
}

export function useDeleteActionItem(meetingId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteActionItem,

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["meeting-action-items", meetingId],
      }),
  });
}

export function useCreateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MeetingCreatePayload) =>
      createMeeting(payload),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["meetings"],
      }),
  });
}