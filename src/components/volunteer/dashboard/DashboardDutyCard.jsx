import React from "react";

const DashboardDutyCard = ({ duty }) => {
  // Helper function to format time to HH:MM
  const formatTime = (timeString) => {
    if (!timeString) return "Not set"; // Return default if no time is set
    const date = new Date(`1970-01-01T${timeString}`); // Parse time assuming it’s in HH:mm:ss
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
        {allDays.map((day) => {
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
    <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg">
      <h2 className="mb-2 text-xl font-bold text-gray-800">{duty.duty_name}</h2>
      <p className="mb-3 text-gray-700">{duty.duty_description}</p>

      <p className="mb-4 text-sm text-gray-500">
        <strong>Due Date:</strong>{" "}
        {duty.duty_date
          ? new Date(duty.duty_date).toLocaleDateString()
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
    </div>
  );
};

export default DashboardDutyCard;
