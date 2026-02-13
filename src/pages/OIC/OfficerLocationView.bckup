import React, { useMemo, useRef, useState } from "react";
import {
  GoogleMap,
  useLoadScript,
  Polyline,
  Marker,
} from "@react-google-maps/api";
import { toDefaultRange } from "../../utils/date";
import type { LocationPoint } from "../../types/location";
import { fetchOfficerLocations } from "../../services/officerLocation";

type LatLng = google.maps.LatLngLiteral;

const containerStyle: React.CSSProperties = { width: "100%", height: "100%" };

const OfficerLocationView = () => {
  const { fromLocal, toLocal } = useMemo(() => toDefaultRange(), []);
  const [badgeNo, setBadgeNo] = useState("");
  const [from, setFrom] = useState(fromLocal);
  const [to, setTo] = useState(toLocal);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<LocationPoint[]>([]);

  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const path: LatLng[] = useMemo(() => {
    return data
      .filter(
        (p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude),
      )
      .map((p) => ({ lat: p.latitude, lng: p.longitude }));
  }, [data]);

  const start = data[0];
  const end = data[data.length - 1];

  function fitToPath(points: LatLng[]) {
    if (!mapRef.current || points.length < 2) return;
    const bounds = new google.maps.LatLngBounds();
    points.forEach((pt) => bounds.extend(pt));
    mapRef.current.fitBounds(bounds, 40);
  }

  async function handleFetch() {
    setError("");
    if (!badgeNo.trim()) {
      setError("Enter officer badge number.");
      return;
    }

    const fromIso = toIsoFromDatetimeLocal(from);
    const toIso = toIsoFromDatetimeLocal(to);

    if (new Date(fromIso).getTime() >= new Date(toIso).getTime()) {
      setError("From must be before To.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchOfficerLocations({
        badgeNo: badgeNo.trim(),
        from: fromIso,
        to: toIso,
      });

      setData(res);
      if (res.length === 0) {
        setError("No points found for this range.");
      } else {
        // Fit bounds after state update
        setTimeout(
          () =>
            fitToPath(res.map((p) => ({ lat: p.latitude, lng: p.longitude }))),
          0,
        );
      }
    } catch (e: any) {
      setError(
        e?.response?.data?.message ??
          "Failed to load locations (check token/role).",
      );
    } finally {
      setLoading(false);
    }
  }

  if (loadError)
    return (
      <div style={{ padding: 12 }}>Map load error: {String(loadError)}</div>
    );
  if (!isLoaded) return <div style={{ padding: 12 }}>Loading Google Maps…</div>;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "380px 1fr",
        gap: 12,
        padding: 12,
      }}
    >
      {/* Left panel */}
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          height: "calc(100vh - 24px)",
          overflow: "auto",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Officer Location History (Google Maps)</h2>

        <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
          Badge No
        </label>
        <input
          value={badgeNo}
          onChange={(e) => setBadgeNo(e.target.value)}
          placeholder="e.g. BN-1023"
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />

        <div style={{ height: 10 }} />

        <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
          From
        </label>
        <input
          type="datetime-local"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />

        <div style={{ height: 10 }} />

        <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
          To
        </label>
        <input
          type="datetime-local"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />

        <div style={{ height: 12 }} />

        <button
          onClick={handleFetch}
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "1px solid #222",
            cursor: "pointer",
          }}
        >
          {loading ? "Loading..." : "Load Route"}
        </button>

        {error && <p style={{ color: "crimson" }}>{error}</p>}

        <hr />

        <h3>Summary</h3>
        <ul style={{ paddingLeft: 18 }}>
          <li>Points: {data.length}</li>
          <li>
            Start: {start?.ts ? new Date(start.ts).toLocaleString() : "-"}
          </li>
          <li>End: {end?.ts ? new Date(end.ts).toLocaleString() : "-"}</li>
        </ul>

        <h3>Timeline</h3>
        {data.length === 0 ? (
          <p style={{ color: "#666" }}>No points loaded.</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {data
              .slice()
              .reverse()
              .map((p, idx) => (
                <div
                  key={`${p.ts}-${idx}`}
                  style={{
                    padding: 10,
                    border: "1px solid #eee",
                    borderRadius: 8,
                  }}
                >
                  <div style={{ fontWeight: 700 }}>
                    {new Date(p.ts).toLocaleString()}
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 12 }}>
                    {p.latitude.toFixed(5)}, {p.longitude.toFixed(5)}
                  </div>
                  <div style={{ fontSize: 12, color: "#555" }}>
                    acc: {p.accuracyM ?? "-"}m | spd: {p.speedMps ?? "-"} | hdg:{" "}
                    {p.headingDeg ?? "-"}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Map panel */}
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          overflow: "hidden",
          height: "calc(100vh - 24px)",
        }}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: 6.9271, lng: 79.8612 }} // Colombo default
          zoom={11}
          onLoad={(map) => (mapRef.current = map)}
          options={{
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true,
          }}
        >
          {path.length >= 2 && (
            <Polyline
              path={path}
              options={{
                geodesic: true,
                strokeOpacity: 0.9,
                strokeWeight: 4,
              }}
            />
          )}

          {start && (
            <Marker
              position={{ lat: start.latitude, lng: start.longitude }}
              title="Start"
            />
          )}

          {end && (
            <Marker
              position={{ lat: end.latitude, lng: end.longitude }}
              title="End"
            />
          )}
        </GoogleMap>
      </div>
    </div>
  );
};

export default OfficerLocationView;
function toIsoFromDatetimeLocal(from: string) {
    throw new Error("Function not implemented.");
}

