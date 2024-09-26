import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../../api/supabase";
import UserSidebar from "../../components/user/UserSidebar";
import EventAttendDialog from "./EventAttendDialog";

export default function EventInfo() {
  const { eventId } = useParams(); // Extract eventId from the URL
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false); // Dialog state for attendance

  const formatTime = (timeStr) => {
    if (!timeStr) return "Invalid time"; // Handle undefined or invalid time
    const [time, timezone] = timeStr.split("+");
    const [hours, minutes] = time.split(":");
    const hours24 = parseInt(hours, 10);
    const ampm = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 || 12;
    return `${hours12}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase
          .from("schedule")
          .select("*")
          .eq("id", eventId)
          .single(); // Fetch the event with the given ID

        if (error) throw error;

        console.log(data);

        setEventData(data); // Store the event data
      } catch (error) {
        console.error("Error fetching event data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]); // Fetch event when eventId changes

  if (loading) {
    return (
      <UserSidebar>
        <main className="p-4 lg:p-8">
          <h1 className="text-2xl font-bold">Loading Event...</h1>
        </main>
      </UserSidebar>
    );
  }

  if (!eventData) {
    return (
      <UserSidebar>
        <main className="p-4 lg:p-8">
          <h1 className="text-2xl font-bold">Event not found</h1>
        </main>
      </UserSidebar>
    );
  }

  const handleAttendClick = () => {
    setDialogOpen(true); // Open the attendance dialog
  };

  return (
    <UserSidebar>
      <main className="p-4 lg:p-8">
        <h1 className="text-2xl font-bold">{eventData.name}</h1>
        <p>{eventData.description}</p>
        <div className="mt-4">
          <strong>Date:</strong>{" "}
          {new Date(eventData.schedule).toLocaleDateString()}
        </div>
        <div className="mt-2">
          <strong>Time{eventData.time.length > 1 ? "s" : ""}:</strong>{" "}
          {eventData.time.length > 0 ? (
            eventData.time.length === 1 ? (
              // Display a single time
              <p>{formatTime(eventData.time[0])}</p>
            ) : (
              // Display multiple times as a list
              <ul>
                {eventData.time.map((time, index) => (
                  <li key={index}>{formatTime(time)}</li>
                ))}
              </ul>
            )
          ) : (
            <p>Time not available</p>
          )}
        </div>

        {/* Attend Button */}
        <button
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white"
          onClick={handleAttendClick}
        >
          Attend
        </button>
      </main>

      {/* EventAttendDialog Component */}
      <EventAttendDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)} // Close the dialog
        eventData={eventData} // Pass the event data to the dialog
      />
    </UserSidebar>
  );
}
