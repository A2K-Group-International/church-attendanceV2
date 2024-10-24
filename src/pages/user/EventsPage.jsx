import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../api/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../shadcn/card";
import { Button } from "@/shadcn/button";
import UserCalendar from "@/components/user/UserCalendar";
import { Dialog, DialogContent, DialogTrigger } from "../../shadcn/dialog";
import qrScannerIcon from "../../assets/svg/qrScanner.svg";
import { Scanner } from "@yudiel/react-qr-scanner";

export default function Eventspage() {
  const [eventItems, setEventItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  const formatTime = (timeStr) => {
    if (!timeStr) return "Invalid time";
    const [time, timezone] = timeStr.split("+");
    const [hours, minutes] = time.split(":");
    const hours24 = parseInt(hours, 10);
    const ampm = hours24 >= 12 ? "PM" : "AM";
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
          const eventTimes = event.time; // array of available times
          return {
            id: event.id,
            title: event.name,
            content: event.description,
            date: new Date(event.schedule).toLocaleDateString(),
            times: eventTimes ? eventTimes.map(formatTime) : [], // Format each available time
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

  const handleEventClick = (event) => {
    navigate(`/event-info/${event.id}`);
  };

  const handleScan = (data) => {
    if (data) {
      setScanResult(data);
    }
  };

  const handleError = (err) => {
    setError(err);
  };

  if (loading) {
    return (
      <main className="p-4 lg:p-8">
        <h1 className="text-2xl font-bold">Events</h1>
        <p className="text-gray-500 dark:text-gray-400">Loading events...</p>
      </main>
    );
  }

  return (
    <main className="p-4 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold">Events</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Latest upcoming events at the church.
        </p>
      </div>
      <div className="mt-2 flex">
        <UserCalendar />
        <Dialog>
          <DialogTrigger asChild className="ml-2">
            <Button>
              <img src={qrScannerIcon} alt="" />
            </Button>
          </DialogTrigger>
          <DialogContent className="mt-2 p-2">
            <Scanner
              facingMode="environment"
              onScan={(result) => console.log(result)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="no-scrollbar mt-8 grid h-screen grid-cols-1 gap-4 overflow-scroll md:grid-cols-2 lg:grid-cols-3">
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
                  <strong className="text-lg">
                    Time{item.times.length > 1 ? "s" : ""}:
                  </strong>
                  {item.times.length > 0 ? (
                    item.times.length === 1 ? (
                      <p className="text-gray-700 dark:text-gray-300">
                        {item.times[0]}
                      </p>
                    ) : (
                      <ul className="text-gray-700 dark:text-gray-300">
                        {item.times.map((time, index) => (
                          <li key={index}>{time}</li>
                        ))}
                      </ul>
                    )
                  ) : (
                    <p>Time not available</p>
                  )}
                </div>
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
