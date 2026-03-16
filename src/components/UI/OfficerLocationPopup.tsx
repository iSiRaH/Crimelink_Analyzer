import {
  GoogleMap,
  Marker,
  Polyline,
  useLoadScript,
} from "@react-google-maps/api";
import type { OfficerLocationPopupProps } from "../../types/officers";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMapContext } from "../../contexts/useMapContext";
import {
  fetchOfficerLastLocation,
  fetchOfficerLocations,
} from "../../services/officerLocation";
import type { MapLocationPoint } from "../../types/location";

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
  const [locations, setLocations] = useState<MapLocationPoint[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { setMap } = useMapContext();
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });
  const mapRef = useRef<google.maps.Map | null>(null);

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

  const path = useMemo(
    () =>
      (locations ?? []).map((l) => ({
        lat: l.latitude,
        lng: l.longitude,
      })),
    [locations],
  );

  async function fetchLocations() {
    if (!officer) return;

    if (!fromDate || !toDate) {
      setError("Please select both From and To dates.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const fromDateTime = new Date(fromDate + "T00:00:00Z").toISOString();
      const toDateTime = new Date(toDate + "T23:59:59Z").toISOString();

      console.log(
        `Fetching locations for ${officer.badgeNo} from ${fromDateTime} to ${toDateTime}`,
      ); //REMOVE : for debugging
      const loc = await fetchOfficerLocations({
        badgeNo: officer.badgeNo,
        from: fromDateTime,
        to: toDateTime,
      });
      await setLocations(loc);
      console.log("Locations fetched successfully:", locations); //REMOVE : for debugging
      setError(null);
    } catch (error: unknown) {
      console.error("Error fetching locations:", error);
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
      ); //REMOVE : for debugging
      setLastLocation({
        latitude: lastLocation.latitude,
        longitude: lastLocation.longitude,
      });
    } catch (err: unknown) {
      console.error("Error fetching last location:", err);
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-xl border border-dark-border bg-dark-panel p-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex flex-col gap-2">
          <h2 className="text-3xl font-semibold">
            {officer?.name} Location Details
          </h2>
          <p className="text-sm text-gray-400">
            Track latest position and route history by date range.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/60 bg-red-950/50 p-3 text-sm text-red-200">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}
        <div className="mb-5 grid grid-cols-1 gap-3 rounded-xl bg-dark-bg p-4 text-sm text-gray-300 md:grid-cols-2">
          <p>
            <span className="font-semibold text-white">ID:</span>{" "}
            {officer?.userId}
          </p>
          <p>
            <span className="font-semibold text-white">Badge No:</span>{" "}
            {officer?.badgeNo}
          </p>
          <p>
            <span className="font-semibold text-white">Date of Birth:</span>{" "}
            {officer?.dob ? new Date(officer.dob).toDateString() : "N/A"}
          </p>
          <p>
            <span className="font-semibold text-white">Gender:</span>{" "}
            {officer?.gender}
          </p>
          <p className="md:col-span-2">
            <span className="font-semibold text-white">Address:</span>{" "}
            {officer?.address}
          </p>
          <p>
            <span className="font-semibold text-white">Email:</span>{" "}
            {officer?.email}
          </p>
          <p>
            <span className="font-semibold text-white">Status:</span>{" "}
            {officer?.status}
          </p>
        </div>

        <p className="mb-3 text-lg font-semibold">Location History</p>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-1">
            <label htmlFor="from" className="text-sm font-semibold">
              From:
            </label>
            <input
              id="from"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-10 rounded-xl border-none bg-white px-3 text-sm text-dark-bg outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="to" className="text-sm font-semibold">
              To:
            </label>
            <input
              id="to"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-10 rounded-xl border-none bg-white px-3 text-sm text-dark-bg outline-none"
            />
          </div>
          <button
            onClick={() => fetchLocations()}
            disabled={loading}
            className="h-10 rounded-lg bg-green-500 px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Loading..." : "Find"}
          </button>
        </div>

        <div>
          {isLoaded ? (
            <div className="h-[450px] w-full overflow-hidden rounded-xl border border-dark-border bg-dark-bg">
              <GoogleMap
                center={center}
                zoom={15}
                mapContainerClassName="h-[500px] w-full"
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
                {path.length > 1 && (
                  <Polyline
                    path={path}
                    options={{
                      strokeColor: "#0000ff",
                      strokeOpacity: 0.9,
                      strokeWeight: 4,
                      geodesic: true,
                    }}
                  />
                )}
              </GoogleMap>
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-xl bg-dark-bg">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white" />
              <p className="text-gray-400">Loading ...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfficerLocationPopup;
