import { useState, useEffect, useCallback } from "react";
import supabase from "../../api/supabase";
import moment from "moment"; // Import Moment.js
import { useForm, useWatch } from "react-hook-form";
import Table from "../../components/Table";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { Button } from "../../shadcn/button";
import { Input } from "../../shadcn/input";
import { Label } from "../../shadcn/label";
import { Calendar } from "../../shadcn/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "../../shadcn/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../../shadcn/popover";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../shadcn/pagination"; // Adjusted imports for pagination
import Spinner from "../../components/Spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shadcn/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../shadcn/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../shadcn/alert-dialog";
import { Icon } from "@iconify/react";

const headers = ["Event Name", "Date", "Time", "Description"];

export default function AdminNewSchedule() {
  const [time, setTime] = useState([]); // event time data
  const [selectedDate, setSelectedDate] = useState(null); // event date data
  const [isSubmitted, setIsSubmitted] = useState(false); // for disabling the button submission
  const [events, setEvents] = useState([]); // Event data
  const [currentPage, setCurrentPage] = useState(1); // Pagination
  const [totalPages, setTotalPages] = useState(0); // pagination
  const [loading, setLoading] = useState(false); // Loading handling
  const [error, setError] = useState(null); // Error Handling
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Dialog Open/Close
  const [editId, setEditId] = useState(null); // Get the current ID of Event
  const itemsPerPage = 10;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    watch,
  } = useForm(); // react-hook-forms

  const onSubmit = async (data) => {
    setIsSubmitted(true);

    if (!selectedDate) {
      console.error("Date is required.");
      return;
    }

    if (!data.schedule_privacy) {
      console.error("Schedule privacy is required.");
      return;
    }

    try {
      if (editId) {
        // Update existing event
        const { error } = await supabase
          .from("schedule")
          .update({
            name: data.name,
            schedule_date: selectedDate.format("YYYY-MM-DD"),
            time: time,
            schedule_privacy: data.schedule_privacy,
            description: data.description,
          })
          .eq("id", editId);

        if (error) throw error;
        alert("Event updated successfully!");
      } else {
        // Insert new event
        const { error } = await supabase.from("schedule").insert([
          {
            name: data.name,
            schedule_date: selectedDate.format("YYYY-MM-DD"),
            time: time,
            schedule_privacy: data.schedule_privacy,
            description: data.description,
          },
        ]);

        if (error) {
          console.error("Error inserting data:", error.message);
          alert(
            "An error occurred while creating the event. Please try again.",
          );
        } else {
          alert("Event created successfully!");
        }
      }

      resetForm(); // Reset the form after successful operation
      setIsDialogOpen(false);
      fetchEvents();
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const resetForm = () => {
    reset();
    setTime([]);
    setSelectedDate(null);
    setIsSubmitted(false);
    setEditId(null); // Reset editId when resetting the form
  };

  const handleDateSelect = (date) => {
    setSelectedDate(moment(date));
    setValue("schedule", date);
  };

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: fetchedData,
        error,
        count,
      } = await supabase
        .from("schedule")
        .select("*", { count: "exact" })
        .range(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage - 1,
        );

      if (error) throw error;

      setTotalPages(Math.ceil(count / itemsPerPage));
      setEvents(fetchedData);
    } catch (err) {
      setError("Error fetching events. Please try again.");
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchEvents();
  }, [currentPage, fetchEvents]);

  // Format the time
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return moment(timeString, "HH:mm").format("hh:mm A"); // Use Moment.js to format time
  };

  //Delete Event
  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from("schedule").delete().eq("id", id);

      if (error) throw error;
      //update local state to reflect the deletion
      // setData((prevData) => prevData.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error Deleting event", error);
    }
  };

  // Update Event
  const handleEditBtn = async (id) => {
    try {
      const itemToEdit = events.find((item) => item.id === id);
      if (itemToEdit) {
        reset(); // Reset the entire form to initial values before editing
        setValue("name", itemToEdit.name);
        setSelectedDate(moment(itemToEdit.schedule_date)); // Set the date for Calendar
        setValue("schedule_privacy", itemToEdit.schedule_privacy);
        setValue("description", itemToEdit.description || "");
        if (itemToEdit.time && Array.isArray(itemToEdit.time)) {
          // Map through the time array and format each time
          const formattedTimes = itemToEdit.time.map((t) =>
            moment.utc(t, "HH:mm:ssZ").format("HH:mm"),
          );

          setTime(formattedTimes);
        }
        setEditId(id); // Set the editId to the current event's id
      }
    } catch (error) {
      console.error("Error Updating Event", error);
    }
  };

  // Add more time
  const handleAddTimeInput = () => {
    setTime([...time, ""]);
  };

  // Remove time
  const handleRemoveTimeInput = (index) => {
    if (time.length > 1) {
      const updatedTimes = time.filter((_, i) => i !== index);
      setTime(updatedTimes); // Remove the specific time input field
    }
  };

  // Function to change time
  const handleChangeTime = (index, value) => {
    const updatedTimes = [...time];
    updatedTimes[index] = value;
    setTime(updatedTimes);
  };

  const rows = events.map((event) => [
    event.name,
    moment(event.schedule_date).format("MMMM Do YYYY"), // Format date using Moment.js
    event.time && event.time.length > 0
      ? event.time.map((t) => formatTime(t)).join(", ")
      : "N/A",
    <div
      key={event.name}
      style={{
        maxWidth: "200px",
        maxHeight: "100px",
        overflow: "auto",
        whiteSpace: "pre-wrap",
      }}
    >
      {event.description || "N/A"}
    </div>,
    <DropdownMenu key={event.id}>
      <DropdownMenuTrigger asChild>
        <button aria-label="Options">
          <Icon icon="tabler:dots" width="2em" height="2em" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <AlertDialog>
            <AlertDialogTrigger onClick={() => handleEditBtn(event.id)}>
              Edit
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Edit</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogDescription className="sr-only">
                Edit Event
              </AlertDialogDescription>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-2"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Event Name</Label>
                  <Input id="name" {...register("name", { required: true })} />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      Event name is required
                    </p>
                  )}
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
                          ? selectedDate.format("MMMM Do YYYY") // Format date using Moment.js
                          : "Please select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate ? selectedDate.toDate() : null}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {isSubmitted && !selectedDate && (
                    <p className="text-sm text-red-500">Date is required</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    as="textarea"
                    rows={3}
                    {...register("description")}
                    className="w-full"
                    placeholder="Event description (optional)"
                  />
                </div>

                {/* Schedule Privacy */}
                <div className="space-y-2">
                  <Label htmlFor="schedule_privacy">Schedule Privacy</Label>
                  <Select
                    value={watch("schedule_privacy")}
                    onValueChange={(value) => {
                      setValue("schedule_privacy", value);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select privacy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.schedule_privacy && (
                    <p className="text-sm text-red-500">
                      {errors.schedule_privacy.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  {time.map((oldTime, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        type="time"
                        value={oldTime}
                        step="00:15"
                        onChange={(e) =>
                          handleChangeTime(index, e.target.value)
                        }
                        className="flex-grow"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleRemoveTimeInput(index)}
                        className="shrink-0"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={handleAddTimeInput}
                    className="w-full"
                  >
                    Add Time
                  </Button>
                </div>

                <AlertDialogFooter className="mt-2">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction type="submit">Save</AlertDialogAction>
                </AlertDialogFooter>
              </form>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <AlertDialog>
            <AlertDialogTrigger>Delete</AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(event.id)}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  ]);

  return (
    <AdminSidebar>
      <main className="space-y-6 p-4 lg:p-8">
        <header>
          <h1 className="text-2xl font-bold">Schedule</h1>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              if (open) {
                resetForm(); // Call your form reset function here
              }
              setIsDialogOpen(open);
            }}
          >
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Event Name</Label>
                  <Input id="name" {...register("name", { required: true })} />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      Event name is required
                    </p>
                  )}
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
                          ? selectedDate.format("MMMM Do YYYY") // Format date using Moment.js
                          : "Please select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate ? selectedDate.toDate() : null} // Convert to Date object for Calendar
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {isSubmitted && !selectedDate && (
                    <p className="text-sm text-red-500">Date is required</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    as="textarea"
                    rows={3}
                    {...register("description")}
                    className="w-full"
                    placeholder="Event description (optional)"
                  />
                </div>

                {/* Schedule Privacy */}
                <div className="space-y-2">
                  <Label htmlFor="schedule_privacy">Schedule Privacy</Label>
                  <Select
                    onValueChange={(value) => {
                      setValue("schedule_privacy", value);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select privacy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.schedule_privacy && (
                    <p className="text-sm text-red-500">
                      {errors.schedule_privacy.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  {time.map((t, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        type="time"
                        value={t}
                        step="00:15"
                        onChange={(e) =>
                          handleChangeTime(index, e.target.value)
                        }
                        className="flex-grow"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleRemoveTimeInput(index)}
                        className="shrink-0"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={handleAddTimeInput}
                    className="w-full"
                  >
                    Add Time
                  </Button>
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" onClick={resetForm}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit">Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <>
            <Table headers={headers} rows={rows} />
            <Pagination>
              <PaginationContent>
                <PaginationPrevious
                  onClick={() =>
                    currentPage > 1 && setCurrentPage(currentPage - 1)
                  }
                >
                  Previous
                </PaginationPrevious>
                {[...Array(totalPages)].map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      onClick={() => setCurrentPage(index + 1)}
                      active={currentPage === index + 1}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationNext
                  onClick={() =>
                    currentPage < totalPages && setCurrentPage(currentPage + 1)
                  }
                >
                  Next
                </PaginationNext>
              </PaginationContent>
            </Pagination>
          </>
        )}
      </main>
    </AdminSidebar>
  );
}
