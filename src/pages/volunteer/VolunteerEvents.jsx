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

const headers = ["Event Name", "Date", "Time", "Description", "Actions"]; // Added "Actions" column

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

  // States for editing
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);

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
      key={event.id}
      style={{
        maxWidth: "200px",
        maxHeight: "100px",
        overflow: "auto",
        whiteSpace: "pre-wrap",
      }}
    >
      {event.description || "N/A"}
    </div>,
    <div key={`actions-${event.id}`} className="flex space-x-2">
      <Button variant="secondary" onClick={() => openEditDialog(event)}>
        Edit
      </Button>
      <Button variant="destructive" onClick={() => handleDelete(event.id)}>
        Delete
      </Button>
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
      setError("Please select a date.");
      return; // Prevent submission if date is not selected
    }

    // Filter out any time entries where either hour or minute is missing
    const validTimes = times.filter((t) => t.hour && t.minute);

    const eventTimes = validTimes.map(
      (t) =>
        `${t.hour.toString().padStart(2, "0")}:${t.minute.toString().padStart(2, "0")}`,
    );

    console.log("Constructed eventTimes:", eventTimes); // Debugging line

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

  // Delete handler
  const handleDelete = async (eventId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?",
    );
    if (!confirmDelete) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("schedule")
        .delete()
        .eq("id", eventId); // Assuming 'id' is the primary key

      if (error) throw error;

      // Update local state by removing the deleted event
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== eventId),
      );
    } catch (err) {
      setError("Error deleting event. Please try again.");
      console.error("Error deleting event:", err);
    } finally {
      setLoading(false);
    }
  };

  // Edit dialog functions
  const openEditDialog = (event) => {
    setEventToEdit({
      ...event,
      // Assuming 'schedule' is a Date string
      selectedDate: new Date(event.schedule),
      times: event.time
        ? event.time.map((t) => {
            const [hour, minute] = t.split(":");
            return { hour, minute };
          })
        : [{ hour: "", minute: "" }],
    });
    setIsEditDialogOpen(true);
  };

  const handleEditChange = (field, value) => {
    setEventToEdit((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditTimeChange = (index, type, value) => {
    setEventToEdit((prev) => {
      const newTimes = [...prev.times];
      newTimes[index][type] = value; // Update the hour or minute at the specified index
      return { ...prev, times: newTimes };
    });
  };

  const handleEditAddTimeInput = () => {
    setEventToEdit((prev) => ({
      ...prev,
      times: [...prev.times, { hour: "", minute: "" }],
    }));
  };

  const handleEditRemoveTimeInput = (index) => {
    setEventToEdit((prev) => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index),
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Filter out any time entries where either hour or minute is missing
    const validTimes = eventToEdit.times.filter((t) => t.hour && t.minute);

    const eventTimes = validTimes.map(
      (t) =>
        `${t.hour.toString().padStart(2, "0")}:${t.minute.toString().padStart(2, "0")}`,
    );

    console.log("Constructed eventTimes for edit:", eventTimes); // Debugging line

    try {
      const { error } = await supabase
        .from("schedule")
        .update({
          name: eventToEdit.name,
          schedule: eventToEdit.selectedDate,
          time: eventTimes,
          description: eventToEdit.description,
        })
        .eq("id", eventToEdit.id); // Update where id matches

      if (error) throw error;

      // Refresh events
      fetchEvents();
      setIsEditDialogOpen(false);
      setEventToEdit(null);
    } catch (err) {
      setError("Error updating event. Please try again.");
      console.error("Error updating event:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <VolunteerSidebar>
      <main className="space-y-6 p-4 lg:p-8">
        <header>
          <h1 className="text-2xl font-bold">Volunteer Events</h1>
          {/* Create Event Dialog */}
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
                        required
                      >
                        <option value="">--</option>
                        {hours.map((hour) => (
                          <option key={hour} value={hour}>
                            {hour.toString().padStart(2, "0")}
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
                        required
                      >
                        <option value="">--</option>
                        {minutes.map((minute) => (
                          <option key={minute} value={minute}>
                            {minute.toString().padStart(2, "0")}
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

          {/* Edit Event Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Event</DialogTitle>
                <DialogDescription>
                  Modify the details of the event.
                </DialogDescription>
              </DialogHeader>
              {eventToEdit && (
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Event Name</Label>
                    <Input
                      id="edit-name"
                      value={eventToEdit.name}
                      onChange={(e) => handleEditChange("name", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-schedule">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          {eventToEdit.selectedDate
                            ? format(new Date(eventToEdit.selectedDate), "P")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Calendar
                          mode="single"
                          selected={eventToEdit.selectedDate}
                          onSelect={(date) =>
                            setEventToEdit((prev) => ({
                              ...prev,
                              selectedDate: date,
                            }))
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {eventToEdit.times.map((time, index) => (
                    <div key={index} className="flex space-x-2">
                      <div>
                        <Label htmlFor={`edit-hour-${index}`}>Hour</Label>
                        <select
                          id={`edit-hour-${index}`}
                          value={time.hour}
                          onChange={(e) =>
                            handleEditTimeChange(index, "hour", e.target.value)
                          }
                          required
                        >
                          <option value="">--</option>
                          {hours.map((hour) => (
                            <option key={hour} value={hour}>
                              {hour.toString().padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label htmlFor={`edit-minute-${index}`}>Minute</Label>
                        <select
                          id={`edit-minute-${index}`}
                          value={time.minute}
                          onChange={(e) =>
                            handleEditTimeChange(
                              index,
                              "minute",
                              e.target.value,
                            )
                          }
                          required
                        >
                          <option value="">--</option>
                          {minutes.map((minute) => (
                            <option key={minute} value={minute}>
                              {minute.toString().padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                      </div>

                      <Button
                        type="button"
                        onClick={() => handleEditRemoveTimeInput(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}

                  <Button type="button" onClick={handleEditAddTimeInput}>
                    Add Time
                  </Button>

                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Input
                      id="edit-description"
                      value={eventToEdit.description}
                      onChange={(e) =>
                        handleEditChange("description", e.target.value)
                      }
                      required
                    />
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="submit">Save Changes</Button>
                    </DialogClose>
                  </DialogFooter>
                </form>
              )}
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
