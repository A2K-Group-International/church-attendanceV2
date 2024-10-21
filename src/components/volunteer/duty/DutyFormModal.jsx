import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../../../shadcn/dialog"; // Import Shadcn Dialog components
import { Button } from "../../../shadcn/button"; // Import Shadcn Button component
import { Input } from "../../../shadcn/input"; // Import Shadcn Input component
import { Label } from "../../../shadcn/label"; // Import Shadcn Label component

const recurrenceDays = [
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
  { value: "Sunday", label: "Sunday" },
];

const DutyFormModal = ({ isOpen, onRequestClose, onSubmit }) => {
  const [dutyName, setDutyName] = useState("");
  const [dutyDescription, setDutyDescription] = useState("");
  const [dutyStartTime, setDutyStartTime] = useState("");
  const [dutyEndTime, setDutyEndTime] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if all fields are filled
    if (
      !dutyName ||
      !dutyDescription ||
      !dutyStartTime ||
      !dutyEndTime ||
      selectedDays.length === 0
    ) {
      setError("All fields are required.");
      return;
    }

    // Ensure start time is before end time
    const startTime = new Date(`1970-01-01T${dutyStartTime}:00Z`);
    const endTime = new Date(`1970-01-01T${dutyEndTime}:00Z`);
    if (startTime >= endTime) {
      setError("Start time must be before end time.");
      return;
    }

    // Call onSubmit with the valid data
    onSubmit({
      dutyName,
      dutyDescription,
      dutyStartTime,
      dutyEndTime,
      selectedDays,
    });

    // Clear form fields
    setDutyName("");
    setDutyDescription("");
    setDutyStartTime("");
    setDutyEndTime("");
    setSelectedDays([]);
    setError("");
  };

  const handleDayChange = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onRequestClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold">Add Rota</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Fill out the details for the new Rota.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Rota Details Section */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dutyName" className="text-sm font-medium">
                Rota Name
              </Label>
              <Input
                id="dutyName"
                type="text"
                value={dutyName}
                onChange={(e) => setDutyName(e.target.value)}
                className="w-full"
                placeholder="Enter duty name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dutyDescription" className="text-sm font-medium">
                Rota Description
              </Label>
              <Input
                id="dutyDescription"
                type="text"
                value={dutyDescription}
                onChange={(e) => setDutyDescription(e.target.value)}
                className="w-full"
                placeholder="Enter duty description"
                required
              />
            </div>
          </div>

          {/* Duty Time Section */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dutyStartTime" className="text-sm font-medium">
                Start Time
              </Label>
              <Input
                id="dutyStartTime"
                type="time"
                value={dutyStartTime}
                onChange={(e) => setDutyStartTime(e.target.value)}
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dutyEndTime" className="text-sm font-medium">
                End Time
              </Label>
              <Input
                id="dutyEndTime"
                type="time"
                value={dutyEndTime}
                onChange={(e) => setDutyEndTime(e.target.value)}
                className="w-full"
                required
              />
            </div>
          </div>

          {/* Recurrence Days Section */}
          <div className="space-y-2">
            <Label htmlFor="recurrenceDays" className="text-sm font-medium">
              Recurrence Days
            </Label>
            <div className="flex space-x-2">
              {recurrenceDays.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => handleDayChange(day.value)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    selectedDays.includes(day.value)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {day.label.charAt(0)} {/* Display first letter of the day */}
                </button>
              ))}
            </div>
          </div>

          {/* Display form error if any */}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Dialog Footer with Actions */}
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="mt-3 sm:mt-0">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Add Rota</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DutyFormModal;
