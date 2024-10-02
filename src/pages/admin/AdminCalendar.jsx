import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { fetchAllEvents } from "../../api/userService";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../shadcn/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
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

  // Sheet states
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetEventList, setSheetEventList] = useState([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const fetchEvents = await fetchAllEvents();

        const transformedEvents = fetchEvents.flatMap((event) => {
          const localTimezone = dayjs.tz.guess(); // User's local timezone

          const eventDate = dayjs(event.schedule).tz(localTimezone); // Adjust schedule to local timezone

          return event.time.map((time) => {
            const [hours, minutes] = time.split(":").slice(0, 2);

            const eventDateTime = eventDate
              .set("hour", parseInt(hours, 10))
              .set("minute", parseInt(minutes, 10));

            // Convert to UTC for consistent storage/display
            const startUtc = eventDateTime.utc().toISOString();

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

  // Event click handler for Modal
  const handleEventClick = (info) => {
    const { title, extendedProps, start } = info.event;
    const { description } = extendedProps;

    const formattedTime = dayjs(start).format("YYYY-MM-DD HH:mm");
    setEventTitle(title);
    setEventTime(formattedTime);
    setEventDescription(description);
    setEventDialogOpen(true);
  };

  // Date click handler for Sheet
  const handleDateClick = (info) => {
    const clickedDate = dayjs(info.dateStr).format("YYYY-MM-DD");

    const matchedEvents = events.filter((item) => {
      const eventDate = dayjs(item.start).format("YYYY-MM-DD");
      return eventDate === clickedDate;
    });

    if (matchedEvents.length > 0) {
      setSheetEventList(matchedEvents); // Set events for the sheet
    } else {
      setSheetEventList([]); // Clear if no events found
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
          eventTimeFormat={{ // Ensure 24-hour format
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
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
            <SheetDescription>
              {sheetEventList.length > 0 ? (
                sheetEventList.map((item, index) => (
                  <div key={index}>
                    <h2 className="font-bold">{item.title}</h2>
                    <p>{item.description}</p>
                    <p>{dayjs(item.start).tz(dayjs.tz.guess()).format("HH:mm")}</p> {/* Localized 24-hour format */}
                  </div>
                ))
              ) : (
                <p>No events found.</p>
              )}
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </AdminSidebar>
  );
};

export default AdminCalendar;
