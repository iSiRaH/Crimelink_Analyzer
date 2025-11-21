import { IoSearch } from "react-icons/io5";
import DropDownMenu from "../../components/UI/DropdownMenu";

function PlateRegistry() {
  return (
    <>
      <div className="bg-slate-500 w-full h-full p-5">
        <div className="bg-slate-800 p-5">
          <h1 className="font-semibold text-3xl text-white">Plate Registry</h1>
          <div className="flex flex-row gap-3 mt-5 items-center justify-start">
            <div className="relative w-2/5">
              <IoSearch
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by Plate, Owner or Chassis"
                className="w-full py-2 pl-9 pr-4 rounded-md"
              />
            </div>
            {/* dropdown menus here */}
            <div className="">
              <DropDownMenu
                dropdownLabelName="Filter by Status"
                items={[{ itemTitle: "new" },{itemTitle:"new2"}]}
              />
            </div>
            <div className="">
              <DropDownMenu
                dropdownLabelName="Filter by Date"
                items={[{ itemTitle: "new" },{itemTitle:"new2"}]}
              />
            </div>
            <div className="">
              <DropDownMenu
                dropdownLabelName="Vehicle Type"
                items={[{ itemTitle: "new" },{itemTitle:"new2"}]}
              />
            </div>
          </div>
        </div>
        <div className="w-full flex justify-center mt-5">
          <table className="w-5/6 border mb-5">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Number Plate</th>
              <th className="p-2 border">Owner Name</th>
              <th className="p-2 border">Vehicle Type</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Last Update</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="p-2 border"></td>
              <td className="p-2 border"></td>
              <td className="p-2 border"></td>
              <td className="p-2 border"></td>
              <td className="p-2 border"></td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </>
  );
}

export default PlateRegistry;
