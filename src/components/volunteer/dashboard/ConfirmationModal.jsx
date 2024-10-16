import React from "react";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  dutyName,
  newStatus,
}) => {
  if (!isOpen) return null; // If modal is not open, return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-auto max-w-md rounded-lg bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Confirm Action</h2>
        <p>
          Are you sure you want to mark "{dutyName}" as{" "}
          <strong>{newStatus}</strong>?
        </p>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="mr-2 rounded border border-gray-300 bg-gray-100 px-4 py-2 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded px-4 py-2 text-white ${
              newStatus === "Completed"
                ? "bg-green-600 hover:bg-green-700"
                : newStatus === "In Progress"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-600 hover:bg-gray-700"
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
