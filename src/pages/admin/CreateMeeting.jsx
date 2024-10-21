import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import Select from "react-select";
import { Button } from "../../shadcn/button";
import { Textarea } from "../../shadcn/textarea";
import { Input } from "../../shadcn/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../shadcn/dialog";
import supabase from "../../api/supabase";

// Schema for form validation using Zod
const meetingSchema = z.object({
  meeting_title: z.string().min(1, "Meeting title is required"),
  participants: z
    .array(z.string())
    .nonempty("At least one participant is required"),
  location: z.string().min(1, "Location is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  details: z.string().optional(),
});

export default function CreateMeeting() {
  const [participantsList, setParticipantsList] = useState([]); // state to store fetched participants
  const [loading, setLoading] = useState(true); // loading state for participants
  const [error, setError] = useState(null); // error state
  const [meetings, setMeetings] = useState([]); // store meeting data

  // Fetch participants for the form
  const fetchedParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from("user_list")
        .select("user_uuid, user_name, user_last_name, user_role");

      if (error) throw error;

      setParticipantsList(
        data
          .filter((user) => user.user_role === "volunteer")
          .map((user) => ({
            value: user.user_uuid,
            label: `${user.user_name} ${user.user_last_name}`,
          })),
      );
    } catch (error) {
      setError("Failed to fetch participants.");
      console.error("Error fetching participants:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch meetings to display in a table
  const fetchMeetings = async () => {
    try {
      const { data, error } = await supabase.from("meetings").select("*");

      if (error) throw error;

      setMeetings(data);
    } catch (error) {
      console.error("Error fetching meetings:", error.message);
    }
  };

  // Fetch participants and meetings when component mounts
  useEffect(() => {
    fetchedParticipants();
    fetchMeetings();
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(meetingSchema),
  });
  const onSubmit = async (data) => {
    try {
      const { error } = await supabase.from("meetings").insert([
        {
          meeting_title: data.meeting_title,
          participants: data.participants,
          location: data.location,
          date: data.date,
          time: data.time,
          details: data.details,
        },
      ]);

      if (error) throw error;

      // Reset the form after submission
      reset();
      alert("Meeting created successfully!");

      // Re-fetch meetings to display the updated table
      fetchMeetings();
    } catch (error) {
      console.error("Error creating meeting:", error.message);
      alert("Failed to create meeting.");
    }
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button>New Meeting</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Meeting</DialogTitle>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-y-2 pt-8"
            >
              {/* Meeting Title */}
              <div className="flex items-center gap-x-2">
                <Input placeholder="Add title" {...register("meeting_title")} />
                {errors.meeting_title && (
                  <p className="text-red-500">{errors.meeting_title.message}</p>
                )}
              </div>

              {/* Participants Multi-Select */}
              <div className="flex items-center gap-x-2">
                {loading ? (
                  <p>Loading participants...</p>
                ) : error ? (
                  <p className="text-red-500">{error}</p>
                ) : (
                  <Select
                    isMulti
                    options={participantsList}
                    className="w-full"
                    placeholder="Select participants"
                    onChange={(selectedOptions) => {
                      setValue(
                        "participants",
                        selectedOptions
                          ? selectedOptions.map((option) => option.value)
                          : [],
                      );
                    }}
                  />
                )}
                {errors.participants && (
                  <p className="text-red-500">{errors.participants.message}</p>
                )}
              </div>

              {/* Location, Date, Time, and Details */}
              <div className="flex items-center gap-x-2">
                <Input placeholder="Add Location" {...register("location")} />
                {errors.location && (
                  <p className="text-red-500">{errors.location.message}</p>
                )}
              </div>
              <div className="flex items-center gap-x-2">
                <Input
                  type="date"
                  placeholder="Add date"
                  {...register("date")}
                />
                {errors.date && (
                  <p className="text-red-500">{errors.date.message}</p>
                )}
              </div>
              <div className="flex items-center gap-x-2">
                <Input
                  type="time"
                  placeholder="Add Time"
                  {...register("time")}
                />
                {errors.time && (
                  <p className="text-red-500">{errors.time.message}</p>
                )}
              </div>
              <div className="flex items-center gap-x-2">
                <Textarea
                  placeholder="Type details for this new meeting"
                  {...register("details")}
                />
              </div>

              <DialogFooter>
                <Button type="submit">Submit</Button>
              </DialogFooter>
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Display Meeting Data in a Table */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold">Meeting List</h2>
        <table className="min-w-full table-auto border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Title</th>
              <th className="border border-gray-300 px-4 py-2">Location</th>
              <th className="border border-gray-300 px-4 py-2">Date</th>
              <th className="border border-gray-300 px-4 py-2">Time</th>
              <th className="border border-gray-300 px-4 py-2">Details</th>
              <th className="border border-gray-300 px-4 py-2">Participants</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((meeting) => (
              <tr key={meeting.id}>
                <td className="border border-gray-300 px-4 py-2">
                  {meeting.meeting_title}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {meeting.location}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {meeting.date}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {meeting.time}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {meeting.details || "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {meeting.participants.join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
