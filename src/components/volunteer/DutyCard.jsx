// src/components/volunteer/DutyCard.jsx

import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";

const DutyCard = ({ duty, onEditDuty, onDeleteDuty, onAssignUsers }) => {
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

  return (
    <div className="relative rounded-lg border border-gray-300 bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg">
      <h2 className="mb-2 text-xl font-bold text-gray-800">{duty.duty_name}</h2>
      <p className="mb-3 text-gray-700">{duty.duty_description}</p>
      <p className="mb-4 text-sm text-gray-500">
        <strong>Due Date:</strong>{" "}
        {new Date(duty.duty_due_date).toLocaleDateString()}
      </p>

      {/* Display Assigned Users */}
      <div>
        <h3 className="font-semibold">Assigned Users:</h3>
        <ul>
          {duty.assigned_users && duty.assigned_users.length > 0 ? (
            duty.assigned_users.map((user) => (
              <li key={user.user_id} className="text-gray-700">
                {user.user_name}
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
              onDeleteDuty(duty); // Trigger delete action
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
