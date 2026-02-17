import type React from "react";
import { IoIosArrowForward } from "react-icons/io";
import type { FieldOfficerCardProps } from "../../types/officers";

const FieldOfficerCard: React.FC<FieldOfficerCardProps> = ({
  id,
  name,
  status,
  onPress,
}) => {
  return (
    <div
      className="flex flex-row items-center bg-white w-full p-5 rounded-xl gap-3"
      onClick={onPress}
    >
      <div>
        <p className="text-gray-text text-sm font-semibold">ID: {id}</p>
        <p className="text-dark-primary font-bold text-lg">{name}</p>
      </div>
      <div>
        <p
          className={`border-2 px-3 py-1 rounded-full ${
            status === "Active"
              ? "bg-green-200 border-green-400 text-green-600"
              : status === "Inactive"
              ? "bg-red-200 border-red-400 text-red-600"
              : "bg-gray-200 border-gray-400 text-gray-600"
          }`} //FIX: change duty status
        >
          • {status || "Inactive"}
        </p>
      </div>
      <IoIosArrowForward className="text-dark-primary text-2xl" />
    </div>
  );
};

export default FieldOfficerCard;
