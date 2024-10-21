import { CalendarIcon, Clock, Filter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../shadcn/popover";
import { Button } from "../../../shadcn/button";
import { Calendar } from "../../../shadcn/calendar";
import { format } from "date-fns";

export default function AttendanceDate({ selectedDate, handleDateChange }) {
  return (
    <>
      <div className="flex items-center space-x-2 sm:w-auto">
        <CalendarIcon className="mr-2 h-4 w-4" />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal sm:w-[200px]"
            >
              {format(selectedDate, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
