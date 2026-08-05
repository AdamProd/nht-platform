export type TimelineAccent =
  | "purple"
  | "green"
  | "orange"
  | "blue"
  | "gray"
  | "red";

export type TimelineIconKind =
  | "user"
  | "users"
  | "dollar"
  | "link"
  | "file"
  | "message"
  | "bell"
  | "archive"
  | "trash"
  | "activity";

export type CreatorTimelineItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  created_at: string;
  actor: {
    id: string | null;
    name: string;
    role: string | null;
  };
  icon: TimelineIconKind;
  color: TimelineAccent;
  metadata: Record<string, unknown>;
};

export type CreatorTimelineDayGroup = {
  key: string;
  label: string;
  items: CreatorTimelineItem[];
};

export type CreatorTimelinePage = {
  items: CreatorTimelineItem[];
  page: number;
  limit: number;
  hasMore: boolean;
  total: number;
};

export const CREATOR_TIMELINE_PAGE_SIZE = 20;
