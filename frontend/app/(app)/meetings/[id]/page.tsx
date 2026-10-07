import { notFound } from "next/navigation";

import { MeetingDetail } from "@/components/meetings/meeting-detail";

type MeetingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MeetingPage({ params }: MeetingPageProps) {
  const { id } = await params;
  const meetingId = Number(id);

  if (!Number.isSafeInteger(meetingId) || meetingId < 1) {
    notFound();
  }

  return <MeetingDetail meetingId={meetingId} />;
}
