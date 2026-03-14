import { useEffect, useMemo, useState } from "react";
import type { weaponRequestType } from "../../types/weapon";
import { NavLink } from "react-router-dom";
import {
  approveWeaponRequest,
  getWeaponRequests,
  rejectWeaponRequest,
} from "../../api/weaponApi";

type SortableColumn =
  | "requestId"
  | "weaponSerial"
  | "ammoCount"
  | "requestedById"
  | "requestNote"
  | "status"
  | "requestedAt"
  | "resolvedAt";

type SortDirection = "asc" | "desc";

const sortableColumns: Array<{ key: SortableColumn; label: string }> = [
  { key: "requestId", label: "Request ID" },
  { key: "weaponSerial", label: "Weapon Serial" },
  { key: "ammoCount", label: "Ammo Count" },
  { key: "requestedById", label: "Requested By" },
  { key: "requestNote", label: "Request Note" },
  { key: "status", label: "Status" },
  { key: "requestedAt", label: "Requested At" },
  { key: "resolvedAt", label: "Resolved At" },
];

function safeTime(value: string | null): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatDate(value: string | null): string {
  if (!value) return "-";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return "-";
  return new Date(parsed).toLocaleString();
}

const WeaponRequests = () => {
  const [weaponRequests, setWeaponRequests] = useState<weaponRequestType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(
    null,
  );
  const [processingAction, setProcessingAction] = useState<
    "approve" | "reject" | null
  >(null);
  const [sortColumn, setSortColumn] = useState<SortableColumn>("requestedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const fetchWeaponRequests = async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    setError(null);

    try {
      const data = await getWeaponRequests();
      setWeaponRequests(data ?? []);
    } catch (error) {
      console.error("Error fetching weapon requests:", error);
      setError("Failed to fetch weapon requests");
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  const approveRequest = async (requestId: number) => {
    setError(null);
    setProcessingRequestId(requestId);
    setProcessingAction("approve");

    try {
      await approveWeaponRequest(requestId);
      await fetchWeaponRequests(false);
    } catch (error) {
      console.error("Error approving weapon request:", error);
      setError("Failed to approve weapon request");
    } finally {
      setProcessingRequestId(null);
      setProcessingAction(null);
    }
  };

  const rejectRequest = async (requestId: number) => {
    setError(null);
    setProcessingRequestId(requestId);
    setProcessingAction("reject");

    try {
      await rejectWeaponRequest(requestId);
      await fetchWeaponRequests(false);
    } catch (error) {
      console.error("Error rejecting weapon request:", error);
      setError("Failed to reject weapon request");
    } finally {
      setProcessingRequestId(null);
      setProcessingAction(null);
    }
  };

  const sortedWeaponRequests = useMemo(() => {
    const copy = [...weaponRequests];

    copy.sort((a, b) => {
      let result = 0;

      switch (sortColumn) {
        case "requestId":
          result = a.requestId - b.requestId;
          break;
        case "ammoCount":
          result = a.ammoCount - b.ammoCount;
          break;
        case "requestedById":
          result = a.requestedById - b.requestedById;
          break;
        case "requestedAt":
          result = safeTime(a.requestedAt) - safeTime(b.requestedAt);
          break;
        case "resolvedAt":
          result = safeTime(a.resolvedAt) - safeTime(b.resolvedAt);
          break;
        case "weaponSerial":
          result = a.weaponSerial.localeCompare(b.weaponSerial);
          break;
        case "requestNote":
          result = (a.requestNote ?? "").localeCompare(b.requestNote ?? "");
          break;
        case "status":
          result = a.status.localeCompare(b.status);
          break;
        default:
          result = 0;
      }

      return sortDirection === "asc" ? result : -result;
    });

    return copy;
  }, [weaponRequests, sortColumn, sortDirection]);

  const handleSort = (column: SortableColumn) => {
    if (column === sortColumn) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortColumn(column);
    setSortDirection("asc");
  };

  useEffect(() => {
    void fetchWeaponRequests();
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg text-white p-3 md:p-6 font-[Inter,system-ui,sans-serif]">
      <div className="bg-dark-panel rounded-xl p-4 md:p-5 border border-dark-border">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-4">
          <div>
            <p className="font-semibold text-2xl md:text-3xl text-white">
              Weapon Requests
            </p>
            <p className="text-sm text-gray-300 mt-1">
              Review, sort, approve, and reject submitted requests.
            </p>
          </div>

          <NavLink to={"/oic/weapon-handover"}>
            <button className="bg-purple-primary text-white border-none px-6 py-2.5 rounded-[25px] text-sm md:text-base font-medium cursor-pointer transition-colors duration-300 hover:bg-purple-hover">
              Back to Weapon Management
            </button>
          </NavLink>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="py-12 text-center text-gray-300">
            Loading weapon requests...
          </div>
        ) : sortedWeaponRequests.length === 0 ? (
          <div className="py-12 text-center text-gray-300">
            No weapon requests found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-dark-border">
            <table className="w-full min-w-[1200px] border-collapse text-sm">
              <thead className="bg-dark-primary text-white border-b border-dark-border">
                <tr>
                  {sortableColumns.map((column) => (
                    <th
                      key={column.key}
                      className="px-4 py-3 text-left whitespace-nowrap"
                    >
                      <button
                        type="button"
                        onClick={() => handleSort(column.key)}
                        className="inline-flex items-center gap-2 font-semibold text-sm hover:text-purple-primary transition-colors"
                      >
                        <span>{column.label}</span>
                        <span
                          className={`text-[10px] leading-none ${
                            sortColumn === column.key
                              ? "text-purple-primary"
                              : "text-gray-500"
                          }`}
                        >
                          {sortColumn === column.key
                            ? sortDirection === "asc"
                              ? "ASC"
                              : "DESC"
                            : "--"}
                        </span>
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center whitespace-nowrap">
                    Approve
                  </th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">
                    Reject
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedWeaponRequests.map((request) => {
                  const isProcessing =
                    processingRequestId === request.requestId;

                  return (
                    <tr
                      key={request.requestId}
                      className="border-b border-dark-border bg-dark-secondary"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        {request.requestId}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {request.weaponSerial}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {request.ammoCount}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {request.requestedById}
                      </td>
                      <td className="px-4 py-3">
                        {request.requestNote || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            request.status === "APPROVED"
                              ? "bg-green-500/20 text-green-300"
                              : request.status === "REJECTED"
                                ? "bg-red-500/20 text-red-300"
                                : "bg-yellow-500/20 text-yellow-300"
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDate(request.requestedAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDate(request.resolvedAt)}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          className="bg-green-600 text-white px-3 py-1.5 rounded-md text-xs md:text-sm hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          onClick={() => approveRequest(request.requestId)}
                          disabled={isProcessing}
                        >
                          {isProcessing && processingAction === "approve"
                            ? "Approving..."
                            : "Approve"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          className="bg-red-600 text-white px-3 py-1.5 rounded-md text-xs md:text-sm hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          onClick={() => rejectRequest(request.requestId)}
                          disabled={isProcessing}
                        >
                          {isProcessing && processingAction === "reject"
                            ? "Rejecting..."
                            : "Reject"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeaponRequests;
