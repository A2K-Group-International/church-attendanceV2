import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../../shadcn/dialog";
import { format } from "date-fns"; // Import date formatting utility

const EventDialog = ({ open, onClose, event }) => {
  if (!event) return null;

  // Helper function to format the date (without time)
  const formatDate = (date) => format(new Date(date), "MMM dd, yyyy");

  // Determine whether the event is all-day or has specific times
  const isAllDay = !event.start || event.start === event.end;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
          {/* Highlight the description */}
          {event.description && (
            <DialogDescription className="mt-2 text-lg font-semibold text-gray-700">
              {event.description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="space-y-4">
          {/* Handle cases with no start/end time by treating them as all-day events */}
          {isAllDay ? (
            <p>
              <strong>Date:</strong>{" "}
              {formatDate(event.start || event.schedule_date)} (All day)
            </p>
          ) : (
            <>
              <p>
                <strong>Start:</strong> {formatDate(event.start)}
              </p>
              {event.end && (
                <p>
                  <strong>End:</strong> {formatDate(event.end)}
                </p>
              )}
            </>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <button className="btn btn-primary">Close</button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventDialog;
