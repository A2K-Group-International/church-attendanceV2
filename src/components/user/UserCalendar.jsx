import { useEffect, useState, useCallback } from "react";
import { filterEvent } from "../../api/userService";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button } from "../../shadcn/button";
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
} from "../../shadcn/sheet";
import moment from "moment";
import CalendarCategoriesBtn from "../../components/admin/Calendar/CalendarCategoriesBtn";

export default function UserCalendar() {
  //Attend form states
  const [eventName, setEventName] = useState("");
  const [eventSchedule, setEventSchedule] = useState("");
  const [eventTime, setEventTime] = useState("");

  const [events, setEvents] = useState([]);
  // Dialog states
  const [eventDialog, setEventDialog] = useState({
    open: false,
    title: "",
    time: "",
    description: "",
  });

  // Sheet states
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetEventList, setSheetEventList] = useState([]);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchSchedule = useCallback(async (schedule_category) => {
    try {
      const fetchedEvents = await filterEvent(schedule_category);
      const transformedEvents = transformEvents(fetchedEvents);
      setEvents(transformedEvents);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      setError("Failed to load schedule.");
    }
  }, []);

  useEffect(() => {
    // Fetch all events initially or based on the selected category
    if (selectedCategory) {
      fetchSchedule(selectedCategory);
    } else {
      fetchSchedule();
    }
  }, [selectedCategory, fetchSchedule]);

  // Transform the events data for FullCalendar
  const transformEvents = (events) => {
    return events.flatMap((event) => {
      const eventDate = moment(event.schedule_date);

      return event.time.map((time) => {
        const [hours, minutes] = time.split(":").slice(0, 2);
        const eventDateTime = eventDate
          .clone()
          .set("hour", parseInt(hours, 10))
          .set("minute", parseInt(minutes, 10));
        const startUtc = eventDateTime.utc().toISOString();

        return {
          title: event.name,
          start: startUtc,
          description: event.description,
        };
      });
    });
  };
  // Event click handler for modal
  const handleEventClick = useCallback((info) => {
    const { title, extendedProps, start } = info.event;
    const formattedTime = moment(start).format("YYYY-MM-DD HH:mm");
    const eventTime = moment(start).format("HH:mm");
    const eventSchedule = moment(start).format("YYYY-MM-DD");
    setEventName(title);
    setEventTime(eventTime);
    setEventSchedule(eventSchedule);
    setEventDialog({
      open: true,
      title,
      time: formattedTime,
      description: extendedProps.description,
    });
  }, []);

  // Date click handler for sheet
  const handleDateClick = useCallback(
    (info) => {
      const clickedDate = moment(info.dateStr).format("YYYY-MM-DD");
      const matchedEvents = events.filter((item) => {
        const eventDate = moment(item.start).format("YYYY-MM-DD");
        return eventDate === clickedDate;
      });

      setSheetEventList(matchedEvents.length > 0 ? matchedEvents : []);
      setIsSheetOpen(true);
    },
    [events],
  );
  // Mark events that have ended
  const handleEventMount = useCallback((info) => {
    const currentDate = new Date();
    const eventEndDate = info.event.end
      ? new Date(info.event.end)
      : new Date(info.event.start);

    if (eventEndDate < currentDate) {
      info.el.style.textDecoration = "line-through";
    }
  }, []);

  const handleSelectCategory = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Calendar</Button>
        </DialogTrigger>
        <DialogContent className="no-scrollbar max-w-6xl overflow-scroll">
          <DialogHeader>
            <DialogTitle className="sr-only">Events</DialogTitle>
            <DialogDescription className="sr-only">Events</DialogDescription>
            <CalendarCategoriesBtn onSelectCategory={handleSelectCategory} />
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "",
                center: "title prev,next today",
                right: "",
              }}
              events={events}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              eventDidMount={handleEventMount}
              editable={false}
              height="auto"
              displayEventTime={false}
            />
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Event Modal */}
      <Dialog
        open={eventDialog.open}
        onOpenChange={() => setEventDialog({ ...eventDialog, open: false })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{eventDialog.title}</DialogTitle>
            <DialogDescription>
              {eventDialog.description}
              <p>{`${moment(eventDialog.time).format("dddd")}, ${moment(eventDialog.time).format("MMMM Do h:mm")}`}</p>
              <div className="mt-2"></div>
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
                    <p>
                      {moment(item.start).tz(moment.tz.guess()).format("HH:mm")}
                    </p>
                  </div>
                ))
              ) : (
                <p>No events found.</p>
              )}
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </>
  );
}
