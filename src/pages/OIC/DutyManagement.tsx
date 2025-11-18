import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { useAuth } from "../../contexts/useAuth";

function DutyManagement() {
  const {user} = useAuth();

  return (
    <>
      <div className="flex flex-col h-screen">
        <Topbar
          name={user?.name ?? "Not Defined"}
          role={user?.role ?? "Not defined"}
        />

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
