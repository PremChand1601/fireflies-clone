import { AudioLines, FileText, ListChecks, Sparkles, Tags } from "lucide-react";
import type { ReactNode } from "react";

type PlaceholderCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
};

function PlaceholderCard({ title, description, icon }: PlaceholderCardProps) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2 text-heading">
        {icon}
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </section>
  );
}

export function MeetingDetailPlaceholders() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <PlaceholderCard
        title="Transcript"
        description="A searchable, speaker-labeled transcript will appear here in the next phase."
        icon={<FileText className="size-4 text-primary" aria-hidden="true" />}
      />
      <PlaceholderCard
        title="Media"
        description="Audio playback and timeline controls will be added here. Playback is not available yet."
        icon={<AudioLines className="size-4 text-primary" aria-hidden="true" />}
      />
      <PlaceholderCard
        title="Summary"
        description="The meeting summary is shown above. Richer AI notes will live in this panel later."
        icon={<Sparkles className="size-4 text-primary" aria-hidden="true" />}
      />
      <PlaceholderCard
        title="Action Items"
        description="Tracked tasks for this meeting will be managed from this section in a later phase."
        icon={<ListChecks className="size-4 text-primary" aria-hidden="true" />}
      />
      <PlaceholderCard
        title="Topics"
        description="Chapter markers and topics will be listed here once the player is connected."
        icon={<Tags className="size-4 text-primary" aria-hidden="true" />}
      />
    </div>
  );
}
