import React, { useState, useEffect } from "react";
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

const EditDutyModal = ({ isOpen, onRequestClose, onSubmit, duty }) => {
  const [dutyDetails, setDutyDetails] = useState({
    dutyName: "",
    dutyDescription: "",
    dutyStartTime: "",
    dutyEndTime: "",
    selectedDays: [],
  });
  const [error, setError] = useState(""); // State to handle form errors

  // Initialize form fields with the selected duty's data
  useEffect(() => {
    if (isOpen && duty) {
      // Only set the details when the modal is open and duty is available
      setDutyDetails({
        dutyName: duty.duty_name || "",
        dutyDescription: duty.duty_description || "",
        dutyStartTime: duty.duty_start_time || "",
        dutyEndTime: duty.duty_end_time || "",
        selectedDays: duty.recurrence_days || [], // Assuming recurrence_days is an array
      });
    }
  }, [isOpen, duty]); // Add isOpen to dependencies

  // Reset form fields when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setDutyDetails({
        dutyName: "",
        dutyDescription: "",
        dutyStartTime: "",
        dutyEndTime: "",
        selectedDays: [],
      });
      setError(""); // Clear error on close
    }
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !dutyDetails.dutyName ||
      !dutyDetails.dutyDescription ||
      !dutyDetails.dutyStartTime ||
      !dutyDetails.dutyEndTime ||
      dutyDetails.selectedDays.length === 0
    ) {
      setError("All fields are required.");
      return;
    }

    // Ensure start time is before end time
    const startTime = new Date(`1970-01-01T${dutyDetails.dutyStartTime}:00Z`);
    const endTime = new Date(`1970-01-01T${dutyDetails.dutyEndTime}:00Z`);
    if (startTime >= endTime) {
      setError("Start time must be before end time.");
      return;
    }

    // Call onSubmit with the valid data
    onSubmit(dutyDetails);

    // Clear form fields and errors
    setDutyDetails({
      dutyName: "",
      dutyDescription: "",
      dutyStartTime: "",
      dutyEndTime: "",
      selectedDays: [],
    });
    setError("");
  };

  const handleDayChange = (day) => {
    setDutyDetails((prev) => {
      const selectedDays = prev.selectedDays.includes(day)
        ? prev.selectedDays.filter((d) => d !== day) // Remove if already selected
        : [...prev.selectedDays, day]; // Add if not selected
      return { ...prev, selectedDays };
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onRequestClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold">
            Edit Rota
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Update the details of the Rota.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Rota Details Section */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="editDutyName" className="text-sm font-medium">
                Rota Name
              </Label>
              <Input
                id="editDutyName"
                type="text"
                value={dutyDetails.dutyName}
                onChange={(e) =>
                  setDutyDetails({ ...dutyDetails, dutyName: e.target.value })
                }
                className="w-full"
                placeholder="Enter duty name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="editDutyDescription"
                className="text-sm font-medium"
              >
                Rota Description
              </Label>
              <Input
                id="editDutyDescription"
                type="text"
                value={dutyDetails.dutyDescription}
                onChange={(e) =>
                  setDutyDetails({
                    ...dutyDetails,
                    dutyDescription: e.target.value,
                  })
                }
                className="w-full"
                placeholder="Enter duty description"
                required
              />
            </div>
          </div>

          {/* Duty Time Section */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="editDutyStartTime"
                className="text-sm font-medium"
              >
                Start Time
              </Label>
              <Input
                id="editDutyStartTime"
                type="time"
                value={dutyDetails.dutyStartTime}
                onChange={(e) =>
                  setDutyDetails({
                    ...dutyDetails,
                    dutyStartTime: e.target.value,
                  })
                }
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editDutyEndTime" className="text-sm font-medium">
                End Time
              </Label>
              <Input
                id="editDutyEndTime"
                type="time"
                value={dutyDetails.dutyEndTime}
                onChange={(e) =>
                  setDutyDetails({
                    ...dutyDetails,
                    dutyEndTime: e.target.value,
                  })
                }
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
                    dutyDetails.selectedDays.includes(day.value)
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
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDutyModal;
