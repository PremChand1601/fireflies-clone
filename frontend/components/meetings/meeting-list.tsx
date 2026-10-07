import { MeetingCard } from "@/components/meetings/meeting-card";
import type { Meeting, MeetingSort } from "@/types";

type MeetingListProps = {
  meetings: Meeting[];
  sort?: MeetingSort;
};

export function MeetingList({ meetings }: MeetingListProps) {
  if (meetings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-violet-50 text-primary">
          <span className="text-xl" aria-hidden="true">
            ✦
          </span>
        </div>

        <h2 className="mt-4 text-base font-semibold text-heading">
          No meetings found
        </h2>

        <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
          Try adjusting your search or filters. Meetings will appear here when
          they are available.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {meetings.map((meeting) => (
        <MeetingCard key={meeting.id} meeting={meeting} />
      ))}
    </div>
  );
}

export function MeetingListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-48 animate-pulse rounded-xl border border-border bg-white"
        />
      ))}
    </div>
  );
}