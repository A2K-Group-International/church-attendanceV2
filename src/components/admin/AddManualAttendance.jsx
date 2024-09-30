import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../shadcn/button";
import { Input } from "../../shadcn/input";
import { Label } from "../../shadcn/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../shadcn/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../shadcn/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../shadcn/select";
import { useEffect, useState } from "react";
import { fetchAllEvents } from "../../api/userService";

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/,
);

const formSchema = z.object({
  scheduleFirstName: z.string().min(2, {
    message: "First name must be at least 2 characters",
  }),
  scheduleLastName: z.string().min(2, {
    message: "Last name must be at least 2 characters",
  }),
  telephone: z.string().regex(phoneRegex, "Invalid Number!"),
  childFirstName: z.string().min(2, {
    message: "First name must be at least 2 characters",
  }),
  childLastName: z.string().min(2, {
    message: "Last name must be at least 2 characters",
  }),
});

export default function AddManualAttendance() {
  const [activeTab, setActiveTab] = useState("schedule");
  const [error, setError] = useState("");
  const [eventName, setEventName] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [preferredTime, setPreferredTime] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data) => {
    console.log(data);
    // Handle submission logic here
  };

  const handleNext = () => {
    if (!preferredTime) {
      setError("Please fill out all fields")
    } else {
        setError("");
        setActiveTab("children");
      }
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const events = await fetchAllEvents();
        if (events.length > 0) {
          setEventName(events);
        } else {
          setError("No schedule found");
        }
      } catch (error) {
        setError("Failed to load schedule", error);
      }
    };
    fetchSchedule();
  }, []);

  const handleSelectEvent = (eventId) => {
    const selectedEvent = eventName.find((event) => event.id === eventId);
    if (selectedEvent) {
      setSelectedEvent(selectedEvent.name);
      setSelectedEventId(eventId);
      setPreferredTime("");
    }
  };

  // Check and filter the time in the selected event
  const filteredMassTimes = eventName
    .filter((event) => event.id === selectedEventId) // Filter by selected event ID
    .flatMap((event) => event.time || []); // Get times

  // Filter the schedule in the selected event
  const filteredMassSchedule = eventName
    .filter(
      (event) => event.name === selectedEvent && event.id === selectedEventId,
    )
    .flatMap((event) => event.schedule || []); // Get schedules

  const date = new Date(filteredMassSchedule);
  const options = { year: "numeric", month: "long", day: "numeric" };
  const formattedDate = date.toLocaleDateString("en-GB", options);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add manually</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add attendance manually</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="schedule" className="w-full">
              Step 1
            </TabsTrigger>
            <TabsTrigger value="requiredInformation" disabled={!preferredTime} className="w-full">
              Step 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value="schedule">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div>
                <Label htmlFor="Event" className="text-sm font-medium">
                  Upcoming Events
                </Label>
                <Select
                  value={selectedEventId}
                  onValueChange={handleSelectEvent}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Event" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventName.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Label htmlFor="Schedule" className="text-sm font-medium">
                  {selectedEvent && <span>Schedule: {formattedDate}</span>}
                </Label>
                <Select
                  onValueChange={(value) => setPreferredTime(value)}
                  value={preferredTime}
                  disabled={!selectedEvent}
                >
                  <SelectTrigger className="mt-1 w-48">
                    <SelectValue placeholder="Select Time" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredMassTimes.map((time, index) => (
                      <SelectItem key={index} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {error && (
                  <p className="mt-2 text-sm font-medium text-destructive">
                    {error}
                  </p>
                )}
                <div className="mt-4 text-end">
                  <Button onClick={handleNext}>Next</Button>
                </div>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="requiredInformation">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-4">
                <Label htmlFor="childFirstName">Child's First Name:</Label>
                <Controller
                  name="childFirstName"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Child's First Name" />
                  )}
                />
                {errors.childFirstName && (
                  <p>{errors.childFirstName.message}</p>
                )}
              </div>
              <div className="mt-4">
                <Label htmlFor="childLastName">Child's Last Name:</Label>
                <Controller
                  name="childLastName"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Child's Last Name" />
                  )}
                />
                {errors.childLastName && <p>{errors.childLastName.message}</p>}
              </div>
              <DialogFooter className="mt-2">
                <Button type="submit">Submit</Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
