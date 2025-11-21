import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateClickArg } from "@fullcalendar/interaction";
import { useState } from "react";
import DutyPopupModel from "../../components/UI/DutyPopupModel";

function DutyManagement() {
  const events = [
    { title: "new", date: new Date() },
    { title: "new new", date: new Date("2025-11-20") },
  ];

  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const handleDateClick = (info: DateClickArg) => {
    // alert(`You clicked on: ${info.dateStr}`);
    // console.log("Full info object:", info);
    setSelectedDate(info.dateStr);
    setOpen(true);
  };

  return (
    <>
      <div className="flex-1 p-5 overflow-y-auto">
        <FullCalendar
          height="auto"
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          dayCellClassNames={"text-md font-semibold"}
          weekends={true}
          events={events}
          dateClick={handleDateClick}
        />
      </div>

      <DutyPopupModel open={open} onClose={() => setOpen(false)}>
        <h2 className="text-xl font-semibold mb-4">
          {`Details for ${selectedDate}`}
        </h2>

        <table className="w-full border mb-5">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Location</th>
              <th className="p-2 border">Time</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Description</th>
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
        <div>
          <button className="bg-[#f61010] text-lg font-semibold px-5 py-1.5 rounded-full hover:bg-[#fb3636] mr-3">
            Add Duty
          </button>
          <button
            className="bg-[#f61010] text-lg font-semibold px-5 py-1.5 rounded-full hover:bg-[#fb3636] mr-3"
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
        </div>
      </DutyPopupModel>
    </>
  );
}

export default DutyManagement;
