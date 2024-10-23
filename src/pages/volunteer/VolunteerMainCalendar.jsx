import React, { useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react"; // Import FullCalendar
import dayGridPlugin from "@fullcalendar/daygrid"; // Import the DayGrid plugin for month view
import timeGridPlugin from "@fullcalendar/timegrid"; // Import the TimeGrid plugin for week and day views
import supabase from "@/api/supabase"; // Your Supabase client
import VolunteerSidebar from "@/components/volunteer/VolunteerSidebar"; // Sidebar component
import useUserData from "@/api/useUserData";
import EventDialog from "@/components/volunteer/EventDialog"; // Dialog component

const VolunteerMainCalendar = () => {
  const [events, setEvents] = useState([]); // State to store fetched events
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const [selectedEvent, setSelectedEvent] = useState(null); // State for selected event
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control dialog visibility

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

      // Transform data into the format required by FullCalendar
      const calendarEvents = fetchedData.map((event) => ({
        id: event.id, // Add an ID for tracking the event
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

  // Handle event click
  const handleEventClick = (clickInfo) => {
    setSelectedEvent({
      title: clickInfo.event.title,
      start: clickInfo.event.start.toLocaleString(),
      end: clickInfo.event.end ? clickInfo.event.end.toLocaleString() : "",
      description: clickInfo.event.extendedProps.description,
    });
    setIsDialogOpen(true);
  };

  // Close the dialog
  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedEvent(null);
  };

  return (
    <VolunteerSidebar>
      <div className="flex h-screen overflow-hidden">
        {" "}
        {/* Container for sidebar and calendar */}
        <div className="flex-1 overflow-auto p-4">
          {" "}
          {/* Content area */}
          {loading && <p>Loading events...</p>}
          {error && <p>{error}</p>}
          <div className="h-full">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin]} // Include necessary plugins
              initialView="dayGridMonth" // Set the default view to Month view
              events={events} // Pass the fetched events
              eventClick={handleEventClick} // Handle event click
              headerToolbar={{
                left: "prev,next today", // Navigation buttons
                center: "title", // Title in the center
                right: "dayGridMonth,timeGridWeek,timeGridDay", // Month, week, and day views
              }}
              style={{ height: "70vh", maxHeight: "80vh" }} // Limit height to fit screen better
            />
          </div>
          {/* Dialog for selected event */}
          <EventDialog
            open={isDialogOpen}
            onClose={closeDialog}
            event={selectedEvent}
          />
        </div>
      </div>
    </VolunteerSidebar>
  );
};

export default VolunteerMainCalendar;
