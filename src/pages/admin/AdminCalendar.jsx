import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { fetchAllEvents } from "../../api/userService";
import dayjs from "dayjs"; // Import dayjs
import utc from "dayjs/plugin/utc"; // Import UTC plugin
import timezone from "dayjs/plugin/timezone"; // Import timezone plugin
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../shadcn/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../shadcn/sheet";

dayjs.extend(utc);
dayjs.extend(timezone);

const AdminCalendar = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  // Dialog states
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventDescription, setEventDescription] = useState("");

  //Sheet states
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetEventList, setSheetEventList] = useState([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const fetchEvents = await fetchAllEvents();

        const transformedEvents = fetchEvents.flatMap((event) => {
          // Use local timezone for the transformation
          const localTimezone = dayjs.tz.guess(); // Get user's local timezone

          // Parse the schedule time
          const eventDate = dayjs(event.schedule); // Assume schedule is in UTC

          return event.time.map((time) => {
            // Extract the hour and minute from time
            const [hours, minutes] = time.split(":").slice(0, 2);

            // Create a local datetime object for the event
            const eventDateTime = eventDate
              .set("hour", parseInt(hours, 10))
              .set("minute", parseInt(minutes, 10));

            // Convert to UTC for storage in FullCalendar
            const startUtc = eventDateTime
              .tz(localTimezone)
              .utc()
              .toISOString();

            return {
              title: event.name,
              start: startUtc,
              description: event.description,
            };
          });
        });

        setEvents(transformedEvents);
      } catch (error) {
        setError("Failed to load schedule.", error);
      }
    };

    fetchSchedule();
  }, []);

  // Event click handler
  const handleEventClick = (info) => {
    const { title, extendedProps, start } = info.event;
    const { description } = extendedProps;

    // Format the event time for display
    const formattedTime = dayjs(start).format("YYYY-MM-DD HH:mm");
    setEventTitle(title);
    setEventTime(formattedTime);
    setEventDescription(description);
    setEventDialogOpen(true);
  };

  // Date click handler
  const handleDateClick = (info) => {
    const clickedDate = dayjs(info.dateStr).format("YYYY-MM-DD"); // Format clicked date

    // Filter events that match the clicked date
    const matchedEvents = events.filter((item) => {
      const eventDate = dayjs(item.start).format("YYYY-MM-DD"); // Format event start date
      return eventDate === clickedDate;
    });

    // Log or display the matched events
    if (matchedEvents.length > 0) {
      matchedEvents.forEach((event) => {
        console.log(`Event: ${event.title}`);
        console.log(`Description: ${event.description}`);
        console.log(`Time: ${dayjs(event.start).format("HH:mm")}`);
      });
      setSheetEventList(matchedEvents);
    } else {
      setSheetEventList();
      console.log("No events found on this date.");
    }

    setIsSheetOpen(true);
  };

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

      {/* Event Modal */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{eventTitle}</DialogTitle>
            <DialogDescription>
              {eventDescription}
              <p>{eventTime}</p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Event Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Event List</SheetTitle>
            <SheetDescription className="sr-only"></SheetDescription>
            {sheetEventList.map((item, index) => (
              <div key={index}>
                <h2 className="font-bold">{item.title}</h2>
                <p>{item.description}</p>
                <p>{item.start}</p>
              </div>
            ))}
            {console.log(sheetEventList)}
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </AdminSidebar>
  );
};

export default AdminCalendar;
