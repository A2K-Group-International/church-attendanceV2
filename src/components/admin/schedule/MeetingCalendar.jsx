import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../shadcn/dialog";
import { Button } from "../../../shadcn/button";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import supabase from "@/api/supabase";
import { useState, useEffect } from "react";

export default function MeetingCalendar() {
  const [meetings, setMeetings] = useState([]);

  const fetchMeeting = async () => {
    try {
      const { data, error } = await supabase.from("meetings").select("*");
      if (error) throw error;
      setMeetings(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchMeeting();
  }, []);

  const events = meetings.map((item) => ({
    title: item.meeting_title,
    date: item.date,
  }));

  return (
    <Dialog>
      <DialogTrigger className="ml-2" asChild>
        <Button>Calendar</Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="sr-only"></DialogTitle>
          <DialogDescription className="sr-only"></DialogDescription>
        </DialogHeader>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          //   dateClick={}
          //   eventClick={}
          //   eventDidMount={}
          editable={true}
          height={850}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
