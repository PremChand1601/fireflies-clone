"use client";

import { Plus } from "lucide-react";

import { useCreateMeetingDialog } from "@/components/meetings/create-meeting-dialog";
import { MeetingList, MeetingListSkeleton } from "@/components/meetings/meeting-list";
import { MeetingToolbar } from "@/components/meetings/meeting-toolbar";
import { Button } from "@/components/ui/button";
import { useMeetingsFilters } from "@/hooks/use-meetings-filters";
import { useMeetings } from "@/hooks/use-meetings";
import { formatApiError } from "@/lib/api";

export function MeetingsDashboard() {
  const { setOpen } = useCreateMeetingDialog();
  const filters = useMeetingsFilters();
  const meetingsQuery = useMeetings(filters.apiParams);

  const meetings = meetingsQuery.data?.items ?? [];
  const participantOptions = Array.from(
    new Set(
      [
        ...meetings.flatMap((meeting) => meeting.participants),
        filters.participant,
      ].filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-heading">Meetings</h2>
          <p className="mt-1 text-sm text-muted-foreground">View and manage your recorded meetings.</p>
        </div>
        <Button onClick={() => setOpen(true)} aria-label="New meeting">
          <Plus />
          New meeting
        </Button>
      </div>

      <MeetingToolbar
        searchInput={filters.searchInput}
        onSearchChange={filters.setSearchInput}
        sort={filters.sort}
        onSortChange={filters.setSort}
        participant={filters.participant}
        onParticipantChange={filters.setParticipant}
        participants={participantOptions}
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
        dateMode={filters.dateMode}
        onDateFromChange={filters.setDateFrom}
        onDateToChange={filters.setDateTo}
        onDateModeChange={filters.setDateMode}
      />

      {meetingsQuery.isLoading ? <MeetingListSkeleton /> : null}

      {meetingsQuery.isError ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-base font-semibold text-heading">Unable to load meetings.</p>
          <p className="mt-2 text-sm text-muted-foreground">{formatApiError(meetingsQuery.error)}</p>
          <Button className="mt-4" onClick={() => void meetingsQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : null}

      {meetingsQuery.isSuccess && meetings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center">
          <p className="text-base font-semibold text-heading">No meetings found</p>
          <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
          <Button className="mt-4" onClick={() => setOpen(true)}>
            Create meeting
          </Button>
        </div>
      ) : null}

      {meetingsQuery.isSuccess && meetings.length > 0 ? (
        <div className="grid gap-3">
          <p className="text-sm text-muted-foreground">
            {meetingsQuery.data.total} {meetingsQuery.data.total === 1 ? "meeting" : "meetings"}
          </p>
          <MeetingList meetings={meetings} sort={filters.sort} />
        </div>
      ) : null}
    </div>
  );
}
