import type React from "react";
import type { markerType } from "../types/safety";

function searchPlacesInViewport(
  map: google.maps.Map,
  query: string,
  setMarkers: React.Dispatch<React.SetStateAction<markerType[]>>
) {
  const service = new google.maps.places.PlacesService(map);
  const bounds = map.getBounds();

  if (!bounds) return;

  const request: google.maps.places.TextSearchRequest = {
    query,
    bounds,
  };

  service.textSearch(request, (results, status) => {
    if (status !== google.maps.places.PlacesServiceStatus.OK || !results) {
      setMarkers([]);
      return;
    }

    const newMarkers = results
      .filter((res) => res.geometry?.location)
      .map((res) => ({
        id: res.place_id!,
        latitude: res.geometry!.location!.lat(),
        longitude: res.geometry!.location!.lng(),
        name: res.name || "Unknown",
      }));

    setMarkers(newMarkers);
  });
}

export default searchPlacesInViewport;
