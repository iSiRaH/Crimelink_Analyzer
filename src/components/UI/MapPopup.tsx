import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import React, { useEffect, useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import { useMapContext } from "../../contexts/useMapContext";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const SRI_LANKA_BOUNDS = {
  north: 9.9,
  south: 5.8,
  west: 79.6,
  east: 82.0,
};

const MapPopup: React.FC<MapPopupProps> = ({
  open,
  onClose,
  onLocationSelect,
  onClear,
}) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const { map, setMap, markers, setMarkers } = useMapContext();
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const center = useMemo(
    () => ({
      lat: 5.948202,
      lng: 80.548086,
    }),
    []
  );

  useEffect(() => {
    map?.setCenter(center);
  }, [map, center]);

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    setMap(map);
  };

  const onMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    const location = {
      latitude: e.latLng.lat(),
      longitude: e.latLng.lng(),
    };

    setMarkers([
      {
        latitude: location.latitude,
        longitude: location.longitude,
      },
    ]);
    onLocationSelect(location);
  };

  const handleClear = () => {
    setMarkers([]);
    onClear();
  };

  if (!open) return null;

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center gap-3 font-semibold text-lg h-full">
        <Box>
          <CircularProgress />
        </Box>
        Loading Map....
      </div>
    );
  }

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-5 rounded-lg w-[700px]"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoaded && (
          <div className="h-[450px] w-full rounded-md overflow-hidden border">
            <GoogleMap
              center={center}
              zoom={15}
              mapContainerClassName="w-full h-[500px] rounded-lg"
              onLoad={onLoad}
              onClick={onMapClick}
              options={{
                restriction: {
                  latLngBounds: SRI_LANKA_BOUNDS,
                },
              }}
            >
              {markers.map((marker, index) => (
                <Marker
                  key={index}
                  position={{ lat: marker.latitude, lng: marker.longitude }}
                />
              ))}
            </GoogleMap>
          </div>
        )}
        <div className="mt-3">
          <button
            onClick={onClose}
            className="bg-slate-700 py-2 px-4 rounded-md text-white hover:bg-slate-500 hover:text-black mx-2"
          >
            Submit
          </button>
          <button
            className="bg-slate-600 py-2 px-4 rounded-md text-white hover:bg-slate-500 hover:text-black"
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MapPopup;
