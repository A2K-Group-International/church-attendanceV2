import { useState, useEffect } from "react";
import { fetchAllEvents, insertSingleAttendee } from "../../../api/userService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../../shadcn/button";
import { Input } from "../../../shadcn/input";
import { Label } from "../../../shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shadcn/select";
import InformationCard from "@/components/InformationCard";
import moment from "moment";

// form validation schema with Zod
const formSchema = z.object({
  firstName: z.string({
    required_error: "First name is required.",
  }),
  lastName: z.string({
    required_error: "Last name is required.",
  }),
  cellphoneNumber: z.string().length(11, {
    message: "Cellphone number must be exactly 11 digits.",
  }),
  selected_event: z.number().int().positive("Event selection is required."),
  // selected_time: z.string().nonempty("Time selection is required."),
});

export default function SingleRegistrationForm() {
  const [eventList, setEventList] = useState([]); // Event Data
  const [selectedEvent, setSelectedEvent] = useState(""); // Store the selected Event
  const [eventDate, setEventDate] = useState(""); // Store the event date
  const [eventTimeList, setEventTimeList] = useState([]);
  const [selectedEventTime, setSelectedEventTime] = useState("");

  // Initialize react-hook-form with Zod resolver
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const result = await insertSingleAttendee(
        data.firstName,
        data.lastName,
        data.cellphoneNumber,
        selectedEvent,
        selectedEventTime,
        eventDate,
      );

      if (result?.error) {
        throw new Error(result.error);
      }
      alert("Request Successfully Sent!");
      reset(); // Reset the form after successful submission
      setSelectedEvent("");
      setSelectedEventTime("");
      setEventDate("");
    } catch (error) {
      console.error("Error inserting attendance", error);
    }
  };

  const fetchedEvents = async () => {
    try {
      const events = await fetchAllEvents();
      if (events.length > 0) {
        setEventList(events);
      } else {
        console.error("No schedule found");
      }
    } catch (error) {
      console.error("Failed to load schedule", error);
    }
  };

  useEffect(() => {
    fetchedEvents();
  }, []);

  return (
    <InformationCard>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="no-scrollbar h-64 overflow-scroll"
      >
        <div className="grid w-full items-center gap-4 p-2">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Upcoming Events</Label>
            <Select
              {...register("selected_event")}
              onValueChange={(value) => {
                const selectedEventName = eventList.find(
                  (item) => item.id === value,
                );
                if (selectedEventName) {
                  setSelectedEvent(selectedEventName.name);
                  setEventDate(selectedEventName.schedule_date);
                  setEventTimeList(selectedEventName.time);
                  setValue("selected_event", value);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Event">
                  {selectedEvent || "Select Event"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent position="popper">
                {eventList.map((eventItem) => (
                  <SelectItem key={eventItem.id} value={eventItem.id}>
                    {`${eventItem.name} (${moment(eventItem.schedule_date).format("MMMM Do YYYY")})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedEvent && (
              <span>
                Event Date:{" "}
                <strong>{moment(eventDate).format("MMMM Do YYYY")}</strong>
              </span>
            )}
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="selected_time">Select time</Label>
            <Select
              {...register("selected_time")} // Register the select
              onValueChange={(value) => setSelectedEventTime(value)} // Update selected time
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Time">
                  {selectedEventTime || "Select Time"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent position="popper">
                {eventTimeList.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.selected_time && (
              <span className="text-red-500">
                {errors.selected_time.message}
              </span>
            )}
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              {...register("firstName")}
              placeholder="Enter your first name"
            />
            {errors.firstName && (
              <span className="text-red-500">{errors.firstName.message}</span>
            )}
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              {...register("lastName")}
              placeholder="Enter your last name"
            />
            {errors.lastName && (
              <span className="text-red-500">{errors.lastName.message}</span>
            )}
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="cellphoneNumber">Cellphone Number</Label>
            <Input
              id="cellphoneNumber"
              {...register("cellphoneNumber")}
              placeholder="Enter your cellphone number"
            />
            {errors.cellphoneNumber && (
              <span className="text-red-500">
                {errors.cellphoneNumber.message}
              </span>
            )}
          </div>
        </div>
        <div className="mt-2 text-end">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </InformationCard>
  );
}
