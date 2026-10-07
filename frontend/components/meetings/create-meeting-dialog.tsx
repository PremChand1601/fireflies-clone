"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMeeting } from "@/hooks/use-meetings";
import { formatApiError } from "@/lib/api";

type CreateMeetingContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const CreateMeetingContext = createContext<CreateMeetingContextValue | null>(null);

function toIsoDateTime(date: string, time: string): string {
  const normalized = time.includes(":") ? (time.length === 5 ? `${time}:00` : time) : "09:00:00";
  return `${date}T${normalized}`;
}

const emptyForm = {
  title: "",
  date: "",
  time: "09:00",
  durationMinutes: "30",
  participants: "",
  summary: "",
};

export function CreateMeetingProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);

  return (
    <CreateMeetingContext.Provider value={value}>
      {children}
      <CreateMeetingDialog />
    </CreateMeetingContext.Provider>
  );
}

export function useCreateMeetingDialog() {
  const context = useContext(CreateMeetingContext);
  if (!context) {
    throw new Error("useCreateMeetingDialog must be used within CreateMeetingProvider");
  }
  return context;
}

function CreateMeetingDialog() {
  const router = useRouter();
  const { open, setOpen } = useCreateMeetingDialog();
  const createMeeting = useCreateMeeting();
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  function resetForm() {
    setForm(emptyForm);
    setFormError(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
      createMeeting.reset();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const title = form.title.trim();
    const durationMinutes = Number(form.durationMinutes);
    if (!title) {
      setFormError("Title is required.");
      return;
    }
    if (!form.date) {
      setFormError("Date is required.");
      return;
    }
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      setFormError("Duration must be a positive number of minutes.");
      return;
    }

    const participants = form.participants
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);

    try {
      const meeting = await createMeeting.mutateAsync({
        title,
        meeting_date: toIsoDateTime(form.date, form.time),
        duration_seconds: Math.round(durationMinutes * 60),
        participants,
        summary: form.summary.trim() || null,
      });
      toast.success("Meeting created");
      resetForm();
      setOpen(false);
      router.push(`/meetings/${meeting.id}`);
    } catch (error) {
      setFormError(formatApiError(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg" aria-describedby="create-meeting-description">
        <DialogHeader>
          <DialogTitle>New meeting</DialogTitle>
          <DialogDescription id="create-meeting-description">
            Add a recorded meeting to this workspace. Transcripts and media can be attached later.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="meeting-title">Title</Label>
            <Input
              id="meeting-title"
              name="title"
              placeholder="Product strategy review"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="meeting-date">Date</Label>
              <Input
                id="meeting-date"
                name="date"
                type="date"
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="meeting-time">Time</Label>
              <Input
                id="meeting-time"
                name="time"
                type="time"
                value={form.time}
                onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="meeting-duration">Duration (minutes)</Label>
            <Input
              id="meeting-duration"
              name="duration"
              type="number"
              min={1}
              value={form.durationMinutes}
              onChange={(event) =>
                setForm((current) => ({ ...current, durationMinutes: event.target.value }))
              }
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="meeting-participants">Participants</Label>
            <Input
              id="meeting-participants"
              name="participants"
              placeholder="Maya Chen, Jordan Hale"
              value={form.participants}
              onChange={(event) =>
                setForm((current) => ({ ...current, participants: event.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground">Separate names with commas.</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="meeting-summary">Summary</Label>
            <Textarea
              id="meeting-summary"
              name="summary"
              placeholder="What was discussed?"
              value={form.summary}
              onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
            />
          </div>
          {formError ? (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMeeting.isPending}>
              {createMeeting.isPending ? "Creating..." : "Create meeting"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
