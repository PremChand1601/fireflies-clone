"use client";

import { useEffect, useMemo, useRef } from "react";
import { Clock3, Hash, RotateCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useMeetingChapters } from "@/hooks/use-meetings";

type TopicsPanelProps = {
  meetingId: number;
  currentTime: number;
  seek: (time: number) => void;
};

function formatTimestamp(seconds: number): string {
  const wholeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(wholeSeconds / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const remainingSeconds = wholeSeconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
    : `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function TopicsPanel({ meetingId, currentTime, seek }: TopicsPanelProps) {
  const chaptersQuery = useMeetingChapters(meetingId);
  const chapterRows = useRef(new Map<number, HTMLButtonElement>());
  const chapters = chaptersQuery.data ?? [];
  const sortedChapters = useMemo(
    () =>
      [...chapters].sort(
        (left, right) =>
          left.start_time_seconds - right.start_time_seconds || left.id - right.id,
      ),
    [chapters],
  );
  const activeChapter = sortedChapters.reduce<(typeof sortedChapters)[number] | null>(
    (active, chapter) => {
      if (
        Number.isFinite(chapter.start_time_seconds) &&
        chapter.start_time_seconds <= currentTime
      ) {
        return chapter;
      }
      return active;
    },
    null,
  );

  useEffect(() => {
    if (!activeChapter) return;
    chapterRows.current.get(activeChapter.id)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [activeChapter?.id]);

  return (
    <section aria-label="Meeting topics and chapters" className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-heading">Topics</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {chaptersQuery.isSuccess
            ? `${chapters.length} ${chapters.length === 1 ? "chapter" : "chapters"}`
            : "Key moments from this meeting"}
        </p>
      </div>

      <div className="max-h-[560px] overflow-y-auto overscroll-contain">
        {chaptersQuery.isPending ? (
          <div aria-label="Loading chapters" className="space-y-4 py-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="flex gap-3" key={index}>
                <div className="size-8 shrink-0 animate-pulse rounded-full bg-violet-100" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : chaptersQuery.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50/50 p-4" role="alert">
            <p className="text-sm font-medium text-heading">Couldn’t load topics</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {chaptersQuery.error instanceof Error
                ? chaptersQuery.error.message
                : "An unexpected error occurred."}
            </p>
            <Button
              className="mt-3"
              onClick={() => void chaptersQuery.refetch()}
              size="sm"
              variant="outline"
            >
              <RotateCw aria-hidden="true" />
              Try again
            </Button>
          </div>
        ) : sortedChapters.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center">
            <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-violet-50 text-primary">
              <Sparkles aria-hidden="true" className="size-5" />
            </span>
            <p className="mt-3 text-sm font-semibold text-heading">No topics yet</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Chapters will appear here when they are available for this meeting.
            </p>
          </div>
        ) : (
          <ol className="relative space-y-1">
            {sortedChapters.map((chapter, index) => {
              const isActive = activeChapter?.id === chapter.id;
              return (
                <li className="relative pl-10" key={chapter.id}>
                  {index < sortedChapters.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-[15px] top-8 w-px bg-violet-100"
                    />
                  ) : null}
                  <button
                    aria-current={isActive ? "step" : undefined}
                    aria-label={`Seek to ${formatTimestamp(chapter.start_time_seconds)}: ${chapter.title}`}
                    className={`relative mb-2 w-full rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isActive
                        ? "border-violet-200 bg-violet-50/80 shadow-sm"
                        : "border-transparent hover:border-slate-100 hover:bg-slate-50"
                    }`}
                    onClick={() => seek(chapter.start_time_seconds)}
                    ref={(element) => {
                      if (element) chapterRows.current.set(chapter.id, element);
                      else chapterRows.current.delete(chapter.id);
                    }}
                    type="button"
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute -left-[35px] top-3 flex size-8 items-center justify-center rounded-full border-2 border-white ${
                        isActive ? "bg-primary text-white" : "bg-violet-100 text-primary"
                      }`}
                    >
                      {isActive ? (
                        <span className="size-2 rounded-full bg-white" />
                      ) : (
                        <span className="text-[10px] font-semibold">{index + 1}</span>
                      )}
                    </span>
                    <span className="flex items-start justify-between gap-2">
                      <span className={`text-sm font-semibold leading-5 ${isActive ? "text-primary" : "text-heading"}`}>
                        {chapter.title}
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-white px-1.5 py-1 text-[11px] tabular-nums text-slate-500">
                        <Clock3 aria-hidden="true" className="size-3" />
                        {formatTimestamp(chapter.start_time_seconds)}
                      </span>
                    </span>
                    {chapter.description ? (
                      <span className="mt-2 block text-xs leading-5 text-slate-600">
                        {chapter.description}
                      </span>
                    ) : null}
                    {chapter.keywords.length > 0 ? (
                      <span className="mt-2.5 flex flex-wrap gap-1.5">
                        {chapter.keywords.map((keyword, keywordIndex) => (
                          <span
                            className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-medium text-slate-500"
                            key={`${keyword}-${keywordIndex}`}
                          >
                            <Hash aria-hidden="true" className="size-2.5" />
                            {keyword}
                          </span>
                        ))}
                      </span>
                    ) : null}
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
