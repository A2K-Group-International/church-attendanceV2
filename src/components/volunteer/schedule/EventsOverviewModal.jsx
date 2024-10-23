import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../../../shadcn/dialog"; // Import Shadcn Dialog components
import { Button } from "../../../shadcn/button"; // Import Shadcn Button component
import FullCalendar from "@fullcalendar/react"; // Import FullCalendar
import dayGridPlugin from "@fullcalendar/daygrid"; // Import Day Grid plugin
import timeGridPlugin from "@fullcalendar/timegrid"; // Import Time Grid plugin
import moment from "moment"; // Import moment.js for date manipulation

const EventsOverviewModal = ({ isOpen, onRequestClose, events }) => {
  // Create events based on the events data
  const calendarEvents = events.map((event) => {
    const startDateTime = moment(`${event.schedule_date} ${event.time[0]}`)
      .utc()
      .format("YYYY-MM-DDTHH:mm:ss");

    return {
      title: event.name,
      start: startDateTime, // Correctly set start date-time
      end: startDateTime, // You can also adjust this if there's a specific end time
      allDay: false, // Set to true if it's an all-day event
    };
  });

  return (
    <Dialog open={isOpen} onOpenChange={onRequestClose}>
      <DialogContent className="sm:max-w-[1000px]">
        {" "}
        {/* Increase width for larger size */}
        <DialogHeader>
          <h2 className="text-lg font-semibold">Events Overview</h2>
        </DialogHeader>
        <DialogDescription className="py-2">
          Here are the upcoming events for this week.
        </DialogDescription>
        {/* FullCalendar Section */}
        <div className="py-4">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin]} // Include both plugins
            initialView="dayGridMonth" // Set the initial view to month
            events={calendarEvents}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay", // Include month view
            }}
            height="600px" // Adjust height for better visibility
          />
        </div>
        {/* Dialog Footer with Actions */}
        <DialogFooter className="flex justify-end">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventsOverviewModal;
