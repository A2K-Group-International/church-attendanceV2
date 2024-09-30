import { useState, useEffect, useCallback } from "react";
import supabase from "../../api/supabase"; // Adjust this import path as necessary
import VolunteerSidebar from "../../components/volunteer/VolunteerSidebar"; // Adjust import as needed
import { useUser } from "../../authentication/useUser"; // Adjust this import path as necessary
import Table from "../../components/Table"; // Import your table component
import Spinner from "../../components/Spinner"; // Import your spinner component
import { Button } from "../../shadcn/button"; // Adjust as necessary
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../../shadcn/dialog"; // Adjust import as necessary
import { Popover, PopoverTrigger, PopoverContent } from "../../shadcn/popover"; // Adjust import as necessary
import { Calendar } from "../../shadcn/calendar";
import { Input } from "../../shadcn/input"; // Adjust import as necessary
import { Label } from "../../shadcn/label";
import { Pagination } from "../../shadcn/pagination"; // Adjust as necessary
import { format } from "date-fns"; // For date formatting

const headers = ["Event Name", "Date", "Time", "Description"]; // Adjust as necessary

export default function VolunteerEvents() {
  const [userId, setUserId] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [itemsPerPage] = useState(10); // Set items per page
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Dialog visibility state
  const [selectedDate, setSelectedDate] = useState(null); // State for selected date
  const [times, setTimes] = useState([{ hour: "", minute: "" }]); // Initial time state
  const [newEvent, setNewEvent] = useState({
    name: "",
    description: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false); // Track form submission state

  const { user } = useUser(); // Assuming useUser returns the current authenticated user

  const fetchUserId = useCallback(async () => {
    if (!user) return; // If user is not available, exit early

    try {
      const { data, error } = await supabase
        .from("user_list")
        .select("user_id")
        .eq("user_uuid", user.id) // Assuming 'user_uuid' matches 'user.id'
        .single();

      if (error) throw error;

      setUserId(data.user_id); // Assuming user_id is in the fetched data
    } catch (err) {
      setError("Error fetching user ID. Please try again.");
      console.error("Error fetching user ID:", err);
    }
  }, [user]);

  const fetchEvents = useCallback(async () => {
    if (!userId) return; // If userId is not available, exit early

    setLoading(true);
    setError(null);

    try {
      const {
        data: fetchedData,
        error,
        count,
      } = await supabase
        .from("schedule")
        .select("*", { count: "exact" }) // Get the count for pagination
        .eq("creator_id", userId) // Fetch events where creator_id matches userId
        .range(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage - 1,
        ); // Pagination range

      if (error) throw error;

      setTotalPages(Math.ceil(count / itemsPerPage)); // Calculate total pages
      setEvents(fetchedData); // Store fetched events
    } catch (err) {
      setError("Error fetching events. Please try again.");
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchUserId(); // Fetch user ID when the component mounts or user changes
  }, [fetchUserId]);

  useEffect(() => {
    fetchEvents(); // Fetch events when userId is set or currentPage changes
  }, [userId, currentPage, fetchEvents]);

  // Generate hour and minute options
  const generateTimeOptions = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i).filter(
      (i) => i % 15 === 0,
    );
    return { hours, minutes };
  };

  const { hours, minutes } = generateTimeOptions(); // Generate time options

  const rows = events.map((event) => [
    event.name,
    new Date(event.schedule).toLocaleDateString(), // Adjust to your date format
    event.time && event.time.length > 0
      ? event.time
          .map((t) => {
            const [hour, minute] = t.split(":"); // Split hour and minute
            return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`; // Format as hh:mm
          })
          .join(", ")
      : "N/A",
    <div
      key={event.name}
      style={{
        maxWidth: "200px", // Adjust width as needed
        maxHeight: "100px", // Adjust height as needed
        overflow: "auto", // Enable scrolling if content overflows
        whiteSpace: "pre-wrap", // Keep newlines in the description
      }}
    >
      {event.description || "N/A"}
    </div>,
  ]);

  const handleAddTimeInput = () => {
    setTimes((prev) => [...prev, { hour: "", minute: "" }]); // Add a new time input
  };

  const handleRemoveTimeInput = (index) => {
    setTimes((prev) => prev.filter((_, i) => i !== index)); // Remove the time input at the specified index
  };

  const handleChangeTime = (index, type, value) => {
    setTimes((prev) => {
      const newTimes = [...prev];
      newTimes[index][type] = value; // Update the hour or minute at the specified index
      return newTimes;
    });
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date); // Set the selected date
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true); // Mark that the form has been submitted

    // Add the logic to create a new event
    if (!selectedDate) {
      return; // Prevent submission if date is not selected
    }

    const eventTimes = times
      .map((t) => `${t.hour}:${t.minute}`)
      .filter((t) => t.hour && t.minute); // Combine hour and minute into a single time string

    try {
      const { error } = await supabase.from("schedule").insert([
        {
          name: newEvent.name,
          schedule: selectedDate,
          time: eventTimes,
          description: newEvent.description,
          creator_id: userId,
        },
      ]);

      if (error) throw error;

      // Fetch events again to refresh the list
      fetchEvents();
      setIsDialogOpen(false); // Close the dialog
      setNewEvent({ name: "", description: "" }); // Reset form
      setTimes([{ hour: "", minute: "" }]); // Reset time inputs
      setSelectedDate(null); // Reset date
      setFormSubmitted(false); // Reset form submitted state
    } catch (err) {
      setError("Error creating event. Please try again.");
      console.error("Error creating event:", err);
    }
  };

  return (
    <VolunteerSidebar>
      <main className="space-y-6 p-4 lg:p-8">
        <header>
          <h1 className="text-2xl font-bold">Volunteer Events</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-2">Create Event</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Event</DialogTitle>
                <DialogDescription>
                  Schedule an upcoming event.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Event Name</Label>
                  <Input
                    id="name"
                    value={newEvent.name}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schedule">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        {selectedDate
                          ? format(new Date(selectedDate), "P")
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {times.map((time, index) => (
                  <div key={index} className="flex space-x-2">
                    <div>
                      <Label htmlFor={`hour-${index}`}>Hour</Label>
                      <select
                        id={`hour-${index}`}
                        value={time.hour}
                        onChange={(e) =>
                          handleChangeTime(index, "hour", e.target.value)
                        }
                      >
                        <option value="">--</option>
                        {hours.map((hour) => (
                          <option key={hour} value={hour}>
                            {hour}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor={`minute-${index}`}>Minute</Label>
                      <select
                        id={`minute-${index}`}
                        value={time.minute}
                        onChange={(e) =>
                          handleChangeTime(index, "minute", e.target.value)
                        }
                      >
                        <option value="">--</option>
                        {minutes.map((minute) => (
                          <option key={minute} value={minute}>
                            {minute}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Button
                      type="button"
                      onClick={() => handleRemoveTimeInput(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}

                <Button type="button" onClick={handleAddTimeInput}>
                  Add Time
                </Button>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newEvent.description}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, description: e.target.value })
                    }
                    required
                  />
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="submit">Create Event</Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {loading ? (
          <Spinner />
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <Table headers={headers} rows={rows} />
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </main>
    </VolunteerSidebar>
  );
}
