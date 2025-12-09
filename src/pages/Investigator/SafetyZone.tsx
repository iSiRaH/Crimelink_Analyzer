import { RiPoliceBadgeLine } from "react-icons/ri";
import DropDownMenu from "../../components/UI/DropdownMenu";
import { FaHeart, FaRegHospital, FaShieldAlt } from "react-icons/fa";
import { AiTwotoneAlert } from "react-icons/ai";
import { FaPersonShelter } from "react-icons/fa6";
import { CiBank } from "react-icons/ci";
import { IoLibraryOutline } from "react-icons/io5";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMapContext } from "../../contexts/useMapContext";

const LIBRARIES: "places"[] = ["places"];

function SafetyZone() {
  const dropdownItems = [
    { itemTitle: "Police Station", itemIcon: <RiPoliceBadgeLine /> },
    { itemTitle: "Hospital", itemIcon: <FaRegHospital /> },
    { itemTitle: "Fire Station", itemIcon: <AiTwotoneAlert /> },
    { itemTitle: "Shelter", itemIcon: <FaPersonShelter /> },
    { itemTitle: "Safe Heven", itemIcon: <FaHeart /> },
    { itemTitle: "Commiunity Center", itemIcon: <CiBank /> },
    { itemTitle: "Security Post", itemIcon: <FaShieldAlt /> },
    { itemTitle: "Public Library", itemIcon: <IoLibraryOutline /> },
  ];

  const GOOGLE_MAP_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const center = useMemo(
    () => ({
      lat: 5.948202,
      lng: 80.548086,
    }),
    []
  );

  const { map, setMap, markers, setMarkers } = useMapContext();
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAP_API_KEY,
    libraries: LIBRARIES,
  });

  useEffect(() => {
    if (isLoaded && searchInputRef.current && map) {
      const autocompleteInstance = new google.maps.places.Autocomplete(
        searchInputRef.current,
        { types: ["geocode"] }
      );

      autocompleteInstance.bindTo("bounds", map);

      autocompleteInstance.addListener("place_changed", () => {
        const place = autocompleteInstance.getPlace();

        if (searchInputRef.current) {
          setSearchQuery(searchInputRef.current.value);
        }

        if (!place.geometry || !place.geometry.location) {
          console.log("No details available for input: '" + place.name + "'");
          return;
        }

        const newCenter = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        setMarkers([
          {
            lat: newCenter.lat,
            lng: newCenter.lng,
            name: place.name,
          },
        ]);
        map.panTo(newCenter);
        map.setZoom(15);
      });
    }
  }, [isLoaded, map, setMarkers]);

  const handleLoad = (mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log("Submitting Search for:", searchQuery);

    if (!map || !searchQuery.trim()) return;

    const service = new google.maps.places.PlacesService(map);

    service.textSearch({ query: searchQuery }, (results, status) => {
      console.log("Search Status:", status);
      if (
        status === google.maps.places.PlacesServiceStatus.OK &&
        results &&
        results.length > 0
      ) {
        const place = results[0];

        if (!place.geometry?.location) return;

        const newCenter = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        setMarkers([{ lat: newCenter.lat, lng: newCenter.lng }]);
        map.panTo(newCenter);
      }
    });
  };

  return (
    <>
      <div className="bg-slate-500 w-full h-full p-5">
        <p className="font-semibold text-3xl text-white mb-5">Safety Zone</p>
        <div className="flex flex-row w-full justify-around">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col aspect-auto w-1/5 gap-4 items-center bg-[#131e38] py-5 rounded-lg"
          >
            <div>
              <input
                type="text"
                placeholder="🔎 Search....."
                value={searchQuery}
                onChange={handleSearchChange}
                ref={searchInputRef}
                className="h-8 rounded-lg w-full pl-3"
              />
            </div>
            <div>
              <button
                type="submit"
                className="bg-blue-600 text-white font-semibold hover:bg-blue-800 hover:text-black px-7 py-2 rounded-xl"
              >
                Search
              </button>
            </div>
            <div>
              <DropDownMenu
                dropdownLabelName="Safety Type"
                items={dropdownItems}
              />
            </div>
          </form>
          <div className="w-3/5">
            {isLoaded && (
              <GoogleMap
                center={center}
                mapContainerClassName="w-full h-[500px] rounded-lg"
                zoom={14}
                onLoad={handleLoad}
              >
                {markers.map((marker, index) => (
                  <Marker
                    key={index}
                    position={{ lat: marker.lat, lng: marker.lng }}
                  />
                ))}
              </GoogleMap>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default SafetyZone;
