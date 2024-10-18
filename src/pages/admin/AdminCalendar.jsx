import { useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { filterEvent } from "../../api/userService";
import moment from "moment-timezone";
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
import CalendarCategoriesBtn from "../../components/admin/Calendar/CalendarCategoriesBtn";

const AdminCalendar = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

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

  // Fetch events and transform into FullCalendar format

  const fetchSchedule = useCallback(async (schedule_category) => {
    try {
      const fetchedEvents = await filterEvent(schedule_category);
      const transformedEvents = transformEvents(fetchedEvents);
      setEvents(transformedEvents);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      setError("Failed to load schedule.");
    }
  }, []); // No dependencies needed, since the function doesn't depend on external state

  useEffect(() => {
    // Fetch all events initially or based on the selected category
    if (selectedCategory) {
      fetchSchedule(selectedCategory);
    } else {
      fetchSchedule(); // This should be modified to handle fetching all events
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

  //Handle select category
  const handleSelectCategory = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  // Event click handler for modal
  const handleEventClick = useCallback((info) => {
    const { title, extendedProps, start } = info.event;
    const formattedTime = moment(start).format("YYYY-MM-DD HH:mm");

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

  return (
    <AdminSidebar>
      <div className="p-5">
        <CalendarCategoriesBtn onSelectCategory={handleSelectCategory} />
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
          eventDidMount={handleEventMount}
          editable={true}
          height={850}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }}
        />
      </div>

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
    </AdminSidebar>
  );
};

export default AdminCalendar;
