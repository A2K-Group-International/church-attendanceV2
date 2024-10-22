import React, { useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react"; // Import FullCalendar
import dayGridPlugin from "@fullcalendar/daygrid"; // Import the DayGrid plugin for month view
import timeGridPlugin from "@fullcalendar/timegrid"; // Import the TimeGrid plugin for week and day views
import supabase from "@/api/supabase"; // Your Supabase client
import VolunteerSidebar from "@/components/volunteer/VolunteerSidebar"; // Sidebar component
import useUserData from "@/api/useUserData";

const VolunteerMainCalendar = () => {
  const [events, setEvents] = useState([]); // State to store fetched events
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  const { userData } = useUserData();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Wait until userData and group_id are available
    if (!userData || !userData.group_id) {
      setLoading(false);
      return; // Exit early if userData or group_id is not available
    }

    const groupId = userData.group_id; // Get groupId once it's confirmed available

    try {
      const { data: fetchedData, error } = await supabase
        .from("schedule") // Make sure to specify your table name
        .select("*") // Fetch all columns
        .eq("group_id", groupId); // Use groupId for filtering

      if (error) throw error;

      console.log(fetchedData);

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
  }, [userData]); // Add userData as a dependency to ensure it updates when userData changes

  useEffect(() => {
    fetchEvents(); // Fetch events when the component mounts
  }, [fetchEvents]);

  return (
    <VolunteerSidebar>
      <div className="flex h-screen">
        <div className="flex-1 overflow-auto p-4">
          {" "}
          {/* Added overflow-auto for scrolling */}
          {loading && <p>Loading events...</p>}
          {error && <p>{error}</p>}
          <div className="max-h-full max-w-full">
            {" "}
            {/* Set max width and height */}
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin]} // Include necessary plugins
              initialView="dayGridMonth" // Set the default view to Month view
              events={events} // Pass the fetched events
              headerToolbar={{
                left: "prev,next today", // Navigation buttons
                center: "title", // Title in the center
                right: "dayGridMonth,timeGridWeek,timeGridDay", // Month, week, and day views
              }}
              style={{ height: "100%", maxHeight: "80vh" }} // Adjust max height to fit screen
            />
          </div>
        </div>
      </div>
    </VolunteerSidebar>
  );
};

export default VolunteerMainCalendar;
