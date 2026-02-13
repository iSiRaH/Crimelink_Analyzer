import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import type { OfficerLocationPopupProps } from "../../types/officers";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMapContext } from "../../contexts/useMapContext";
import { useAuth } from "../../contexts/useAuth";
import {
  fetchOfficerLastLocation,
  fetchOfficerLocations,
} from "../../services/officerLocation";
import api from "../../services/api";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const SRI_LANKA_BOUNDS = {
  north: 9.9,
  south: 5.8,
  west: 79.6,
  east: 82.0,
};

const OfficerLocationPopup: React.FC<OfficerLocationPopupProps> = ({
  open,
  onClose,
  officer,
}) => {
  // const { user } = useAuth();
  const [lastLocation, setLastLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [fromDate, setFromDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );
  const [toDate, setToDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setMap } = useMapContext();
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });
  const mapRef = useRef<google.maps.Map | null>(null);

  // const hasPermission = user?.role === "Admin" || user?.role === "OIC";

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    setMap(map);
  };

  const center = useMemo(
    () => ({
      lat: lastLocation?.latitude || 5.948202,
      lng: lastLocation?.longitude || 80.548086,
    }),
    [lastLocation],
  );

  // useEffect(() => {
    // async function fetchRole() {
    //   const res = await api.get("debug/whoami");
    //   console.log("Whoami response:", res.data);
    // }
    // fetchRole();
    // fetchLocations();
  // }, []);

  async function fetchLocations() {
    if (!officer) return;
    // console.log("Role", user?.role);

    // const token = localStorage.getItem("accessToken");
    // console.log("Token exists:", !!token);
    // if (token) {
    //   try {
    //     const parts = token.split(".");
    //     if (parts.length === 3) {
    //       const payload = JSON.parse(atob(parts[1]));
    //       console.log("JWT Payload:", payload);
    //     }
    //   } catch (e) {
    //     console.log("Could not decode JWT:", e);
    //   }
    // }

    if (!fromDate || !toDate) {
      setError("Please select both From and To dates.");
      return;
    }
    // if (!hasPermission) {
    //   setError(
    //     `Only Admin and OIC roles can view officer location history. Your current role: ${user?.role}`,
    //   );
    //   return;
    // }

    setLoading(true);
    setError(null);
    try {
      // Convert date strings to ISO DateTime format required by backend
      const fromDateTime = new Date(fromDate + "T00:00:00Z").toISOString();
      const toDateTime = new Date(toDate + "T23:59:59Z").toISOString();

      console.log(
        `Fetching locations for ${officer.badgeNo} from ${fromDateTime} to ${toDateTime}`,
      );
      const locations = await fetchOfficerLocations({
        badgeNo: officer.badgeNo,
        from: fromDateTime,
        to: toDateTime,
      });
      console.log("Locations fetched successfully:", locations);
      setError(null);
    } catch (error: unknown) {
      console.error("Error fetching locations:", error);

      // const axiosError = error as {
      //   response?: {
      //     status: number;
      //     statusText: string;
      //     data?: { message?: string };
      //   };
      //   config?: any;
      // } & Error;

      
      // console.error("Response status:", axiosError.response?.status);
      // console.error("Response data:", axiosError.response?.data);
      // console.error("Request config:", axiosError.config);

      // if (axiosError.response?.status === 403) {
      //   setError(
      //     `Access Denied (403): ${axiosError.response?.data?.message || "You don't have permission to view officer location history. Only Admin and OIC users can access this data."}`,
      //   );
      // } else if (axiosError.response?.status === 401) {
      //   setError("Session expired (401). Please log in again.");
      // } else if (axiosError.response?.status === 400) {
      //   setError(
      //     `Bad Request (400): ${axiosError.response?.data?.message || axiosError.message}`,
      //   );
      // } else if (axiosError.message) {
      //   setError(`Error: ${axiosError.message}`);
      // } else {
      //   setError("Failed to fetch location history. Please try again.");
      // }
    } finally {
      setLoading(false);
    }
  }

  const fetchLastLocation = useCallback(async () => {
    if (!officer) return;

    setLoading(true);
    setError(null);
    try {
      const lastLocation = await fetchOfficerLastLocation({
        badgeNo: officer.badgeNo,
      });
      console.log(
        "Last Location:",
        lastLocation.latitude,
        lastLocation.longitude,
      );
      setLastLocation({
        latitude: lastLocation.latitude,
        longitude: lastLocation.longitude,
      });
    } catch (err: unknown) {
      console.error("Error fetching last location:", err);

      // const axiosError = err as { response?: { status: number } } & Error;
      // if (axiosError.response?.status === 403) {
      //   setError(
      //     "Access Denied: You don't have permission to view officer locations.",
      //   );
      // } else if (axiosError.response?.status === 401) {
      //   setError("Session expired. Please log in again.");
      // } else {
      //   console.warn(
      //     "Failed to fetch last location, continuing with default map view",
      //   );
      // }
    } finally {
      setLoading(false);
    }
  }, [officer]);

  useEffect(() => {
    if (open) {
      fetchLastLocation();
    }
  }, [open, fetchLastLocation]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-5 rounded-lg w-[700px]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">
          {officer?.name} Location Details
        </h2>
        {/* <div className="mb-3 p-3 bg-gray-100 rounded text-xs border border-gray-300">
          <p className="font-semibold text-gray-800">🔍 Debug Info:</p>
          <p>User: {user?.name || "Unknown"}</p>
          <p>User ID: {user?.userId || "N/A"}</p>
          <p>
            Role:{" "}
            <span
              className={`font-bold ${hasPermission ? "text-green-600" : "text-red-600"}`}
            >
              {user?.role || "Not Set"}
            </span>
          </p>
          <p>
            Permission:{" "}
            {hasPermission ? "✓ Can Access" : "✗ Denied (Admin/OIC only)"}
          </p>
          <p className="mt-1 text-blue-700">
            Check Firefox/Chrome DevTools (F12) Network tab to see API response
          </p>
          <p className="text-gray-600 mt-1">
            If 403 error: Backend rejecting the request. Make sure logged in as
            OIC.
          </p>
        </div> */}
        {/*REMOVE : for debugging*/}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded text-red-700 text-sm">
            <p className="font-semibold">⚠️ Error:</p>
            <p>{error}</p>
          </div>
        )}
        <p>ID: {officer?.userId}</p>
        <p>Badge No: {officer?.badgeNo}</p>
        <p>
          Date of Birth:{" "}
          {officer?.dob ? new Date(officer.dob).toDateString() : "N/A"}
        </p>
        <p>Gender: {officer?.gender}</p>
        <p>Address: {officer?.address}</p>
        <p>Email: {officer?.email}</p>
        <p>Status: {officer?.status}</p>
        <p className="font-semibold mt-4">Location History:</p>
        <div className="flex gap-4 mb-4">
          <div className="flex flex-col">
            <label htmlFor="from" className="text-sm font-semibold">
              From:
            </label>
            <input
              id="from"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="to" className="text-sm font-semibold">
              To:
            </label>
            <input
              id="to"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
        </div>
        <button
          onClick={() => fetchLocations()}
          disabled={loading}
          className={`px-4 py-2 rounded font-semibold transition ${
            loading
              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
          }`}
        >
          {loading ? "Loading..." : "Find"}
        </button>
        <div>
          {isLoaded ? (
            <div className="h-[450px] w-full rounded-md overflow-hidden border">
              <GoogleMap
                center={center}
                zoom={15}
                mapContainerClassName="w-full h-[500px] rounded-lg"
                onLoad={onLoad}
                // onClick={onMapClick}
                options={{
                  restriction: {
                    latLngBounds: SRI_LANKA_BOUNDS,
                  },
                }}
              >
                <Marker
                  position={{
                    lat: lastLocation?.latitude || center.lat,
                    lng: lastLocation?.longitude || center.lng,
                  }}
                />
              </GoogleMap>
            </div>
          ) : (
            <div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />{" "}
              <p>loading ...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfficerLocationPopup;
