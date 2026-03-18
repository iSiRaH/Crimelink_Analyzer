import type {
  Announcement,
  AnnouncementCreatePayload,
  AnnouncementUpdatePayload,
} from "../types/announcement";
import api from "./api";

export const createAnnouncement = async (
  announcementData: AnnouncementCreatePayload,
) => {
  try {
    await api.post("/announcements", announcementData);
  } catch (error) {
    console.error("Error creating announcement:", error);
    throw error;
  }
};

export const getAnnouncements = async (): Promise<Announcement[]> => {
  try {
    const response = await api.get("/announcements");
    return response.data;
  } catch (error) {
    console.error("Error fetching announcements:", error);
    throw error;
  }
};

export const getAnnouncementById = async (
  id: string,
): Promise<Announcement> => {
  try {
    const response = await api.get(`/announcements/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching announcement:", error);
    throw error;
  }
};

export const updateAnnouncement = async (
  id: string,
  updatedData: AnnouncementUpdatePayload,
) => {
  try {
    await api.put(`/announcements/${id}`, updatedData);
  } catch (error) {
    console.error("Error updating announcement:", error);
    throw error;
  }
};

export const deleteAnnouncement = async (id: string) => {
  try {
    await api.delete(`/announcements/${id}`);
  } catch (error) {
    console.error("Error deleting announcement:", error);
    throw error;
  }
};
