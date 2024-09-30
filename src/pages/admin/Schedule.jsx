import { useState, useEffect, useCallback } from "react";
import supabase from "../../api/supabase";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
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
} from "../../shadcn/pagination";
import Spinner from "../../components/Spinner";

const headers = ["Event Name", "Date", "Time", "Description"];

export default function AdminNewSchedule() {
  const [time, setTime] = useState([""]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const itemsPerPage = 10;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm(); // react-hook-forms

  const resetForm = () => {
    reset();
    setSelectedDate(null);
    setIsSubmitted(false);
  };

  const onSubmit = async (data) => {
    setIsSubmitted(true);
    if (!selectedDate) return;

    try {
      const { error } = await supabase.from("schedule").insert([
        {
          name: data.name,
          schedule: selectedDate,
          time: time,
          description: data.description,
        },
      ]);

      if (error) {
        console.error("Error inserting data:", error);
      } else {
        alert("Event created successfully!");
        resetForm();
        setIsDialogOpen(false);
        fetchEvents();
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
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

  // format the time
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  const rows = events.map((event) => [
    event.name,
    format(new Date(event.schedule), "PPP"),
    event.time && event.time.length > 0
      ? event.time.map((t) => formatTime(t)).join(", ")
      : "N/A",
    <div
      key={event.name}
      style={{
        maxWidth: "200px", // Adjust the width to your preference
        maxHeight: "100px", // Adjust the height to your preference
        overflow: "auto", // Enable scrolling if the content overflows
        whiteSpace: "pre-wrap", // Keep the newlines in the description
      }}
    >
      {event.description || "N/A"}
    </div>, // Limit width and height for the description field
  ]);

  // Add more time
  const handleAddTimeInput = () => {
    setTime([...time, ""]);
  };
  // Remove time
  const handleRemoveTimeInput = (index) => {
    if (time.length > 1) {
      setTime(time.filter((_, i) => i !== index));
    }
  };
  // Function to changetime
  const handleChangeTime = (index, value) => {
    const updatedTimes = [...time];
    updatedTimes[index] = value;
    setTime(updatedTimes);
  };

  return (
    <AdminSidebar>
      <main className="space-y-6 p-4 lg:p-8">
        <header>
          <h1 className="text-2xl font-bold">Schedule</h1>
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
                          ? format(selectedDate, "PPP")
                          : "Please select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
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

                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  {time.map((t, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        type="time"
                        value={t}
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
                    Add more time
                  </Button>
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit">Submit</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-destructive">{error}</p>
          </div>
        ) : events.length > 0 ? (
          <div>
            <Table headers={headers} rows={rows} />
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage((prev) => prev - 1);
                    }}
                  />
                </PaginationItem>
                {[...Array(totalPages).keys()].map((pageNumber) => (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageNumber + 1);
                      }}
                    >
                      {pageNumber + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages)
                        setCurrentPage((prev) => prev + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No events found.</p>
          </div>
        )}
      </main>
    </AdminSidebar>
  );
}
