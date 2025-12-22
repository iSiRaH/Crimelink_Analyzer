import { useMapContext } from "../contexts/useMapContext";

export function useFetchSafetyLocations() {
  const { map, setMarkers } = useMapContext();

  interface SafetyLocation{
    latitude: number;
    longitude: number;
    name: string;
  }

  const fetchSafetyLocations = async (selectedType: string) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/safety-locations?type=${selectedType}`
      );
      const data = await response.json();

      setMarkers(
        data.map((loc: SafetyLocation) => ({
          lat: loc.latitude,
          lng: loc.longitude,
          name: loc.name,
        }))
      );

      if (data.length > 0 && map) {
        map.panTo({ lat: data[0].latitude, lng: data[0].longitude });
      }
    } catch (error) {
      console.error("Error fetching safety locations:", error);
    }
  };
  return { fetchSafetyLocations };
}
