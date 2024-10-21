import React from "react";
import FullCalendar from "@fullcalendar/react"; // Import FullCalendar
import dayGridPlugin from "@fullcalendar/daygrid"; // Import the DayGrid plugin
import timeGridPlugin from "@fullcalendar/timegrid"; // Import the TimeGrid plugin
import interactionPlugin from "@fullcalendar/interaction"; // Import the Interaction plugin for event handling

const DashboardCalendar = ({ duties }) => {
  // Function to get events for the calendar
  const getEvents = () => {
    const events = [];

    // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayMap = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    // Loop through each duty to create events
    duties.forEach((duty) => {
      const {
        recurrence_days,
        duty_start_time,
        duty_end_time,
        duty_name,
        duty_description,
      } = duty;

      // Parse the start and end times
      const [startHours, startMinutes] = duty_start_time.split(":").map(Number);
      const [endHours, endMinutes] = duty_end_time.split(":").map(Number);

      // Generate events for the duty's recurrence days across the entire month
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1); // First day of the month
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of the month

      // Loop through each day of the month to check for duties
      for (
        let date = monthStart;
        date <= monthEnd;
        date.setDate(date.getDate() + 1)
      ) {
        const dayOfWeek = date.getDay(); // Get the current day's index (0-6)

        // Check if the current day matches any of the recurrence days
        const dayName = Object.keys(dayMap).find(
          (key) => dayMap[key] === dayOfWeek,
        );
        if (recurrence_days.includes(dayName)) {
          // Create event start and end dates
          const startDate = new Date(date);
          startDate.setHours(startHours, startMinutes); // Set the start time

          const endDate = new Date(date);
          endDate.setHours(endHours, endMinutes); // Set the end time

          // Create the event object
          events.push({
            title: duty_name || "Duty", // Set the event title
            start: startDate.toISOString(), // Start time in ISO format
            end: endDate.toISOString(), // End time in ISO format
            description: duty_description, // Optional: Store duty description
            allDay: false, // Set to true if this is an all-day event
          });
        }
      }
    });

    return events; // Return the generated events
  };

  const events = getEvents(); // Generate events for the month

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} // Include necessary plugins
      initialView="timeGridWeek" // Set the default view to week view
      events={events} // Pass the formatted events
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay", // Include month and day views
      }}
      editable={true} // Allow event editing
      eventClick={(info) => {
        // Handle event click (e.g., show details or edit)
        alert(
          `Event: ${info.event.title}\nDescription: ${info.event.extendedProps.description}`,
        );
      }}
    />
  );
};

export default DashboardCalendar;
