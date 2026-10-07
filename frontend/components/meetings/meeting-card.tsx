import Link from "next/link";
import { CalendarDays, Clock3, Users } from "lucide-react";

import type { Meeting } from "@/types";

type MeetingCardProps = {
  meeting: Meeting;
};

function formatMeetingDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes} min`;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.length > 1
    ? `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
    : (words[0]?.slice(0, 2) ?? "?").toUpperCase();
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  const participants = meeting.participants ?? [];

  return (
    <Link
      aria-label={`Open meeting: ${meeting.title}`}
      className="group flex min-h-56 flex-col rounded-xl border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      href={`/meetings/${meeting.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="line-clamp-2 text-base font-semibold leading-6 text-heading transition-colors group-hover:text-primary">
          {meeting.title}
        </h2>
        <span className="shrink-0 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-primary">
          Meeting
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays aria-hidden="true" className="size-3.5" />
          {formatMeetingDate(meeting.meeting_date)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock3 aria-hidden="true" className="size-3.5" />
          {formatDuration(meeting.duration_seconds)}
        </span>
      </div>

      <p className="mt-4 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">
        {meeting.summary?.trim() || "No summary is available for this meeting."}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex min-w-0 items-center">
          {participants.length > 0 ? (
            <div aria-label={`${participants.length} participants`} className="flex items-center">
              {participants.slice(0, 4).map((participant, index) => (
                <span
                  aria-label={participant}
                  className={`flex size-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold text-slate-700 ${
                    index === 0 ? "bg-violet-100" : index === 1 ? "bg-sky-100" : index === 2 ? "bg-amber-100" : "bg-emerald-100"
                  } ${index > 0 ? "-ml-2" : ""}`}
                  key={`${participant}-${index}`}
                  title={participant}
                >
                  {getInitials(participant)}
                </span>
              ))}
              {participants.length > 4 ? (
                <span className="-ml-2 flex size-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-semibold text-slate-600">
                  +{participants.length - 4}
                </span>
              ) : null}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">No participants listed</span>
          )}
        </div>
        <span className="ml-3 inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <Users aria-hidden="true" className="size-3.5" />
          {participants.length}
        </span>
      </div>
    </Link>
  );
}
