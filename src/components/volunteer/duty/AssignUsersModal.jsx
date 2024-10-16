// src/components/volunteer/duty/AssignUsersModal.jsx

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

const AssignUsersModal = ({
  isOpen,
  onRequestClose,
  onAssign,
  duty,
  users,
}) => {
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleUserToggle = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSubmit = () => {
    onAssign(selectedUsers);
    setSelectedUsers([]); // Clear selections after assigning
    onRequestClose(); // Close the dialog after assignment
  };

  return (
    <Dialog open={isOpen} onOpenChange={onRequestClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold">
            Assign Users to Duty: {duty.duty_name}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Select users to assign to this duty.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 max-h-60 overflow-y-auto">
          {users.length > 0 ? (
            users.map((user) => (
              <div key={user.user_id} className="mb-2 flex items-center">
                <input
                  type="checkbox"
                  id={`user-${user.user_id}`}
                  checked={selectedUsers.includes(user.user_id)}
                  onChange={() => handleUserToggle(user.user_id)}
                  className="mr-2"
                />
                <label htmlFor={`user-${user.user_id}`}>
                  {user.user_name} {user.user_last_name}
                </label>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No available users to assign.</p>
          )}
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="mt-3 sm:mt-0">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={selectedUsers.length === 0}
          >
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignUsersModal;
