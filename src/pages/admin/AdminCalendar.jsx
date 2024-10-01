import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { fetchAllEvents } from "../../api/userService";

const AdminCalendar = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  const handleDateClick = (info) => {
    alert("Clicked date: " + info.dateStr);
  };

  const handleEventClick = (info) => {
    alert("Event: " + info.event.start);
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const fetchEvents = await fetchAllEvents();
        
        // Transform the events into FullCalendar format
        const transformedEvents = fetchEvents.map((event) => {
          return {
            title: event.name, 
            start: event.schedule, 
            description: event.description,
          };
        });
        
        setEvents(transformedEvents);
      } catch (error) {
        setError("Failed to load schedule.", error);
      }
    };
    fetchSchedule();
  }, []);

  return (
    <AdminSidebar>
      <div className="p-5">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events} 
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          editable={true}
          height={850}
        />
      </div>
    </AdminSidebar>
  );
};

export default AdminCalendar;
