import { createContext, useState } from "react";

type Marker = {
  lat: number;
  lng: number;
  name?: string;
};
type MapType = google.maps.Map | null;

interface MapContextType {
  map: MapType;
  setMap: (map: MapType) => void;
  markers: Marker[];
  setMarkers: (markers: Marker[]) => void;
}

 const MapContext = createContext<MapContextType | undefined>(undefined);

 const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const [map, setMap] = useState<MapType>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);

  return (
    <MapContext.Provider value={{ map, setMap, markers, setMarkers }}>
      {children}
    </MapContext.Provider>
  );
};

export { MapContext, MapProvider };