import { useState, useRef } from "react";
import { Button } from "../../../shadcn/button";

export default function FileUploadSection({
  onFileSelect,
  onUpload,
  loading,
  uploadError,
  selectedFile, // New prop to check if a file is selected
}) {
  const [customFileName, setCustomFileName] = useState("");
  const [fileNameError, setFileNameError] = useState("");

  const handleUploadClick = () => {
    if (!customFileName) {
      setFileNameError("Please enter a file name.");
      return;
    }
    setFileNameError("");
    onUpload(customFileName);
  };

  return (
    <section className="rounded-lg border bg-white p-4 shadow">
      <h2 className="text-xl font-semibold">Upload Files</h2>
      <input
        type="file"
        accept="image/*, .pdf, .doc, .docx" // Add more file types as needed
        onChange={onFileSelect}
      />
      {uploadError && <p className="text-red-500">{uploadError}</p>}

      {/* Only show input for custom file name if a file is selected */}
      {selectedFile && (
        <div>
          <input
            type="text"
            value={customFileName}
            onChange={(e) => setCustomFileName(e.target.value)}
            placeholder="Custom File Name"
            className="mt-2 w-full rounded border p-2"
          />
          {fileNameError && <p className="text-red-500">{fileNameError}</p>}
          <Button
            onClick={handleUploadClick}
            loading={loading}
            disabled={loading}
            className="mt-2"
          >
            Upload
          </Button>
        </div>
      )}
    </section>
  );
}
