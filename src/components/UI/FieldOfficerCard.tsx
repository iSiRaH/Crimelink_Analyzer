import type React from "react";
import { IoIosArrowForward } from "react-icons/io";
import type { FieldOfficerCardProps } from "../../types/officers";

const FieldOfficerCard: React.FC<FieldOfficerCardProps> = ({
  id,
  name,
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
        <p className="bg-blue-200 border-blue-400 border-2 text-blue-600 px-3 py-1 rounded-full">
          On Duty
        </p>
      </div>
      <IoIosArrowForward className="text-dark-primary text-2xl" />
    </div>
  );
};

export default FieldOfficerCard;
