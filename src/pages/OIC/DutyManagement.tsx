// import {
//   FaChartBar,
//   FaUserFriends,
//   FaUserShield,
//   FaStickyNote,
// } from "react-icons/fa";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type {DateClickArg} from "@fullcalendar/interaction";
// import Sidebar from "../../components/Sidebar";
// import Topbar from "../../components/Topbar";
// import { useAuth } from "../../contexts/useAuth";

function DutyManagement() {
  // const {user, logout} = useAuth();
  // sample event in calender
  const events = [{ title: "new", date: new Date() },{ title: "new new", date: new Date("2025-11-20") }];

  const handleDateClick = (info : DateClickArg) => {
    alert(`You clicked on: ${info.dateStr}`);
    console.log("Full info object:", info);
  };

  // const menuItems = [
  //   { name: "Dashboard", icon: FaChartBar },
  //   { name: "Duty management", icon: FaUserFriends },
  //   { name: "Weapon handover", icon: FaUserShield },
  //   { name: "Notes", icon: FaStickyNote },
  // ];

  return (
    <>
      {/* <div className="flex flex-col h-screen">
        <Topbar
          name={user?.name ?? "Not Defined"}
          role={user?.role ?? "Not defined"}
        />

        <div className="flex flex-1">
          <Sidebar items={menuItems} logoutFunc={logout}/> */}

          <div className="flex-1 p-5 overflow-y-auto">
            <FullCalendar
              height="auto"
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              weekends={true}
              events={events}
              dateClick={handleDateClick}
            />
          </div>
        {/* </div>
      </div> */}
    </>
  );
}

export default DutyManagement;
