import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose,
} from "../../../shadcn/dialog"; // Import Shadcn Dialog components

import React, { useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react"; // Import FullCalendar
import dayGridPlugin from "@fullcalendar/daygrid"; // Import the DayGrid plugin for month view
import timeGridPlugin from "@fullcalendar/timegrid"; // Import the TimeGrid plugin for week and day views
import supabase from "@/api/supabase"; // Your Supabase client
import EventDialog from "@/components/volunteer/EventDialog"; // Dialog component

const CalendarDialog = ({ isOpen, onClose, userData }) => {
  const [events, setEvents] = useState([]); // State to store fetched events
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const [selectedEvent, setSelectedEvent] = useState(null); // State for selected event
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false); // State to control event dialog visibility

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
        .from("schedule") // Specify your table name
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
    setIsEventDialogOpen(true);
  };

  // Close the event dialog
  const closeEventDialog = () => {
    setIsEventDialogOpen(false);
    setSelectedEvent(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-4xl">
        <h2 className="mb-4 text-xl font-semibold">Calendar</h2>
        {loading && <p>Loading events...</p>}
        {error && <p>{error}</p>}
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
        <DialogFooter>
          <DialogClose>Close</DialogClose>
        </DialogFooter>
      </DialogContent>

      {/* Dialog for selected event */}
      <EventDialog
        open={isEventDialogOpen}
        onClose={closeEventDialog}
        event={selectedEvent}
      />
    </Dialog>
  );
};

export default CalendarDialog;
