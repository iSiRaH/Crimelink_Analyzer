import { RiPoliceBadgeLine } from "react-icons/ri";
import DropDownMenu from "../../components/UI/DropdownMenu";
import { FaHeart, FaRegHospital, FaShieldAlt } from "react-icons/fa";
import { AiTwotoneAlert } from "react-icons/ai";
import { FaPersonShelter } from "react-icons/fa6";
import { CiBank } from "react-icons/ci";
import { IoLibraryOutline } from "react-icons/io5";
import {
  Circle,
  GoogleMap,
  Marker,
  useLoadScript,
} from "@react-google-maps/api";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMapContext } from "../../contexts/useMapContext";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import searchPlacesInViewport from "../../services/searchPlacesInViewport";
import { getCrimeLocations } from "../../api/crimeReportService";
import type { crimeLocationType } from "../../types/crime";
import { getCrimeColor } from "../../utils/utils";
import { CRIME_COLORS } from "../../constants/crimeTypeColors";

const LIBRARIES: "places"[] = ["places"];

function SafetyZone() {
  const GOOGLE_MAP_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const dropdownItems = [
    {
      itemTitle: "Police Station",
      itemIcon: <RiPoliceBadgeLine />,
      action: () => onDropdownItemClicked("POLICE"),
    },
    {
      itemTitle: "Hospital",
      itemIcon: <FaRegHospital />,
      action: () => onDropdownItemClicked("HOSPITAL"),
    },
    {
      itemTitle: "Fire Station",
      itemIcon: <AiTwotoneAlert />,
      action: () => onDropdownItemClicked("FIRE_STATION"),
    },
    {
      itemTitle: "Shelter",
      itemIcon: <FaPersonShelter />,
      action: () => onDropdownItemClicked("SHELTER"),
    },
    {
      itemTitle: "Safe Heven",
      itemIcon: <FaHeart />,
      action: () => onDropdownItemClicked("SAFE_HEAVEN"),
    },
    {
      itemTitle: "Commiunity Center",
      itemIcon: <CiBank />,
      action: () => onDropdownItemClicked("COMMIUNITY_CENTER"),
    },
    {
      itemTitle: "Security Post",
      itemIcon: <FaShieldAlt />,
      action: () => onDropdownItemClicked("SECURITY_POST"),
    },
    {
      itemTitle: "Public Library",
      itemIcon: <IoLibraryOutline />,
      action: () => onDropdownItemClicked("PUBLIC_LIBRARY"),
    },
  ];

  const center = useMemo(
    () => ({
      lat: 5.948202,
      lng: 80.548086,
    }),
    []
  );

  const { map, setMap, markers, setMarkers } = useMapContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [crimes, setCrimes] = useState<crimeLocationType[]>([]);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAP_API_KEY,
    libraries: LIBRARIES,
  });

  const currentDropdownLabel = filterType
    ? filterType.replace("_", " ")
    : "Safety Type";

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
            latitude: newCenter.lat,
            longitude: newCenter.lng,
            name: place.name,
          },
        ]);
        map.panTo(newCenter);
        map.setZoom(15);
      });
    }

    const fetchCrimeLocations = async () => {
      try {
        const crimeLocations = await getCrimeLocations();
        setCrimes(crimeLocations);
        console.log(crimeLocations);
      } catch (err) {
        console.error("Error Fetching crime locations: ", err);
      }
    };
    fetchCrimeLocations();
  }, [isLoaded, map, setMarkers]);

  const onDropdownItemClicked = (type: string) => {
    console.log(`Dropdown item clicked: ${type}`); //testing purposes
    setFilterType(type);

    if (mapRef.current && searchQuery) {
      searchPlacesInViewport(
        mapRef.current,
        `${searchQuery} ${type.replace("_", " ")}`,
        setMarkers
      );
    }
  };

  const handleLoad = (mapInstance: google.maps.Map) => {
    mapRef.current = mapInstance;
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

        setMarkers([{ latitude: newCenter.lat, longitude: newCenter.lng }]);
        map.panTo(newCenter);
      }
    });
  };

  // if map still loading
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

  return (
    <>
      <div className="bg-slate-500 w-full h-full p-5">
        <p className="font-semibold text-3xl text-white mb-5">Safety Zone</p>
        <div className="flex flex-row w-full justify-around">
          <div className="flex flex-col aspect-auto w-1/5 gap-4 items-center bg-[#131e38] py-5 rounded-lg">
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col gap-4 items-center"
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
                  dropdownLabelName={currentDropdownLabel}
                  items={dropdownItems}
                />
              </div>
            </form>
            <div className="flex flex-col gap-2">
              <p className="text-white font-semibold text-lg ">Color Guide</p>
              <div className="flex flex-col gap-1 pl-3">
                <div className="flex flex-row gap-2 items-center">
                  <div
                    className={"h-3 w-3 rounded-full"}
                    style={{ backgroundColor: `${CRIME_COLORS.THEFT}` }}
                  ></div>
                  <p className="text-white font-medium">Theft</p>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <div
                    className={"h-3 w-3 rounded-full"}
                    style={{ backgroundColor: `${CRIME_COLORS.ASSAULT}` }}
                  ></div>
                  <p className="text-white font-medium">Assault</p>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <div
                    className={"h-3 w-3 rounded-full"}
                    style={{ backgroundColor: `${CRIME_COLORS.BURGLARY}` }}
                  ></div>
                  <p className="text-white font-medium">Burglary</p>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <div
                    className={"h-3 w-3 rounded-full"}
                    style={{ backgroundColor: `${CRIME_COLORS.ROBBERY}` }}
                  ></div>
                  <p className="text-white font-medium">Robbery</p>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <div
                    className={"h-3 w-3 rounded-full"}
                    style={{ backgroundColor: `${CRIME_COLORS.VANDALISM}` }}
                  ></div>
                  <p className="text-white font-medium">Vandalism</p>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <div
                    className={"h-3 w-3 rounded-full"}
                    style={{ backgroundColor: `${CRIME_COLORS.DRUG_OFFENSE}` }}
                  ></div>
                  <p className="text-white font-medium">Drug Offense</p>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <div
                    className={"h-3 w-3 rounded-full"}
                    style={{ backgroundColor: `${CRIME_COLORS.TRAFFIC_VIOLATION}` }}
                  ></div>
                  <p className="text-white font-medium">Traffic Violation</p>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <div
                    className={"h-3 w-3 rounded-full"}
                    style={{ backgroundColor: `${CRIME_COLORS.HOMICIDE}` }}
                  ></div>
                  <p className="text-white font-medium">Homicide</p>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <div
                    className={"h-3 w-3 rounded-full"}
                    style={{ backgroundColor: `${CRIME_COLORS.FRAUD}` }}
                  ></div>
                  <p className="text-white font-medium">Fraud</p>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <div
                    className={"h-3 w-3 rounded-full"}
                    style={{ backgroundColor: `${CRIME_COLORS.ARSON}` }}
                  ></div>
                  <p className="text-white font-medium">Arson</p>
                </div>
              </div>
            </div>
          </div>
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
                    position={{ lat: marker.latitude, lng: marker.longitude }}
                  />
                ))}
                {crimes.map((crime, index) => (
                  <Circle
                    key={index}
                    center={{ lat: crime.latitude, lng: crime.longitude }}
                    radius={200}
                    options={{
                      fillColor: getCrimeColor(crime.crimeType),
                      fillOpacity: 0.5,
                      strokeColor: getCrimeColor(crime.crimeType),
                      strokeWeight: 2,
                      strokeOpacity: 0.9,
                    }}
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
