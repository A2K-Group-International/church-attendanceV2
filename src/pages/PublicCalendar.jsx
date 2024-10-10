import { useEffect, useState, useCallback } from "react";
import supabase from "../api/supabase";
import { fetchPrivateEvents } from "../api/userService";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button } from "../shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../shadcn/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../shadcn/sheet";
import moment from "moment";
import { Input } from "../shadcn/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../shadcn/card";
import { Label } from "../shadcn/label";
import FormLabel from "../components/FormLabel";

export default function PublicCalendar() {
  //Attend form states
  const [guardianFirstName, setGuardianFirstName] = useState("");
  const [guardianLastName, setGuardianLastName] = useState("");
  const [guardianTelephone, setGuardianTelephone] = useState("");
  const [children, setChildren] = useState([{ firstName: "", lastName: "" }]);
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const fetchedEvents = await fetchPrivateEvents();
        const transformedEvents = transformEvents(fetchedEvents);
        setEvents(transformedEvents);
      } catch (error) {
        console.error("Error fetching Schedule:", error);
      }
    };
    fetchSchedule();
  }, []);

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

  //Attend function

  const handleAddChild = () => {
    setChildren([...children, { firstName: "", lastName: "" }]);
  };

  const handleRemoveChild = (index) => {
    if (children.length > 1) {
      setChildren(children.filter((_, i) => i !== index));
    }
  };

  const handleChangeChild = (index, field, value) => {
    const newChildren = [...children];
    newChildren[index] = { ...newChildren[index], [field]: value };
    setChildren(newChildren);
  };

  const handleGenerateRandomCode = () => {
    const randomNumber =
      Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    return randomNumber;
  };

  const handleSubmit = async () => {
    const hasEmptyChild = children.some(
      (child) => !child.firstName || !child.lastName,
    );

    if (!guardianFirstName || !guardianLastName || hasEmptyChild) {
      setError("Please complete all fields.");
      return;
    }

    if (isNaN(parseInt(guardianTelephone, 10))) {
      setError("Guardian's telephone must be a number.");
      return;
    }

    const randomCode = handleGenerateRandomCode();
    setIsSubmitting(true); // Start submission process

    try {
      const { error: dataError } = await supabase
        .from("attendance_pending")
        .insert(
          children.map((child) => ({
            guardian_first_name: guardianFirstName,
            guardian_last_name: guardianLastName,
            guardian_telephone: guardianTelephone,
            children_last_name: child.lastName,
            children_first_name: child.firstName,
            has_attended: false,
            attendance_code: randomCode,
            preferred_time: eventTime,
            schedule_date: eventSchedule,
            selected_event: eventName,
          })),
        );

      if (dataError) throw dataError;

      setGuardianFirstName("");
      setGuardianLastName("");
      setGuardianTelephone("");
      setEventName("");
      setEventTime("");
      setEventSchedule("");
      setChildren([{ firstName: "", lastName: "" }]);

      // Auto-close the dialog
      setEventDialog({ ...eventDialog, open: false });

      alert(`Registration successful! Please save your code: ${randomCode}`);
    } catch (error) {
      console.error("Error submitting form:", error.message);
    } finally {
      setIsSubmitting(false); // End submission process
    }
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button>See all events</Button>
        </DialogTrigger>
        <DialogContent className="no-scrollbar max-w-6xl overflow-scroll">
          <DialogHeader>
            <DialogTitle className="sr-only">Events</DialogTitle>
            <DialogDescription className="sr-only">Events</DialogDescription>
            <Input
              type="text"
              placeholder="Search"
              className="w-52 rounded-xl"
            />
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
              <div className="mt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Attend</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="sr-only">Attend</DialogTitle>
                      <DialogDescription className="sr-only">
                        This form for attending
                      </DialogDescription>
                    </DialogHeader>
                    {/* Attend Form */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl font-semibold">
                          Required Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <Label
                          htmlFor="lastName"
                          className="text-md font-medium"
                        >
                          Add Parent/Carer
                        </Label>
                        <div className="flex flex-col gap-x-4 md:flex-row">
                          <FormLabel>
                            <Label
                              htmlFor="firstName"
                              className="text-sm font-medium"
                            >
                              First Name
                            </Label>
                            <Input
                              id="firstName"
                              placeholder="Enter your first name"
                              value={guardianFirstName}
                              onChange={(e) =>
                                setGuardianFirstName(e.target.value)
                              }
                              required
                              className="mt-1"
                            />
                          </FormLabel>
                          <FormLabel>
                            <Label
                              htmlFor="firstName"
                              className="text-sm font-medium"
                            >
                              Last Name
                            </Label>
                            <Input
                              id="lastName"
                              placeholder="Enter your last name"
                              value={guardianLastName}
                              onChange={(e) =>
                                setGuardianLastName(e.target.value)
                              }
                              required
                              className="mt-1"
                            />
                          </FormLabel>
                          <FormLabel>
                            <Label
                              htmlFor="guardianTelephone"
                              className="text-sm font-medium"
                            >
                              Telephone
                            </Label>
                            <Input
                              id="guardianTelephone"
                              type="text"
                              placeholder="Enter your telephone"
                              value={guardianTelephone}
                              onChange={(e) =>
                                setGuardianTelephone(e.target.value)
                              }
                              className="mt-1"
                              required
                            />
                          </FormLabel>
                        </div>
                        {children.map((child, index) => (
                          <div
                            key={index}
                            className="space-y-4 rounded-lg bg-muted p-4"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold">
                                Add Child
                                <span className="block text-xs font-normal text-black">
                                  Please provide your child's information. You
                                  can add multiple children
                                </span>
                              </h4>
                              <Button
                                type="button"
                                onClick={() => handleRemoveChild(index)}
                                disabled={children.length === 1}
                                size="sm"
                                variant="outline"
                              >
                                Remove
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                              <FormLabel>
                                <Label
                                  htmlFor={`childFirstName_${index}`}
                                  className="text-sm font-medium"
                                >
                                  First Name
                                </Label>
                                <Input
                                  id={`childFirstName_${index}`}
                                  type="text"
                                  placeholder="Child's First Name"
                                  value={child.firstName}
                                  onChange={(e) =>
                                    handleChangeChild(
                                      index,
                                      "firstName",
                                      e.target.value,
                                    )
                                  }
                                  className="mt-1"
                                  required
                                />
                              </FormLabel>
                              <FormLabel>
                                <Label
                                  htmlFor={`childLastName_${index}`}
                                  className="text-sm font-medium"
                                >
                                  Last Name
                                </Label>
                                <Input
                                  id={`childLastName_${index}`}
                                  type="text"
                                  placeholder="Child's Last Name"
                                  value={child.lastName}
                                  onChange={(e) =>
                                    handleChangeChild(
                                      index,
                                      "lastName",
                                      e.target.value,
                                    )
                                  }
                                  className="mt-1"
                                  required
                                />
                              </FormLabel>
                            </div>
                          </div>
                        ))}
                        <Button
                          type="button"
                          onClick={handleAddChild}
                          className="w-full"
                        >
                          Add Another Child
                        </Button>
                      </CardContent>
                      <CardFooter className="justify-end">
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                          Submit
                        </Button>
                      </CardFooter>
                    </Card>
                  </DialogContent>
                </Dialog>
              </div>
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
