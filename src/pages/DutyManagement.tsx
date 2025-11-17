import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function DutyManagement() {
  return (
    <>
      <div className="flex flex-col h-screen">
      <Topbar />

      <div className="flex flex-1">
        <Sidebar />

        <div className="flex-1 p-5 overflow-y-auto">
          <FullCalendar
            height="auto"
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            weekends={true}
          />
        </div>
      </div>
    </div>
    </>
  );
}

export default DutyManagement;
