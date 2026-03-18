import { useEffect, useMemo, useState, type FormEvent } from "react";
import type {
  Announcement,
  AnnouncementCreatePayload,
  AnnouncementTag,
  AnnouncementStatus,
} from "../../types/announcement";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  updateAnnouncement,
} from "../../services/announcementService";
import PopupWindow from "../../components/UI/PopupWindow";
import { getCrimeReports } from "../../api/crimeReportService";
import * as leaveService from "../../api/leaveService";
import {
  getAllWeaponsWithDetails,
  getWeaponRequests,
} from "../../api/weaponApi";
import type { LeaveRequest } from "../../types/leave";
import type { WeaponResponseDTO, weaponRequestType } from "../../types/weapon";
import type { Vehicle } from "../../types/vehicle";
import api from "../../services/api";

type DashboardStats = {
  totalCrimeReports: number;
  pendingLeaveRequests: number;
  pendingWeaponRequests: number;
  totalWeapons: number;
  registeredVehicles: number;
  trackedCriminals: number;
  activeAnnouncements: number;
};

type CriminalSummary = {
  id: string;
};

type AnnouncementForm = {
  title: string;
  message: string;
  tag: AnnouncementTag;
  status: AnnouncementStatus;
};

const initialStats: DashboardStats = {
  totalCrimeReports: 0,
  pendingLeaveRequests: 0,
  pendingWeaponRequests: 0,
  totalWeapons: 0,
  registeredVehicles: 0,
  trackedCriminals: 0,
  activeAnnouncements: 0,
};

