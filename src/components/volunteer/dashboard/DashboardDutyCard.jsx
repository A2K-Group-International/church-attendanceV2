import React, { useState } from "react";
import ConfirmationModal from "./ConfirmationModal"; // Import the confirmation modal

const DashboardDutyCard = ({ duty, onSetStatus }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  // Function to open the modal with the new status
  const handleOpenModal = (status) => {
    setNewStatus(status);
    setIsModalOpen(true);
  };

  // Function to confirm status change
  const handleConfirm = async () => {
    await onSetStatus(duty.duties_id, newStatus); // Call the function passed as a prop
    setIsModalOpen(false); // Close the modal
  };

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg">
      <h2 className="mb-2 text-xl font-bold text-gray-800">{duty.duty_name}</h2>
      <p className="mb-3 text-gray-700">{duty.duty_description}</p>
      <p className="mb-4 text-sm text-gray-500">
        <strong>Due Date:</strong>{" "}
        {new Date(duty.duty_due_date).toLocaleDateString()}
      </p>

      {/* Display Duty Status */}
      <p
        className={`mb-3 text-sm font-semibold ${
          duty.duty_status === "Completed"
            ? "text-green-600"
            : duty.duty_status === "In Progress"
              ? "text-blue-600"
              : "text-gray-600"
        }`}
      >
        <strong>Status:</strong> {duty.duty_status}
      </p>

      {/* Buttons to set status */}
      <div className="flex space-x-2">
        <button
          onClick={() => handleOpenModal("Not Started")}
          className="rounded bg-gray-400 px-4 py-2 text-white hover:bg-gray-500"
        >
          Not Started
        </button>
        <button
          onClick={() => handleOpenModal("In Progress")}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          In Progress
        </button>
        <button
          onClick={() => handleOpenModal("Completed")}
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Completed
        </button>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        dutyName={duty.duty_name}
        newStatus={newStatus}
      />
    </div>
  );
};

export default DashboardDutyCard;
