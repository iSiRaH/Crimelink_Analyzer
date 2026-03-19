export type AnnouncementStatus = "ACTIVE" | "INACTIVE";
export type AnnouncementTag = "GENERAL" | "ALERT" | "UPDATE" | "EVENT";

export type Announcement = {
  id: string;
  title: string;
  message: string;
  date?: string | Date;
  tag?: AnnouncementTag;
  status?: string;
};

export type AnnouncementCreatePayload = {
  title: string;
  message: string;
  tag?: AnnouncementTag;
  status?: AnnouncementStatus;
};

export type AnnouncementUpdatePayload = Partial<AnnouncementCreatePayload>;