function getCurrentMonthYYYYMM(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function parseDateValue(value?: string | Date): number {
  if (!value) return 0;
  const parsed = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatDateTime(value?: string | Date): string {
  if (!value) return "-";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString();
}

function isPending(status?: string): boolean {
  return String(status ?? "").toUpperCase() === "PENDING";
}

function normalizeAnnouncementStatus(status?: string): AnnouncementStatus {
  return String(status ?? "").toUpperCase() === "INACTIVE"
    ? "INACTIVE"
    : "ACTIVE";
}

function OICDashboard() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [submittingAnnouncement, setSubmittingAnnouncement] = useState(false);
  const [deletingAnnouncementId, setDeletingAnnouncementId] = useState<
    string | null
  >(null);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<
    string | null
  >(null);
  const [dataWarning, setDataWarning] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [announcementForm, setAnnouncementForm] = useState<AnnouncementForm>({
    title: "",
    message: "",
    tag: "GENERAL",
    status: "ACTIVE",
  });

  const sortedAnnouncements = useMemo(() => {
    return [...announcements].sort(
      (a, b) => parseDateValue(b.date) - parseDateValue(a.date),
    );
  }, [announcements]);

  const statsCards = [
    {
      label: "Total Crime Reports",
      value: stats.totalCrimeReports,
      helper: "From View Crime Reports",
      accent: "text-red-300",
    },
    {
      label: "Pending Leave Requests",
      value: stats.pendingLeaveRequests,
      helper: "From Leave Management",
      accent: "text-yellow-300",
    },
    {
      label: "Pending Weapon Requests",
      value: stats.pendingWeaponRequests,
      helper: "From Weapon Requests",
      accent: "text-orange-300",
    },
    {
      label: "Total Weapons",
      value: stats.totalWeapons,
      helper: "From Weapon Handover",
      accent: "text-blue-300",
    },
    {
      label: "Registered Vehicles",
      value: stats.registeredVehicles,
      helper: "From Plate Registry",
      accent: "text-green-300",
    },
    {
      label: "Tracked Criminals",
      value: stats.trackedCriminals,
      helper: "From Manage Criminals",
      accent: "text-pink-300",
    },
    {
      label: "Active Announcements",
      value: stats.activeAnnouncements,
      helper: "Broadcast-ready notices",
      accent: "text-cyan-300",
    },
  ];

  const loadDashboardData = async () => {
    setLoadingDashboard(true);
    setDataWarning(null);

    const currentMonth = getCurrentMonthYYYYMM();

    const [
      announcementsResult,
      crimeReportsResult,
      leaveRequestsResult,
      weaponRequestsResult,
      weaponsResult,
      vehiclesResult,
      criminalsResult,
    ] = await Promise.allSettled([
      getAnnouncements(),
      getCrimeReports(),
      leaveService.getAllLeaveRequests(currentMonth),
      getWeaponRequests(),
      getAllWeaponsWithDetails(),
      api.get<Vehicle[]>("/vehicles"),
      api.get<CriminalSummary[]>("/criminals"),
    ]);

    const failures: string[] = [];

    const announcementData =
      announcementsResult.status === "fulfilled"
        ? announcementsResult.value
        : [];
    if (announcementsResult.status === "rejected") {
      failures.push("announcements");
      console.error("Failed to load announcements", announcementsResult.reason);
    }

    const crimeReports =
      crimeReportsResult.status === "fulfilled" ? crimeReportsResult.value : [];
    if (crimeReportsResult.status === "rejected") {
      failures.push("crime reports");
      console.error("Failed to load crime reports", crimeReportsResult.reason);
    }

    const leaveRequests: LeaveRequest[] =
      leaveRequestsResult.status === "fulfilled"
        ? leaveRequestsResult.value
        : [];
    if (leaveRequestsResult.status === "rejected") {
      failures.push("leave requests");
      console.error(
        "Failed to load leave requests",
        leaveRequestsResult.reason,
      );
    }

    const weaponRequests: weaponRequestType[] =
      weaponRequestsResult.status === "fulfilled"
        ? weaponRequestsResult.value
        : [];
    if (weaponRequestsResult.status === "rejected") {
      failures.push("weapon requests");
      console.error(
        "Failed to load weapon requests",
        weaponRequestsResult.reason,
      );
    }

    const weapons: WeaponResponseDTO[] =
      weaponsResult.status === "fulfilled" ? weaponsResult.value.data : [];
    if (weaponsResult.status === "rejected") {
      failures.push("weapons");
      console.error("Failed to load weapons", weaponsResult.reason);
    }

    const vehicles =
      vehiclesResult.status === "fulfilled" ? vehiclesResult.value.data : [];
    if (vehiclesResult.status === "rejected") {
      failures.push("vehicles");
      console.error("Failed to load vehicles", vehiclesResult.reason);
    }

    const criminals =
      criminalsResult.status === "fulfilled" ? criminalsResult.value.data : [];
    if (criminalsResult.status === "rejected") {
      failures.push("criminals");
      console.error("Failed to load criminals", criminalsResult.reason);
    }

    setAnnouncements(announcementData);

    setStats({
      totalCrimeReports: crimeReports.length,
      pendingLeaveRequests: leaveRequests.filter((leave) =>
        isPending(leave.status),
      ).length,
      pendingWeaponRequests: weaponRequests.filter((request) =>
        isPending(request.status),
      ).length,
      totalWeapons: weapons.length,
      registeredVehicles: vehicles.length,
      trackedCriminals: criminals.length,
      activeAnnouncements: announcementData.filter(
        (announcement) =>
          String(announcement.status).toUpperCase() === "ACTIVE",
      ).length,
    });

    if (failures.length > 0) {
      setDataWarning(
        `Some sections could not be loaded: ${failures.join(", ")}.`,
      );
    }

    setLoadingDashboard(false);
  };

  const onAddAnnouncement = () => {
    setEditingAnnouncementId(null);
    setAnnouncementForm({
      title: "",
      message: "",
      tag: "GENERAL",
      status: "ACTIVE",
    });
    setFormError(null);
    setSuccessMessage(null);
    setIsPopupOpen(true);
  };

  const onEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncementId(announcement.id);
    setAnnouncementForm({
      title: announcement.title,
      message: announcement.message,
      tag: announcement.tag || "GENERAL",
      status: normalizeAnnouncementStatus(announcement.status),
    });
    setFormError(null);
    setSuccessMessage(null);
    setIsPopupOpen(true);
  };

  const onCloseAnnouncementPopup = () => {
    setIsPopupOpen(false);
    setFormError(null);
    setEditingAnnouncementId(null);
  };

  const handleDeleteAnnouncement = async (announcement: Announcement) => {
    const confirmDelete = window.confirm(
      `Delete announcement \"${announcement.title}\"?`,
    );
    if (!confirmDelete) return;

    try {
      setDeletingAnnouncementId(announcement.id);
      await deleteAnnouncement(announcement.id);
      if (editingAnnouncementId === announcement.id) {
        setIsPopupOpen(false);
        setEditingAnnouncementId(null);
      }
      setSuccessMessage("Announcement deleted successfully.");
      await loadDashboardData();
    } catch (error) {
      console.error("Failed to delete announcement", error);
      setDataWarning("Failed to delete announcement. Please try again.");
    } finally {
      setDeletingAnnouncementId(null);
    }
  };

  const handleFormFieldChange = (
    field: keyof AnnouncementForm,
    value: string,
  ) => {
    setAnnouncementForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAnnouncementSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setFormError(null);

    const title = announcementForm.title.trim();
    const message = announcementForm.message.trim();

    if (!title || !message) {
      setFormError("Title and message are required.");
      return;
    }

    const payload: AnnouncementCreatePayload = {
      title,
      message,
      tag: announcementForm.tag,
      status: announcementForm.status,
    };

    try {
      setSubmittingAnnouncement(true);
      if (editingAnnouncementId) {
        await updateAnnouncement(editingAnnouncementId, payload);
      } else {
        await createAnnouncement(payload);
      }
      setAnnouncementForm({
        title: "",
        message: "",
        tag: "GENERAL",
        status: "ACTIVE",
      });
      setEditingAnnouncementId(null);
      setIsPopupOpen(false);
      setSuccessMessage(
        editingAnnouncementId
          ? "Announcement updated successfully."
          : "Announcement published successfully.",
      );
      await loadDashboardData();
    } catch (error) {
      console.error("Failed to save announcement", error);
      setFormError(
        editingAnnouncementId
          ? "Failed to update announcement. Please try again."
          : "Failed to publish announcement. Please try again.",
      );
    } finally {
      setSubmittingAnnouncement(false);
    }
  };

  useEffect(() => {
    void loadDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg p-4 text-white sm:p-6">
      <div className="mx-auto w-full max-w-[1400px] space-y-6 font-[Inter,system-ui,sans-serif]">
        <div className="rounded-3xl border border-dark-border bg-dark-panel p-5 sm:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                OIC Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-300">
                Live operational summary from core OIC modules and announcement
                control center.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void loadDashboardData()}
                className="rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Refresh Stats
              </button>
              <button
                type="button"
                onClick={onAddAnnouncement}
                className="rounded-full bg-purple-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-purple-hover"
              >
                + Create Announcement
              </button>
            </div>
          </div>

          {successMessage && (
            <div className="mt-4 rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-200">
              {successMessage}
            </div>
          )}

          {dataWarning && (
            <div className="mt-4 rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
              {dataWarning}
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {statsCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-dark-border bg-[#181d30] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-400">
                {card.label}
              </p>
              <p className={`mt-2 text-4xl font-bold ${card.accent}`}>
                {loadingDashboard ? "--" : card.value}
              </p>
              <p className="mt-2 text-xs text-gray-400">{card.helper}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-dark-border bg-dark-panel p-5 sm:p-7">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Recent Announcements</h2>
              <p className="text-sm text-gray-300">
                Latest notices shared with officers and operations teams.
              </p>
            </div>
            <p className="text-sm text-gray-400">
              Total:{" "}
              <span className="font-semibold text-white">
                {announcements.length}
              </span>
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-dark-border bg-dark-bg">
            <table className="min-w-[780px] w-full border-separate border-spacing-0 text-sm text-gray-200">
              <thead className="sticky top-0 z-10 bg-[#222a40]">
                <tr>
                  <th className="border-b border-dark-border px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-300">
                    Title
                  </th>
                  <th className="border-b border-dark-border px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-300">
                    Message
                  </th>
                  <th className="border-b border-dark-border px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-300">
                    Tag
                  </th>
                  <th className="border-b border-dark-border px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-300">
                    Status
                  </th>
                  <th className="border-b border-dark-border px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-300">
                    Published
                  </th>
                  <th className="border-b border-dark-border px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loadingDashboard ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-6 text-center text-gray-400"
                    >
                      Loading dashboard data...
                    </td>
                  </tr>
                ) : sortedAnnouncements.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-6 text-center text-gray-400"
                    >
                      No announcements available.
                    </td>
                  </tr>
                ) : (
                  sortedAnnouncements.slice(0, 12).map((announcement) => {
                    const status = String(
                      announcement.status ?? "-",
                    ).toUpperCase();

                    return (
                      <tr
                        key={announcement.id}
                        className="transition-colors even:bg-white/[0.02] hover:bg-white/[0.06]"
                      >
                        <td className="border-b border-dark-border px-3 py-2.5 font-medium text-white">
                          {announcement.title}
                        </td>
                        <td className="border-b border-dark-border px-3 py-2.5 text-gray-300">
                          <span className="line-clamp-2">
                            {announcement.message}
                          </span>
                        </td>
                        <td className="border-b border-dark-border px-3 py-2.5">
                          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-gray-100">
                            {announcement.tag || "GENERAL"}
                          </span>
                        </td>
                        <td className="border-b border-dark-border px-3 py-2.5">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              status === "ACTIVE"
                                ? "bg-green-500/20 text-green-300"
                                : "bg-slate-500/30 text-slate-200"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="border-b border-dark-border px-3 py-2.5 text-gray-300">
                          {formatDateTime(announcement.date)}
                        </td>
                        <td className="border-b border-dark-border px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onEditAnnouncement(announcement)}
                              disabled={
                                deletingAnnouncementId === announcement.id
                              }
                              className="rounded-md bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200 transition hover:bg-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                void handleDeleteAnnouncement(announcement);
                              }}
                              disabled={
                                deletingAnnouncementId === announcement.id
                              }
                              className="rounded-md bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-200 transition hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {deletingAnnouncementId === announcement.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isPopupOpen && (
        <PopupWindow
          isOpen={isPopupOpen}
          onClose={onCloseAnnouncementPopup}
          title={
            editingAnnouncementId ? "Edit Announcement" : "Create Announcement"
          }
          className="md:w-[46rem]"
        >
          <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-200">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={announcementForm.title}
                onChange={(event) =>
                  handleFormFieldChange("title", event.target.value)
                }
                maxLength={120}
                placeholder="Announcement title"
                className="h-10 w-full rounded-lg border border-dark-border bg-white px-3 text-sm text-dark-bg outline-none focus:ring-2 focus:ring-purple-primary/40"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-200">
                Message <span className="text-red-400">*</span>
              </label>
              <textarea
                value={announcementForm.message}
                onChange={(event) =>
                  handleFormFieldChange("message", event.target.value)
                }
                maxLength={1200}
                placeholder="Write the announcement message"
                rows={5}
                className="w-full rounded-lg border border-dark-border bg-white px-3 py-2 text-sm text-dark-bg outline-none focus:ring-2 focus:ring-purple-primary/40"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="announcement-tag"
                  className="mb-1 block text-sm font-medium text-gray-200"
                >
                  Tag
                </label>
                <select
                  id="announcement-tag"
                  title="Announcement Tag"
                  value={announcementForm.tag}
                  onChange={(event) =>
                    handleFormFieldChange("tag", event.target.value)
                  }
                  className="h-10 w-full rounded-lg border border-dark-border bg-white px-3 text-sm text-dark-bg outline-none focus:ring-2 focus:ring-purple-primary/40"
                >
                  <option value="GENERAL">GENERAL</option>
                  <option value="ALERT">ALERT</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="EVENT">EVENT</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="announcement-status"
                  className="mb-1 block text-sm font-medium text-gray-200"
                >
                  Status
                </label>
                <select
                  id="announcement-status"
                  title="Announcement Status"
                  value={announcementForm.status}
                  onChange={(event) =>
                    handleFormFieldChange(
                      "status",
                      event.target.value as AnnouncementStatus,
                    )
                  }
                  className="h-10 w-full rounded-lg border border-dark-border bg-white px-3 text-sm text-dark-bg outline-none focus:ring-2 focus:ring-purple-primary/40"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>

            {formError && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {formError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onCloseAnnouncementPopup}
                className="rounded-full bg-gray-300 px-5 py-2 text-sm font-semibold text-dark-bg transition hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingAnnouncement}
                className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submittingAnnouncement
                  ? editingAnnouncementId
                    ? "Updating..."
                    : "Publishing..."
                  : editingAnnouncementId
                    ? "Update Announcement"
                    : "Publish Announcement"}
              </button>
            </div>
          </form>
        </PopupWindow>
      )}
    </div>
  );
}

export default OICDashboard;
