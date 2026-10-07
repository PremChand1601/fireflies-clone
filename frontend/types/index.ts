export type ApiHealthResponse = {
  status: string;
};

export type MeetingSort =
  | "newest"
  | "oldest"
  | "title"
  | "duration";

export type MeetingSortOption = MeetingSort;

export type Meeting = {
  id: number;
  title: string;
  meeting_date: string;
  duration_seconds: number;
  participants: string[];
  summary: string | null;
  created_at: string;
  updated_at: string;
  action_item_completed: number;
  action_item_total: number;
};

export type TranscriptSegment = {
  id: number;
  meeting_id: number;
  speaker: string;
  timestamp_seconds: number;
  text: string;
  sequence: number;
};

export type ActionItem = {
  id: number;
  meeting_id: number;
  task: string;
  assignee: string | null;
  due_date: string | null;
  completed: boolean;
  created_at: string;
};

export type ActionItemCreatePayload = {
  task: string;
  assignee?: string | null;
  due_date?: string | null;
  completed?: boolean;
};

export type ActionItemUpdatePayload = {
  task?: string;
  assignee?: string | null;
  due_date?: string | null;
  completed?: boolean;
};

export type Chapter = {
  id: number;
  meeting_id: number;
  title: string;
  start_time_seconds: number;
  description: string | null;
  keywords: string[];
};

export type MeetingDetail = Meeting & {
  transcript_segments: TranscriptSegment[];
  action_items: ActionItem[];
  chapters: Chapter[];
};

export type MeetingListResponse = {
  items: Meeting[];
  total: number;
};

export type MeetingCreatePayload = {
  title: string;
  meeting_date: string;
  duration_seconds: number;
  participants: string[];
  summary: string | null;
};

export type MeetingUpdatePayload = {
  title: string;
  meeting_date: string;
  duration_seconds: number;
  participants: string[];
  summary: string | null;
};

export type MeetingFilters = {
  q?: string;
  sort: MeetingSortOption;
  participant?: string;
  date_from?: string;
  date_to?: string;
};

export type MeetingListParams = MeetingFilters & {
  skip?: number;
  limit?: number;
};