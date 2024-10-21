import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";

const DutyCard = ({
  duty,
  onEditDuty,
  onDeleteDuty,
  onAssignUsers,
  onRemoveUser,
}) => {
  const [showOptions, setShowOptions] = useState(false); // State to manage options visibility
  const optionsRef = useRef(null); // Ref to detect outside clicks

  // Toggle the visibility of the options menu
  const toggleOptions = () => {
    setShowOptions((prev) => !prev);
  };

  // Close options when clicking outside
  const handleClickOutside = (event) => {
    if (optionsRef.current && !optionsRef.current.contains(event.target)) {
      setShowOptions(false);
    }
  };

  useEffect(() => {
    // Add event listener for clicks
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      // Cleanup the event listener on unmount
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Helper function to format time to HH:MM
  const formatTime = (timeString) => {
    if (!timeString) return "Not set"; // Return default if no time is set
    const date = new Date(`1970-01-01T${timeString}Z`); // Assuming time is in HH:mm format
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Helper function to display days with different colors
  const renderRecurrenceDays = () => {
    const allDays = ["Su", "M", "Tu", "W", "Th", "F", "Sa"]; // Custom days of the week
    const selectedDays = duty.recurrence_days || []; // Assuming recurrence_days is an array of selected days

    // Map full day names to their respective short forms
    const dayMap = {
      Sunday: "Su",
      Monday: "M",
      Tuesday: "Tu",
      Wednesday: "W",
      Thursday: "Th",
      Friday: "F",
      Saturday: "Sa",
    };

    return (
      <div className="mb-4 flex space-x-1">
        {allDays.map((day, index) => {
          const isSelected = selectedDays.includes(
            Object.keys(dayMap).find((key) => dayMap[key] === day),
          ); // Check if the day is selected
          return (
            <span
              key={day}
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                isSelected
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              {day}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative rounded-lg border border-gray-300 bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg">
      <h2 className="mb-2 text-xl font-bold text-gray-800">{duty.duty_name}</h2>
      <p className="mb-3 text-gray-700">{duty.duty_description}</p>

      <p className="mb-4 text-sm text-gray-500">
        <strong>Due Date:</strong>{" "}
        {duty.duty_due_date
          ? new Date(duty.duty_due_date).toLocaleDateString()
          : "Not set"}
      </p>

      {/* Display Duty Start and End Time */}
      <p className="mb-3 text-sm text-gray-500">
        <strong>Start Time:</strong> {formatTime(duty.duty_start_time)}
      </p>
      <p className="mb-4 text-sm text-gray-500">
        <strong>End Time:</strong> {formatTime(duty.duty_end_time)}
      </p>

      {/* Display Recurrence Days */}
      <div>
        <strong>Recurrence Days:</strong>
        {renderRecurrenceDays()}
      </div>

      {/* Display Assigned Users with Remove Button */}
      <div>
        <h3 className="font-semibold">Assigned Users:</h3>
        <ul>
          {duty.user_assignments && duty.user_assignments.length > 0 ? (
            duty.user_assignments.map((assignment) => (
              <li
                key={assignment.user_id}
                className="flex items-center justify-between text-gray-700"
              >
                {/* Display full name (first name + last name) */}
                <span>{`${assignment.user_list.user_name} ${assignment.user_list.user_last_name}`}</span>
                <button
                  onClick={() =>
                    onRemoveUser(duty.duties_id, assignment.user_id)
                  }
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))
          ) : (
            <li className="text-gray-500">No users assigned</li>
          )}
        </ul>
      </div>

      {/* Three Dots Icon */}
      <div
        className="absolute right-4 top-4 cursor-pointer"
        onClick={toggleOptions}
      >
        <Icon icon="ic:baseline-more-vert" width="24" height="24" />
      </div>

      {/* Action Options */}
      {showOptions && (
        <div
          ref={optionsRef} // Attach ref to the options menu
          className="absolute right-4 top-10 z-10 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
        >
          <button
            className="block w-full px-4 py-2 text-left text-green-500 transition-colors duration-200 hover:bg-green-100"
            onClick={() => {
              onEditDuty(duty); // Trigger edit action
              setShowOptions(false); // Close the options menu
            }}
          >
            Edit
          </button>
          <button
            className="block w-full px-4 py-2 text-left text-red-500 transition-colors duration-200 hover:bg-red-100"
            onClick={() => {
              onDeleteDuty(duty); // Trigger delete action without confirmation
              setShowOptions(false); // Close the options menu
            }}
          >
            Delete
          </button>
          <button
            className="block w-full px-4 py-2 text-left text-blue-500 transition-colors duration-200 hover:bg-blue-100"
            onClick={() => {
              onAssignUsers(duty); // Trigger assign users action
              setShowOptions(false); // Close the options menu
            }}
          >
            Assign Users
          </button>
        </div>
      )}
    </div>
  );
};

export default DutyCard;
