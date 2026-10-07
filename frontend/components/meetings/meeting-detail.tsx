"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  FileText,
  Lightbulb,
  ListChecks,
  MessageSquareText,
  RotateCw,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ActionItemsPanel } from "@/components/meetings/action-items-panel";
import { MeetingActions } from "@/components/meetings/meeting-actions";
import { MeetingPlayer } from "@/components/meetings/meeting-player";
import { TopicsPanel } from "@/components/meetings/topics-panel";
import { useMeeting, useMeetingTranscript, MeetingsApiError } from "@/hooks/use-meetings";
import { usePlayer } from "@/hooks/use-player";
import type { MeetingDetail as MeetingDetailData, TranscriptSegment } from "@/types";

type MeetingDetailProps = {
  meetingId: number;
};

const tabs = [
  { id: "summary", label: "Summary", icon: FileText },
  { id: "action-items", label: "Action Items", icon: ListChecks },
  { id: "topics", label: "Topics", icon: Sparkles },
] as const;

type DetailTab = (typeof tabs)[number]["id"];

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0 && remainingSeconds > 0) return `${minutes}m ${remainingSeconds}s`;
  if (minutes > 0) return `${minutes} min`;
  return `${remainingSeconds} sec`;
}

function formatTimestamp(seconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
    : `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.length > 1
    ? `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
    : (words[0]?.slice(0, 2) ?? "?").toUpperCase();
}

type TranscriptMatch = {
  segmentId: number;
  field: "speaker" | "text";
  occurrence: number;
};

