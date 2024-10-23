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

export default function MeetingCalendar({ ...props }) {
  return (
    <Dialog>
      <DialogTrigger className="ml-2" asChild>
        <Button>View Calendar</Button>
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
        //   events={}
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
