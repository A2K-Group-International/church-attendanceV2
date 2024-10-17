import { useState, useEffect } from "react";
import { fetchAllEvents } from "../../../api/userService";
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
});

export default function SingleRegistrationForm() {
  const [eventList, setEventList] = useState([]); // Event Data
  const [selectedEvent, setSelectedEvent] = useState(""); // Store the selected Event
  const [eventDate, setEventDate] = useState(""); // Store to store event date
  const [eventTimeList, setEventTimeList] = useState([]);
  const [selectedEventTime, setSelectedEventTime] = useState();

  // Initialize react-hook-form with Zod resolver
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  // Handle form submission
  const onSubmit = (data) => {
    console.log(data);
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

  console.log(eventTimeList);

  return (
    <InformationCard>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Upcoming Events</Label>
            <Select
              onValueChange={(value) => {
                const selectedEventName = eventList.find(
                  (item) => item.id === value,
                );
                if (selectedEventName) {
                  setSelectedEvent(selectedEventName.name); // Set the selected category name
                  setEventDate(selectedEventName.schedule_date);
                  setEventTimeList(selectedEventName.time); // Set the selected category time
                  setValue("event_id", value); // Set the category_id in the form
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Event">
                  {selectedEvent}
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
            <Label htmlFor="name">Select time</Label>
            <Select onValueChange={(value) => setSelectedEventTime([value])}>
              <SelectTrigger>
                <SelectValue placeholder="Select Time">
                  {selectedEventTime}
                </SelectValue>
              </SelectTrigger>
              <SelectContent position="popper">
                {eventTimeList.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
                {/* <SelectItem value={selectedEventTime}>{selectedEventTime}</SelectItem> */}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-2 text-end">
          <Button>Next</Button>
        </div>
      </form>
    </InformationCard>
  );
}
