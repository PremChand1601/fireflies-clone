"use client";

import {
  CalendarDays,
  Search,
  Users,
  X,
} from "lucide-react";

import type { MeetingSort } from "@/types";

type MeetingToolbarProps = {
  searchInput: string;
  onSearchChange: (value: string) => void;

  sort: MeetingSort;
  onSortChange: (value: MeetingSort) => void;

  participant: string;
  onParticipantChange: (value: string) => void;
  participants: string[];

  dateFrom: string;
  dateTo: string;
  dateMode: "all" | "range";

  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onDateModeChange: (mode: "all" | "range") => void;
};

const inputClassName =
  "h-10 w-full rounded-lg border border-border bg-white text-sm text-heading shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

export function MeetingToolbar({
  searchInput,
  onSearchChange,
  sort,
  onSortChange,
  participant,
  onParticipantChange,
  participants,
  dateFrom,
  dateTo,
  dateMode,
  onDateFromChange,
  onDateToChange,
  onDateModeChange,
}: MeetingToolbarProps) {
  const hasFilters =
    Boolean(searchInput) ||
    Boolean(participant) ||
    Boolean(dateFrom) ||
    Boolean(dateTo) ||
    sort !== "newest";

  return (
    <section
      aria-label="Meeting filters"
      className="rounded-xl border border-border bg-white p-4 shadow-sm"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_minmax(160px,1fr)_minmax(145px,0.8fr)_minmax(145px,0.8fr)_150px]">
        {/* Search */}
        <label className="relative block">
          <span className="sr-only">Search meetings</span>

          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          />

          <input
            className={`${inputClassName} pl-9 pr-3`}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search meetings"
            type="search"
            value={searchInput}
          />
        </label>

        {/* Participant */}
        <label className="relative block">
          <span className="sr-only">Filter by participant</span>

          <Users
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          />

          <select
            aria-label="Filter by participant"
            className={`${inputClassName} pl-9 pr-3`}
            onChange={(event) => onParticipantChange(event.target.value)}
            value={participant}
          >
            <option value="">All participants</option>

            {participants.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        {/* Date mode */}
        <div className="flex h-10 rounded-lg border border-border bg-slate-50 p-1">
          <button
            className={`flex-1 rounded-md px-3 text-xs font-medium transition ${
              dateMode === "all"
                ? "bg-white text-heading shadow-sm"
                : "text-muted-foreground hover:text-heading"
            }`}
            onClick={() => onDateModeChange("all")}
            type="button"
          >
            All dates
          </button>

          <button
            className={`flex-1 rounded-md px-3 text-xs font-medium transition ${
              dateMode === "range"
                ? "bg-white text-heading shadow-sm"
                : "text-muted-foreground hover:text-heading"
            }`}
            onClick={() => onDateModeChange("range")}
            type="button"
          >
            Date range
          </button>
        </div>

        {/* From date */}
        <label className="relative block">
          <span className="sr-only">Meetings from date</span>

          <CalendarDays
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          />

          <input
            aria-label="From date"
            className={`${inputClassName} pl-9 pr-2`}
            disabled={dateMode === "all"}
            onChange={(event) => onDateFromChange(event.target.value)}
            type="date"
            value={dateFrom}
          />
        </label>

        {/* To date */}
        <label className="relative block">
          <span className="sr-only">Meetings through date</span>

          <CalendarDays
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          />

          <input
            aria-label="To date"
            className={`${inputClassName} pl-9 pr-2`}
            disabled={dateMode === "all"}
            onChange={(event) => onDateToChange(event.target.value)}
            type="date"
            value={dateTo}
          />
        </label>

        {/* Sort */}
        <label className="block sm:col-span-2 xl:col-span-1">
          <span className="sr-only">Sort meetings</span>

          <select
            className={`${inputClassName} px-3`}
            onChange={(event) =>
              onSortChange(event.target.value as MeetingSort)
            }
            value={sort}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title</option>
            <option value="duration">Duration</option>
          </select>
        </label>
      </div>

      {hasFilters ? (
        <div className="mt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <X aria-hidden="true" className="size-3.5" />
            Filters active
          </span>
        </div>
      ) : null}
    </section>
  );
}