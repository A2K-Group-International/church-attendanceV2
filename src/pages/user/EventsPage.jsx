import { useEffect, useState } from "react";
import supabase from "../../api/supabase";
import FamilyMembersDialog from "../../components/user/FamilyMembersDialog";
import { useQueryClient } from "@tanstack/react-query";
import UserSidebar from "../../components/user/UserSidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../shadcn/card";

export default function Eventspage() {
  const [eventItems, setEventItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const queryClient = useQueryClient();

  const userData = queryClient.getQueryData(["userData"]);
  console.log("user data", userData);

  const formatTime = (timeStr) => {
    if (!timeStr) return "Invalid time"; // Handle undefined or invalid time
    const [time, timezone] = timeStr.split("+");
    const [hours, minutes] = time.split(":");
    const hours24 = parseInt(hours, 10);
    const ampm = hours24 >= 12 ? "pM" : "AM";
    const hours12 = hours24 % 12 || 12;
    return `${hours12}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from("schedule")
          .select("*")
          .order("schedule", { ascending: true });

        if (error) throw error;

        const formattedEvents = data.map((event) => {
          const eventTime = event.time;
          return {
            id: event.id,
            title: event.name,
            content: event.description,
            date: new Date(event.schedule).toLocaleDateString(),
            time:
              eventTime && eventTime.length === 2
                ? `${formatTime(eventTime[0])} - ${formatTime(eventTime[1])}`
                : "Time not available", // Handle cases where time is not defined correctly
          };
        });

        console.log(data);

        setEventItems(formattedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const fetchFamilyMembers = async () => {
    if (!userData) {
      console.error("User data not available");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("family_list")
        .select("*")
        .eq("guardian_id", userData.user_id);

      if (error) throw error;

      setFamilyMembers(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching family members:", error);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    fetchFamilyMembers();
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <UserSidebar>
        <main className="p-4 lg:p-8">
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-gray-500 dark:text-gray-400">Loading events...</p>
        </main>
      </UserSidebar>
    );
  }

  return (
    <UserSidebar>
      <main className="p-4 lg:p-8">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Latest updates and announcements about upcoming events at the
            church.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {eventItems.map((item) => (
            <Card
              key={item.id}
              className="p-4 shadow-lg"
              onClick={() => handleEventClick(item)}
            >
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="flex flex-col">
                  <p>{item.content}</p>
                  <div className="mt-4">
                    <strong className="text-lg">Date:</strong>
                    <p className="text-gray-700 dark:text-gray-300">
                      {item.date}
                    </p>
                  </div>
                  <div className="mt-2">
                    <strong className="text-lg">Time:</strong>
                    <p className="text-gray-700 dark:text-gray-300">
                      {item.time}
                    </p>
                  </div>
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <FamilyMembersDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        familyMembers={familyMembers}
        selectedEvent={selectedEvent}
      />
    </UserSidebar>
  );
}
