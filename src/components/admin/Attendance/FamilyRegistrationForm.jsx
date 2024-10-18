import { useState, useEffect } from "react";
import { fetchAllEvents, insertFamilyAttendee } from "../../../api/userService";
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

// Form validation schema with Zod
const formSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  telephone: z
    .string()
    .length(11, "Cellphone number must be exactly 11 digits."),
  selected_event: z.number().int().positive("Event selection is required."),
});

export default function FamilyRegistrationForm() {
  const [eventList, setEventList] = useState([]); // Store event data
  const [eventTimeList, setEventTimeList] = useState([]); // Store event times
  const [selectedEvent, setSelectedEvent] = useState(""); // Store selected event
  const [eventDate, setEventDate] = useState(""); // Store selected event date
  const [selectedEventTime, setSelectedEventTime] = useState(""); // Store selected event time
  const [children, setChildren] = useState([{ firstName: "", lastName: "" }]); // Store children details

  // React Hook Form initialization with Zod validation
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  // Fetch all events on component mount
  useEffect(() => {
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
    fetchedEvents();
  }, []);

  const onSubmit = async (data) => {
    try {
      const result = await insertFamilyAttendee(
        data.firstName, // main_applicant_first_name
        data.lastName, // main_applicant_last_name
        data.telephone, // telephone
        selectedEvent, // selected_event
        eventDate, // selected_event_date
        selectedEventTime, // selected_time
        children.map((child) => ({
          first_name: child.firstName, // attendee_first_name
          last_name: child.lastName, // attendee_last_name
        })),
      );

      if (result?.error) {
        throw new Error(result.error);
      } else {
        alert("Request Successfully Sent!");
        reset();
        setSelectedEvent("");
        setSelectedEventTime("");
        setEventDate("");
        setChildren([{ firstName: "", lastName: "" }]);
      }
    } catch (error) {
      console.error("Error inserting attendance:", error);
    }
  };

  // Add a new child entry
  const handleAddChild = () => {
    setChildren([...children, { firstName: "", lastName: "" }]);
  };

  // Remove a child entry by index
  const handleRemoveChild = (index) => {
    const updatedChildren = children.filter((_, i) => i !== index);
    setChildren(updatedChildren);
  };

  // Update child information dynamically
  const handleChildInputChange = (index, field, value) => {
    const updatedChildren = [...children];
    updatedChildren[index][field] = value;
    setChildren(updatedChildren);
  };

  return (
    <InformationCard>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="no-scrollbar h-64 overflow-scroll"
      >
        <div className="grid w-full items-center gap-4 p-2">
          {/* Event Selection */}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Upcoming Events</Label>
            <Select
              {...register("selected_event")}
              onValueChange={(value) => {
                const selectedEventDetails = eventList.find(
                  (item) => item.id === value,
                );
                if (selectedEventDetails) {
                  setSelectedEvent(selectedEventDetails.name);
                  setEventDate(selectedEventDetails.schedule_date);
                  setEventTimeList(selectedEventDetails.time);
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

          {/* Time Selection */}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="selected_time">Select Time</Label>
            <Select
              {...register("selected_time")}
              onValueChange={(value) => setSelectedEventTime(value)}
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

          {/* Parent/Carer Information */}
          <Label>Parent/Carer Information</Label>
          <div className="flex flex-col gap-2 md:flex-row">
            <Input
              {...register("firstName")}
              placeholder="First name"
              className="w-full md:w-1/3"
            />
            {errors.firstName && (
              <span className="text-red-500">{errors.firstName.message}</span>
            )}
            <Input
              {...register("lastName")}
              placeholder="Last name"
              className="w-full md:w-1/3"
            />
            {errors.lastName && (
              <span className="text-red-500">{errors.lastName.message}</span>
            )}
            <Input
              {...register("telephone")}
              placeholder="Telephone"
              className="w-full md:w-1/3"
            />
            {errors.telephone && (
              <span className="text-red-500">{errors.telephone.message}</span>
            )}
          </div>

          {/* Children Information */}
          <Label>Children Information</Label>
          {children.map((child, index) => (
            <div key={index} className="flex flex-col gap-2 md:flex-row">
              <Input
                value={child.firstName}
                onChange={(e) =>
                  handleChildInputChange(index, "firstName", e.target.value)
                }
                placeholder="First name"
              />
              <Input
                value={child.lastName}
                onChange={(e) =>
                  handleChildInputChange(index, "lastName", e.target.value)
                }
                placeholder="Last name"
              />
              {children.length > 1 && (
                <Button type="button" onClick={() => handleRemoveChild(index)}>
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button type="button" onClick={handleAddChild} className="mt-2">
            Add Child
          </Button>
        </div>

        {/* Submit Button */}
        <div className="mt-2 text-end">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </InformationCard>
  );
}
