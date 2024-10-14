// src/components/volunteer/VolunteerUpload/SidePanel.jsx
import { Button } from "../../../shadcn/button";

export default function SidePanel({ selectedImage, onClear }) {
  return (
    <div className="w-full border-t bg-gray-50 p-4 lg:w-1/4 lg:border-l">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">📷 Selected Image</h2>
        {selectedImage && (
          <button
            onClick={onClear}
            className="text-2xl text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            &times;
          </button>
        )}
      </div>
      {selectedImage ? (
        <div className="flex flex-col items-center">
          <img
            src={selectedImage}
            alt="Selected"
            className="h-auto max-w-full rounded shadow"
          />
          <Button onClick={onClear} className="mt-4">
            Clear Selection
          </Button>
        </div>
      ) : (
        <p className="text-gray-500">No image selected.</p>
      )}
    </div>
  );
}