function getKeyTakeaways(summary: string | null, meeting: MeetingDetailData): string[] {
  const summarySentences = (summary ?? "")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (summarySentences.length > 0) {
    return summarySentences.slice(0, 4);
  }

  return (meeting.transcript_segments ?? [])
    .slice()
    .sort((left, right) => left.sequence - right.sequence)
    .map((segment) => segment.text.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function findMatchRanges(value: string, query: string): { start: number; end: number }[] {
  if (!query) return [];
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matcher = new RegExp(escapedQuery, "gi");
  const ranges: { start: number; end: number }[] = [];
  let match: RegExpExecArray | null;

  while ((match = matcher.exec(value)) !== null) {
    ranges.push({ start: match.index, end: match.index + match[0].length });
  }
  return ranges;
}

function HighlightedText({
  value,
  query,
  isCurrentMatch,
}: {
  value: string;
  query: string;
  isCurrentMatch: (occurrence: number) => boolean;
}) {
  const ranges = findMatchRanges(value, query);
  if (ranges.length === 0) return <>{value}</>;

  let lastIndex = 0;
  return (
    <>
      {ranges.map((range, occurrence) => {
        const before = value.slice(lastIndex, range.start);
        lastIndex = range.end;
        return (
          <span key={`${range.start}-${range.end}`}>
            {before}
            <mark
              className={`rounded px-0.5 ${
                isCurrentMatch(occurrence)
                  ? "bg-orange-300 text-slate-950 ring-1 ring-orange-500"
                  : "bg-amber-100 text-slate-900"
              }`}
            >
              {value.slice(range.start, range.end)}
            </mark>
          </span>
        );
      })}
      {value.slice(lastIndex)}
    </>
  );
}

function MeetingMetadata({ meeting }: { meeting: MeetingDetailData }) {
  const participants = meeting.participants ?? [];

  return (
    <div className="mt-5 flex flex-col gap-4 border-b border-border pb-6">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <CalendarDays aria-hidden="true" className="size-4 text-slate-400" />
          {formatDate(meeting.meeting_date)}
        </span>
        <span className="inline-flex items-center gap-2">
          <Clock3 aria-hidden="true" className="size-4 text-slate-400" />
          {formatDuration(meeting.duration_seconds)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <Users aria-hidden="true" className="size-4" />
          {participants.length} {participants.length === 1 ? "participant" : "participants"}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {participants.map((participant, index) => (
            <span
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 text-xs font-medium text-slate-700"
              key={`${participant}-${index}`}
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-violet-100 text-[10px] font-semibold text-primary">
                {getInitials(participant)}
              </span>
              {participant}
            </span>
          ))}
          {participants.length === 0 ? (
            <span className="text-xs text-muted-foreground">No participants listed</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function TranscriptPanel({
  meetingId,
  currentTime,
  seek,
}: {
  meetingId: number;
  currentTime: number;
  seek: (time: number) => void;
}) {
  const transcriptQuery = useMeetingTranscript(meetingId);
  const transcriptRows = useRef(new Map<number, HTMLButtonElement>());
  const [search, setSearch] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const transcriptSegments = transcriptQuery.data ?? [];
  const normalizedSearch = search.trim();
  const transcriptMatches = useMemo(() => {
    if (!normalizedSearch) return [];
    const matches: TranscriptMatch[] = [];

    [...transcriptSegments]
      .sort((left, right) => left.sequence - right.sequence)
      .forEach((segment) => {
        findMatchRanges(segment.speaker, normalizedSearch).forEach((_, occurrence) => {
          matches.push({ segmentId: segment.id, field: "speaker", occurrence });
        });
        findMatchRanges(segment.text, normalizedSearch).forEach((_, occurrence) => {
          matches.push({ segmentId: segment.id, field: "text", occurrence });
        });
      });

    return matches;
  }, [normalizedSearch, transcriptSegments]);
  const selectedMatchIndex =
    transcriptMatches.length > 0 ? currentMatchIndex % transcriptMatches.length : 0;
  const selectedMatch =
    transcriptMatches.length > 0
      ? transcriptMatches[selectedMatchIndex]
      : undefined;
  const activeSegment = transcriptSegments
    .filter(
      (segment) =>
        Number.isFinite(segment.timestamp_seconds) && segment.timestamp_seconds <= currentTime,
    )
    .reduce<TranscriptSegment | null>((active, segment) => {
      if (
        active === null ||
        segment.timestamp_seconds > active.timestamp_seconds ||
        (segment.timestamp_seconds === active.timestamp_seconds &&
          segment.sequence > active.sequence)
      ) {
        return segment;
      }
      return active;
    }, null);
  const activeSegmentId = activeSegment?.id;

  useEffect(() => {
    if (activeSegmentId === undefined) return;
    transcriptRows.current.get(activeSegmentId)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [activeSegmentId]);

  useEffect(() => {
    setCurrentMatchIndex(0);
  }, [normalizedSearch]);

  useEffect(() => {
    if (selectedMatch) {
      transcriptRows.current.get(selectedMatch.segmentId)?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedMatch?.segmentId, currentMatchIndex]);

  function moveMatch(direction: -1 | 1) {
    if (transcriptMatches.length === 0) return;
    setCurrentMatchIndex((index) =>
      (index + direction + transcriptMatches.length) % transcriptMatches.length,
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-heading">Transcript</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {transcriptQuery.isSuccess
              ? `${transcriptQuery.data.length} transcript segments`
              : "Conversation transcript"}
          </p>
        </div>
        <div className="flex w-full items-center gap-1.5 sm:w-auto">
          <label className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
            <span className="sr-only">Search transcript</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />
            <input
              className="h-9 w-full rounded-lg border border-border bg-white pl-9 pr-9 text-sm text-heading outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search transcript"
              type="search"
              value={search}
            />
            {search ? (
              <button
                aria-label="Clear transcript search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-heading"
                onClick={() => setSearch("")}
                type="button"
              >
                <X aria-hidden="true" className="size-3.5" />
              </button>
            ) : null}
          </label>
          <span aria-live="polite" className="min-w-12 text-center text-xs tabular-nums text-muted-foreground">
            {normalizedSearch
              ? transcriptMatches.length > 0
                ? `${selectedMatchIndex + 1} / ${transcriptMatches.length}`
                : "0 matches"
              : ""}
          </span>
          <Button
            aria-label="Previous transcript match"
            disabled={transcriptMatches.length === 0}
            onClick={() => moveMatch(-1)}
            size="icon-sm"
            title="Previous match"
            variant="ghost"
          >
            <ChevronUp aria-hidden="true" />
          </Button>
          <Button
            aria-label="Next transcript match"
            disabled={transcriptMatches.length === 0}
            onClick={() => moveMatch(1)}
            size="icon-sm"
            title="Next match"
            variant="ghost"
          >
            <ChevronDown aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="max-h-[560px] min-h-64 overflow-y-auto overscroll-contain p-4 sm:p-5">
        {transcriptQuery.isPending ? (
          <div aria-label="Loading transcript" className="space-y-5">
            {Array.from({ length: 5 }, (_, index) => (
              <div className="flex gap-3" key={index}>
                <div className="size-8 shrink-0 animate-pulse rounded-full bg-slate-100" />
                <div className="flex-1 pt-1">
                  <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                  <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-100" />
                  <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : transcriptQuery.isError ? (
          <div className="py-10 text-center" role="alert">
            <p className="text-sm font-medium text-heading">Couldn’t load the transcript</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {transcriptQuery.error instanceof Error
                ? transcriptQuery.error.message
                : "An unexpected error occurred."}
            </p>
            <Button
              className="mt-4"
              onClick={() => void transcriptQuery.refetch()}
              size="sm"
              variant="outline"
            >
              <RotateCw aria-hidden="true" />
              Try again
            </Button>
          </div>
        ) : transcriptQuery.data.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-heading">No transcript yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Transcript segments for this meeting will appear here.
            </p>
          </div>
        ) : normalizedSearch && transcriptMatches.length === 0 ? (
          <div className="py-12 text-center">
            <Search aria-hidden="true" className="mx-auto size-5 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-heading">No matching transcript text</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try a different word or speaker name.
            </p>
          </div>
        ) : (
          <ol className="space-y-6">
            {[...transcriptQuery.data]
              .sort((left, right) => left.sequence - right.sequence)
              .map((segment) => {
                const isActive = segment.id === activeSegmentId;
                return (
                  <li key={segment.id}>
                    <button
                      aria-current={isActive ? "true" : undefined}
                      aria-label={`Seek to ${formatTimestamp(segment.timestamp_seconds)}, ${segment.speaker}: ${segment.text}`}
                      className={`flex w-full gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        isActive
                          ? "border-violet-200 bg-violet-50/80"
                          : "border-transparent hover:bg-slate-50"
                      }`}
                      onClick={() => seek(segment.timestamp_seconds)}
                      ref={(element) => {
                        if (element) transcriptRows.current.set(segment.id, element);
                        else transcriptRows.current.delete(segment.id);
                      }}
                      type="button"
                    >
                      <span
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                          isActive
                            ? "bg-primary text-white"
                            : "bg-violet-50 text-primary"
                        }`}
                      >
                        {getInitials(segment.speaker)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <span className="text-sm font-semibold text-heading">
                            <HighlightedText
                              isCurrentMatch={(occurrence) =>
                                selectedMatch?.segmentId === segment.id &&
                                selectedMatch.field === "speaker" &&
                                selectedMatch.occurrence === occurrence
                              }
                              query={normalizedSearch}
                              value={segment.speaker}
                            />
                          </span>
                          <time className="rounded px-1 text-xs tabular-nums text-slate-400 hover:text-primary">
                            {formatTimestamp(segment.timestamp_seconds)}
                          </time>
                        </span>
                        <span className="mt-1.5 block whitespace-pre-wrap text-left text-sm leading-6 text-slate-600">
                          <HighlightedText
                            isCurrentMatch={(occurrence) =>
                              selectedMatch?.segmentId === segment.id &&
                              selectedMatch.field === "text" &&
                              selectedMatch.occurrence === occurrence
                            }
                            query={normalizedSearch}
                            value={segment.text}
                          />
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
          </ol>
        )}
      </div>
    </section>
  );
}

function SummaryPanel({ meeting }: { meeting: MeetingDetailData }) {
  const takeaways = getKeyTakeaways(meeting.summary, meeting);
  const participants = meeting.participants ?? [];
  const transcriptCount = meeting.transcript_segments?.length ?? 0;

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50/80 via-white to-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-heading">AI Summary</h3>
          <span className="inline-flex items-center gap-1 rounded-full border border-violet-100 bg-white px-2 py-1 text-[10px] font-semibold text-primary">
            <Sparkles aria-hidden="true" className="size-3" />
            AI-generated
          </span>
        </div>
        {meeting.summary?.trim() ? (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {meeting.summary}
          </p>
        ) : (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            No summary was provided for this meeting.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-border bg-white p-4">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Lightbulb aria-hidden="true" className="size-4" />
          </span>
          <h3 className="text-sm font-semibold text-heading">Key takeaways</h3>
        </div>
        {takeaways.length > 0 ? (
          <ul className="mt-3 space-y-2.5">
            {takeaways.map((takeaway, index) => (
              <li className="flex gap-2.5 text-sm leading-6 text-slate-600" key={`${index}-${takeaway}`}>
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/70" />
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Key takeaways will appear when a summary or transcript is available.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-border bg-white p-4">
        <h3 className="text-sm font-semibold text-heading">Meeting details</h3>
        <dl className="mt-3 space-y-3">
          <div className="flex items-start gap-2.5">
            <CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary/75" />
            <div className="min-w-0">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Date and time
              </dt>
              <dd className="mt-0.5 text-sm leading-5 text-slate-700">
                {formatDate(meeting.meeting_date)}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Clock3 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary/75" />
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Duration
              </dt>
              <dd className="mt-0.5 text-sm text-slate-700">
                {formatDuration(meeting.duration_seconds)}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Users aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary/75" />
            <div className="min-w-0">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Participants
              </dt>
              {participants.length > 0 ? (
                <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {participants.map((participant, index) => (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 py-1 pl-1 pr-2 text-xs text-slate-700"
                      key={`${participant}-${index}`}
                    >
                      <span className="flex size-5 items-center justify-center rounded-full bg-violet-100 text-[9px] font-semibold text-primary">
                        {getInitials(participant)}
                      </span>
                      {participant}
                    </span>
                  ))}
                </dd>
              ) : (
                <dd className="mt-0.5 text-sm text-slate-500">No participants listed</dd>
              )}
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <MessageSquareText
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-primary/75"
            />
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Transcript
              </dt>
              <dd className="mt-0.5 text-sm text-slate-700">
                {transcriptCount} {transcriptCount === 1 ? "segment" : "segments"}
              </dd>
            </div>
          </div>
        </dl>
      </section>
    </div>
  );
}

function AiPanel({
  meeting,
  meetingId,
  currentTime,
  seek,
}: {
  meeting: MeetingDetailData;
  meetingId: number;
  currentTime: number;
  seek: (time: number) => void;
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>("summary");

  return (
    <aside className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <span className="flex size-8 items-center justify-center rounded-lg bg-violet-50 text-primary">
          <Sparkles aria-hidden="true" className="size-4" />
        </span>
        <h2 className="font-semibold text-heading">AI Assistant</h2>
        <span className="ml-auto rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Preview
        </span>
      </div>
      <div aria-label="Meeting insights" className="grid grid-cols-3 border-b border-border p-1" role="tablist">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            aria-selected={activeTab === id}
            className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-medium transition ${
              activeTab === id
                ? "bg-violet-50 text-primary"
                : "text-slate-500 hover:bg-slate-50 hover:text-heading"
            }`}
            id={`meeting-tab-${id}`}
            key={id}
            onClick={() => setActiveTab(id)}
            role="tab"
            type="button"
          >
            <Icon aria-hidden="true" className="size-3.5" />
            {label}
          </button>
        ))}
      </div>
      <div
        aria-labelledby={`meeting-tab-${activeTab}`}
        className="min-h-56 p-5"
        id={`meeting-panel-${activeTab}`}
        role="tabpanel"
      >
        {activeTab === "summary" ? (
          <SummaryPanel meeting={meeting} />
        ) : activeTab === "action-items" ? (
          <ActionItemsPanel meetingId={meetingId} />
        ) : (
          <TopicsPanel currentTime={currentTime} meetingId={meetingId} seek={seek} />
        )}
      </div>
    </aside>
  );
}

export function MeetingDetail({ meetingId }: MeetingDetailProps) {
  const meetingQuery = useMeeting(meetingId);
  const player = usePlayer(meetingQuery.data?.duration_seconds ?? 0);

  if (meetingQuery.isPending) {
    return (
      <main className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-100" />
        <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
          <div className="space-y-6">
            <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-96 animate-pulse rounded-2xl bg-slate-100" />
          </div>
          <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </main>
    );
  }

  if (meetingQuery.isError) {
    const isNotFound =
      meetingQuery.error instanceof MeetingsApiError && meetingQuery.error.status === 404;

    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-violet-50 text-primary">
          {isNotFound ? <FileText aria-hidden="true" /> : <RotateCw aria-hidden="true" />}
        </div>
        <h1 className="mt-5 text-xl font-semibold text-heading">
          {isNotFound ? "Meeting not found" : "Couldn’t load this meeting"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isNotFound
            ? "This meeting may have been removed or the link may be incorrect."
            : meetingQuery.error instanceof Error
              ? meetingQuery.error.message
              : "An unexpected error occurred."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {!isNotFound ? (
            <Button onClick={() => void meetingQuery.refetch()} variant="outline">
              <RotateCw aria-hidden="true" />
              Try again
            </Button>
          ) : null}
          <Button asChild>
            <Link href="/meetings">
              <ArrowLeft aria-hidden="true" />
              Back to meetings
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  const meeting = meetingQuery.data;

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-primary"
          href="/meetings"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to meetings
        </Link>
        <MeetingActions meeting={meeting} />
      </div>

      <section className="mb-6 rounded-2xl border border-border bg-white px-5 py-5 shadow-sm sm:px-7 sm:py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Meeting</p>
        <h1 className="mt-2 break-words text-2xl font-semibold tracking-tight text-heading sm:text-3xl">
          {meeting.title}
        </h1>
        <MeetingMetadata meeting={meeting} />
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
        <div className="min-w-0 space-y-6">
          <MeetingPlayer {...player} />
          <TranscriptPanel
            currentTime={player.currentTime}
            meetingId={meetingId}
            seek={player.seek}
          />
        </div>
        <AiPanel
          currentTime={player.currentTime}
          meeting={meeting}
          meetingId={meetingId}
          seek={player.seek}
        />
      </div>
    </main>
  );
}
