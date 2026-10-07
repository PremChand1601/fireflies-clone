"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "radix-ui";
import { LoaderCircle, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeleteMeeting, useUpdateMeeting } from "@/hooks/use-meetings";
import type { MeetingDetail } from "@/types";

type MeetingActionsProps = {
  meeting: MeetingDetail;
};

function toLocalDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

function formatApiError(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function MeetingActions({ meeting }: MeetingActionsProps) {
  const router = useRouter();
  const updateMeeting = useUpdateMeeting(meeting.id);
  const deleteMeeting = useDeleteMeeting(meeting.id);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [title, setTitle] = useState(meeting.title);
  const [meetingDate, setMeetingDate] = useState(() => toLocalDateTime(meeting.meeting_date));
  const [durationMinutes, setDurationMinutes] = useState(
    () => String(meeting.duration_seconds / 60),
  );
  const [participants, setParticipants] = useState((meeting.participants ?? []).join(", "));
  const [summary, setSummary] = useState(meeting.summary ?? "");
  const [formError, setFormError] = useState<string | null>(null);

  function openEdit() {
    setTitle(meeting.title);
    setMeetingDate(toLocalDateTime(meeting.meeting_date));
    setDurationMinutes(String(meeting.duration_seconds / 60));
    setParticipants((meeting.participants ?? []).join(", "));
    setSummary(meeting.summary ?? "");
    setFormError(null);
    updateMeeting.reset();
    setIsEditOpen(true);
  }

  async function submitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedTitle = title.trim();
    const parsedMinutes = Number(durationMinutes);

    if (!normalizedTitle) {
      setFormError("Enter a meeting title.");
      return;
    }
    if (normalizedTitle.length > 255) {
      setFormError("Meeting title must be 255 characters or fewer.");
      return;
    }
    if (!meetingDate || Number.isNaN(new Date(meetingDate).getTime())) {
      setFormError("Choose a valid meeting date and time.");
      return;
    }
    if (!Number.isInteger(parsedMinutes) || parsedMinutes < 1) {
      setFormError("Duration must be a whole number of minutes greater than zero.");
      return;
    }

    setFormError(null);
    try {
      await updateMeeting.mutateAsync({
        title: normalizedTitle,
        meeting_date: new Date(meetingDate).toISOString(),
        duration_seconds: parsedMinutes * 60,
        participants: participants
          .split(",")
          .map((participant) => participant.trim())
          .filter(Boolean),
        summary: summary.trim() || null,
      });
      toast.success("Meeting updated");
      setIsEditOpen(false);
    } catch (error) {
      setFormError(formatApiError(error, "Could not update the meeting. Please try again."));
    }
  }

  async function confirmDelete() {
    try {
      await deleteMeeting.mutateAsync();
      toast.success("Meeting deleted");
      setIsDeleteOpen(false);
      router.push("/meetings");
    } catch (error) {
      toast.error(formatApiError(error, "Could not delete the meeting"));
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button onClick={openEdit} size="sm" type="button" variant="outline">
          <Pencil aria-hidden="true" />
          Edit
        </Button>
        <Button
          aria-label="Delete meeting"
          onClick={() => setIsDeleteOpen(true)}
          size="icon"
          title="Delete meeting"
          type="button"
          variant="ghost"
        >
          <Trash2 aria-hidden="true" className="text-destructive" />
        </Button>
      </div>

      <Dialog.Root
        onOpenChange={(open) => {
          if (!updateMeeting.isPending) setIsEditOpen(open);
        }}
        open={isEditOpen}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <Dialog.Content
            aria-describedby="edit-meeting-description"
            className="fixed left-1/2 top-1/2 z-[61] max-h-[90vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-white p-5 shadow-2xl outline-none sm:p-7"
            onEscapeKeyDown={(event) => {
              if (updateMeeting.isPending) event.preventDefault();
            }}
            onPointerDownOutside={(event) => {
              if (updateMeeting.isPending) event.preventDefault();
            }}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="text-xl font-semibold tracking-tight text-heading">
                  Edit meeting
                </Dialog.Title>
                <Dialog.Description
                  className="mt-1.5 text-sm leading-6 text-muted-foreground"
                  id="edit-meeting-description"
                >
                  Update this meeting’s details.
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <Button
                  aria-label="Close dialog"
                  disabled={updateMeeting.isPending}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <X aria-hidden="true" />
                </Button>
              </Dialog.Close>
            </div>

            <form className="space-y-4" noValidate onSubmit={submitEdit}>
              <div className="space-y-2">
                <Label htmlFor="edit-meeting-title">Meeting title</Label>
                <Input
                  autoFocus
                  id="edit-meeting-title"
                  maxLength={255}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                  value={title}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-meeting-date">Date and time</Label>
                  <Input
                    id="edit-meeting-date"
                    onChange={(event) => setMeetingDate(event.target.value)}
                    required
                    type="datetime-local"
                    value={meetingDate}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-meeting-duration">Duration (minutes)</Label>
                  <Input
                    id="edit-meeting-duration"
                    min="1"
                    onChange={(event) => setDurationMinutes(event.target.value)}
                    required
                    step="1"
                    type="number"
                    value={durationMinutes}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-meeting-participants">Participants</Label>
                <Input
                  id="edit-meeting-participants"
                  onChange={(event) => setParticipants(event.target.value)}
                  placeholder="Names or emails, separated by commas"
                  value={participants}
                />
                <p className="text-xs text-muted-foreground">
                  Separate each participant with a comma.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-meeting-summary">Summary</Label>
                <textarea
                  className="flex min-h-24 w-full resize-y rounded-lg border border-border bg-white px-3 py-2 text-sm text-heading shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
                  id="edit-meeting-summary"
                  onChange={(event) => setSummary(event.target.value)}
                  placeholder="Add a short summary (optional)"
                  value={summary}
                />
              </div>
              {formError ? (
                <p aria-live="polite" className="text-sm font-medium text-destructive" role="alert">
                  {formError}
                </p>
              ) : null}
              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <Button
                  disabled={updateMeeting.isPending}
                  onClick={() => setIsEditOpen(false)}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button disabled={updateMeeting.isPending} type="submit">
                  {updateMeeting.isPending ? (
                    <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                  ) : null}
                  {updateMeeting.isPending ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root
        onOpenChange={(open) => {
          if (!deleteMeeting.isPending) setIsDeleteOpen(open);
        }}
        open={isDeleteOpen}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-[2px]" />
          <Dialog.Content
            aria-describedby="delete-meeting-description"
            className="fixed left-1/2 top-1/2 z-[61] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-white p-6 shadow-2xl outline-none"
            onEscapeKeyDown={(event) => {
              if (deleteMeeting.isPending) event.preventDefault();
            }}
            onPointerDownOutside={(event) => {
              if (deleteMeeting.isPending) event.preventDefault();
            }}
          >
            <Dialog.Title className="text-lg font-semibold text-heading">
              Delete this meeting?
            </Dialog.Title>
            <Dialog.Description
              className="mt-2 text-sm leading-6 text-muted-foreground"
              id="delete-meeting-description"
            >
              <span className="font-medium text-heading">{meeting.title}</span> and its related
              transcript, action items, and chapters will be permanently deleted. This action
              cannot be undone.
            </Dialog.Description>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                disabled={deleteMeeting.isPending}
                onClick={() => setIsDeleteOpen(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                className="bg-destructive text-white hover:bg-destructive/90"
                disabled={deleteMeeting.isPending}
                onClick={() => void confirmDelete()}
                type="button"
                variant="destructive"
              >
                {deleteMeeting.isPending ? (
                  <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  <Trash2 aria-hidden="true" />
                )}
                {deleteMeeting.isPending ? "Deleting…" : "Delete meeting"}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
