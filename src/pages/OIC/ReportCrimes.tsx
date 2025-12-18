import { CloudUpload, Icon } from "lucide-react";

function ReportCrimes() {
  return (
    <>
      <div className="bg-slate-500 w-full h-full p-6">
        <div className="bg-slate-800 p-5 rounded-lg">
          <h1 className="font-semibold text-3xl text-white mb-5 pl-4">
            Report Crimes
          </h1>
          <div className="flex flex-row justify-between">
            <div className="flex-1 bg-white mr-2 space-y-2 p-4 rounded-md">
              <h2 className="font-medium text-2xl">Crime Details</h2>
              <p className="text-base font-medium">Crime Type</p>
              <select className="w-full border-slate-300 border-[1px] rounded-sm py-2 pl-1">
                <option>Theft</option>
              </select>
              <p className="text-base font-medium">Location</p>
              <input
                type="text"
                className="w-full border-slate-300 border-[1px] rounded-sm py-2 pl-1"
              />
              <p className="text-base font-medium">Date & Time of Incident</p>
              <div className="w-full">
                <input
                  type="text"
                  className=" border-slate-300 border-[1px] rounded-sm py-2 pl-1"
                />
                <input
                  type="text"
                  className=" border-slate-300 border-[1px] rounded-sm ml-4 py-2 pl-1"
                />
              </div>
              <p className="text-base font-medium">Description</p>
              <textarea className="w-full border-slate-300 border-[1px] rounded-sm p-2" />
            </div>
            <div className="flex-1 bg-white ml-2 p-4 rounded-md">
              <h2 className="font-medium text-2xl mb-3">Evidance & Actions</h2>
              <div className="flex flex-col justify-center items-center gap-2 p-5 border-2 border-dashed mb-3">
                <CloudUpload size={60} />
                <p className="text-slate-400">Drag and Drop files here, or</p>
                <button className="bg-slate-700 py-2 px-4 rounded-md text-white hover:bg-slate-500 hover:text-black">
                  Upload Evidence
                </button>
              </div>
              <p className="text-base font-medium mb-3">Attached Files</p>
            </div>
          </div>
          <div className="pl-4 mt-4 flex gap-3">
            <button className="py-2 px-4 rounded-md bg-white hover:bg-slate-300">Cancel</button>
            <button className="py-2 px-4 rounded-md bg-slate-500 hover:bg-slate-600">Submit Report</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ReportCrimes;
