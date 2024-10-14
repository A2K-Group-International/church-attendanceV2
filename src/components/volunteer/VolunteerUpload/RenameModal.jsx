// src/components/volunteer/VolunteerUpload/RenameModal.jsx
import { useState, useEffect, useRef } from "react";
import { Button } from "../../../shadcn/Button";

export default function RenameModal({
  isOpen,
  onClose,
  item,
  onRenameConfirm,
  loadingRename,
}) {
  const [newFileName, setNewFileName] = useState("");
  const [fileNameError, setFileNameError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && item) {
      setNewFileName(getFileNameWithoutExtension(item.name));
      setFileNameError("");
      // Focus the input when modal opens
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isOpen, item]);

  const handleRename = () => {
    if (!newFileName.trim()) {
      setFileNameError("File name cannot be empty.");
      return;
    }
    setFileNameError("");
    onRenameConfirm(newFileName.trim());
  };

  if (!isOpen || !item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Rename File</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div>
          <input
            type="text"
            ref={inputRef}
            placeholder="New file name"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            className="mb-4 w-full rounded border border-gray-300 p-2"
          />
          {fileNameError && (
            <p className="mb-2 text-red-600">{fileNameError}</p>
          )}
          <div className="flex justify-end space-x-2">
            <Button
              onClick={handleRename}
              disabled={loadingRename}
              className="bg-blue-500 text-white transition duration-200 hover:bg-blue-400"
            >
              {loadingRename ? "Renaming..." : "Rename"}
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility function to get file name without extension
function getFileNameWithoutExtension(fileName) {
  return fileName.split(".").slice(0, -1).join(".");
}
