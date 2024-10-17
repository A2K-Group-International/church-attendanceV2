// src/components/volunteer/DutyFormModal.jsx

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

const DutyFormModal = ({ isOpen, onRequestClose, onSubmit }) => {
  const [dutyName, setDutyName] = useState("");
  const [dutyDescription, setDutyDescription] = useState("");
  const [dutyDueDate, setDutyDueDate] = useState("");
  const [error, setError] = useState(""); // State to handle form errors

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!dutyName || !dutyDescription || !dutyDueDate) {
      setError("All fields are required.");
      return;
    }

    // Pass the form data to the onSubmit handler
    onSubmit({ dutyName, dutyDescription, dutyDueDate });

    // Clear form fields and errors
    setDutyName("");
    setDutyDescription("");
    setDutyDueDate("");
    setError("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onRequestClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold">Add Rota</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Fill out the details for the new Rota.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            {/* Duty Name */}
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

            {/* Duty Description */}
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

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dutyDueDate" className="text-sm font-medium">
                Due Date
              </Label>
              <Input
                id="dutyDueDate"
                type="date"
                value={dutyDueDate}
                onChange={(e) => setDutyDueDate(e.target.value)}
                className="w-full"
                required
              />
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
