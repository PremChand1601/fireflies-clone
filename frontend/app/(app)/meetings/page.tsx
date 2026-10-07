import { Suspense } from "react";

import { MeetingListSkeleton } from "@/components/meetings/meeting-list";
import { MeetingsDashboard } from "@/components/meetings/meetings-dashboard";

export default function MeetingsPage() {
  return (
    <Suspense fallback={<MeetingListSkeleton />}>
      <MeetingsDashboard />
    </Suspense>
  );
}
