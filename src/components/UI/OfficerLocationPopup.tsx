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
