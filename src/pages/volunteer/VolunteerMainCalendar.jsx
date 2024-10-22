import React, { useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react"; // Import FullCalendar
import dayGridPlugin from "@fullcalendar/daygrid"; // Import the DayGrid plugin
import supabase from "@/api/supabase"; // Your Supabase client
import VolunteerSidebar from "@/components/volunteer/VolunteerSidebar"; // Sidebar component

const VolunteerMainCalendar = () => {
  const [events, setEvents] = useState([]); // State to store fetched events
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: fetchedData, error } = await supabase
        .from("schedule") // Change to your table name
        .select("*");

      if (error) throw error;

      // Transform data into the format required by FullCalendar
      const calendarEvents = fetchedData.map((event) => ({
        title: event.name, // Set event title
        start: event.schedule_date, // Use schedule_date for start time
        end: event.schedule_date, // Set end time same as start time for all-day events
        description: event.description || "", // Optional: Store event description
      }));

      setEvents(calendarEvents); // Set events for the calendar
    } catch (err) {
      setError("Error fetching events. Please try again.");
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(); // Fetch events when the component mounts
  }, [fetchEvents]);

  return (
    <VolunteerSidebar>
      <div className="flex h-screen">
        <div className="flex-1 p-4">
          {loading && <p>Loading events...</p>}
          {error && <p>{error}</p>}
          <FullCalendar
            plugins={[dayGridPlugin]} // Include the necessary DayGrid plugin
            initialView="dayGridMonth" // Set the default view to Month view
            events={events} // Pass the fetched events
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay", // Month and day views available
            }}
            style={{ height: "100%" }} // Make calendar take up full height
          />
        </div>
      </div>
    </VolunteerSidebar>
  );
};

export default VolunteerMainCalendar;
