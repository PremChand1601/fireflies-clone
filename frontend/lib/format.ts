import { format, parseISO } from "date-fns";

export function parseMeetingDate(value: string): Date {
  return parseISO(value);
}

export function formatMeetingDate(value: string): string {
  return format(parseMeetingDate(value), "MMM d, yyyy");
}

export function formatMeetingTime(value: string): string {
  return format(parseMeetingDate(value), "h:mm a");
}

export function formatMeetingDateTime(value: string): string {
  return `${formatMeetingDate(value)} · ${formatMeetingTime(value)}`;
}

export function formatDuration(seconds: number): string {
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${minutes} min`;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function formatDateGroup(value: string): string {
  return format(parseMeetingDate(value), "EEEE, MMM d, yyyy");
}
