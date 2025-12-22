import { RiPoliceBadgeLine } from "react-icons/ri";
import DropDownMenu from "../../components/UI/DropdownMenu";
import { FaHeart, FaRegHospital, FaShieldAlt } from "react-icons/fa";
import { AiTwotoneAlert } from "react-icons/ai";
import { FaPersonShelter } from "react-icons/fa6";
import { CiBank } from "react-icons/ci";
import { IoLibraryOutline } from "react-icons/io5";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useState } from "react";

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

  const GOOGLE_MAP_API_KEY = "AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg";

  const center = {
    lat: 5.948202,
    lng: 80.548086,
  };

  const [mapLoaded, setMapLoaded] = useState(false);

  const handleLoad = () => {
    setMapLoaded(true);
  };

  return (
    <>
      <div className="bg-slate-500 w-full h-full p-5">
        <p className="font-semibold text-3xl text-white mb-5">Safety Zone</p>
        <div className="flex flex-row w-full justify-around">
          <div className="flex flex-col aspect-auto w-1/5 gap-4 items-center bg-[#131e38] py-5 rounded-lg">
            <div>
              <input
                type="text"
                placeholder="🔎 Search....."
                className="h-8 rounded-lg w-full pl-3"
              />
            </div>
            <div>
              <button className="bg-blue-600 text-white font-semibold hover:bg-blue-800 hover:text-black px-7 py-2 rounded-xl">
                Search
              </button>
            </div>
            <div>
              <DropDownMenu
                dropdownLabelName="Safety Type"
                items={dropdownItems}
              />
            </div>
          </div>
          <div className="w-3/5">
            <LoadScript googleMapsApiKey={GOOGLE_MAP_API_KEY}>
              <GoogleMap
                center={center}
                mapContainerClassName="w-full h-[500px] rounded-lg"
                zoom={14}
                onLoad={handleLoad}
              >
                {mapLoaded && <Marker position={center} />}
              </GoogleMap>
            </LoadScript>
          </div>
        </div>
      </div>
    </>
  );
}

export default SafetyZone;
