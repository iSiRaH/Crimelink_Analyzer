import { useMapContext } from "../contexts/useMapContext";
import api from "../services/api";

export function useFetchSafetyLocations() {
  const { map, setMarkers } = useMapContext();

  interface SafetyLocation{
    latitude: number;
    longitude: number;
    name: string;
  }

  const fetchSafetyLocations = async (selectedType: string) => {
    try {
      const response = await api.get(`/safety-locations`, {
        params: { type: selectedType },
      });
      const data = response.data;

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
