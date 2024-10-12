import { useState, useRef, useEffect } from "react";
import supabase from "../../api/supabase";
import { Button } from "../../shadcn/button";
import { StorageError } from "@supabase/storage-js";
import VolunteerSidebar from "../../components/volunteer/VolunteerSidebar";
import { v4 as uuidv4 } from "uuid";

export default function VolunteerUpload() {
  const [testSelectedFile, setTestSelectedFile] = useState(null);
  const [testUploadStatus, setTestUploadStatus] = useState(null);
  const [testUploadError, setTestUploadError] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const testFileInputRef = useRef(null);

  const handleTestFileChange = async (e) => {
    if (e.target.files.length === 0) return;

    const file = e.target.files[0];
    setTestSelectedFile(file);
    setTestUploadStatus(null);
    setTestUploadError(null);

    const allowedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const isImage = allowedImageTypes.includes(file.type);

    if (!isImage) {
      setTestUploadError("Unsupported file type.");
      return;
    }

    if (file.size > maxSize) {
      setTestUploadError("File size exceeds the 5MB limit.");
      return;
    }

    try {
      setTestUploadStatus("Uploading...");
      const fileExtension = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = `Images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("Uploaded files")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      setTestUploadStatus(`File uploaded successfully!`);
      fetchUploadedImages();
    } catch (err) {
      console.error("Test Upload Error:", err);
      if (err instanceof StorageError) {
        setTestUploadError("Error uploading file. Please try again.");
      } else {
        setTestUploadError("An unexpected error occurred.");
      }
    }
  };

  const fetchUploadedImages = async () => {
    try {
      const { data: imageFiles, error: imageError } = await supabase.storage
        .from("Uploaded files")
        .list("Images");

      if (imageError) throw imageError;

      const imageUrls = imageFiles
        .filter((file) => file.name !== ".emptyFolderPlaceholder")
        .map((file) => {
          const { data } = supabase.storage
            .from("Uploaded files")
            .getPublicUrl(`Images/${file.name}`);
          return data.publicUrl;
        });

      setUploadedImages(imageUrls);
    } catch (err) {
      console.error("Error fetching images:", err);
    }
  };

  const handleTestButtonClick = () => {
    if (testFileInputRef.current) {
      testFileInputRef.current.click();
    }
  };

  const handleImageClick = (url) => {
    setSelectedImage(url);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  useEffect(() => {
    fetchUploadedImages();
  }, []);

  return (
    <VolunteerSidebar>
      <main className="flex h-screen justify-center">
        <div className="w-full max-w-2xl space-y-6 p-4 lg:p-8">
          <section className="mb-8 rounded-md border p-4">
            <h2 className="mb-2 text-xl font-semibold">🔍 Test File Upload</h2>
            <div className="flex items-center space-x-4">
              <Button onClick={handleTestButtonClick}>Upload Test File</Button>
              <input
                type="file"
                ref={testFileInputRef}
                className="hidden"
                onChange={handleTestFileChange}
                accept="image/*"
              />
              {testSelectedFile && (
                <span className="text-sm text-gray-700">
                  Selected File: {testSelectedFile.name}
                </span>
              )}
            </div>
            {testUploadStatus && (
              <p className="mt-2 break-all text-green-600">
                {testUploadStatus}
              </p>
            )}
            {testUploadError && (
              <p className="mt-2 text-red-600">{testUploadError}</p>
            )}
          </section>

          <section className="rounded-md border p-4">
            <h2 className="mb-2 text-xl font-semibold">📸 Uploaded Images</h2>
            <div className="grid grid-cols-2 gap-4">
              {uploadedImages.length === 0 ? (
                <p>No images uploaded yet.</p>
              ) : (
                uploadedImages.map((url, index) => (
                  <div key={index} className="flex justify-center">
                    <img
                      src={url}
                      alt={`Uploaded Image ${index + 1}`}
                      className="h-40 w-40 cursor-pointer object-cover"
                      onClick={() => handleImageClick(url)}
                    />
                  </div>
                ))
              )}
            </div>
          </section>

          {selectedImage && (
            <div
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75"
              onClick={handleOverlayClick} // Close modal on overlay click
            >
              <div className="relative">
                <button
                  onClick={closeModal}
                  className="absolute right-0 top-0 p-2 text-white"
                >
                  ✖️
                </button>
                <img
                  src={selectedImage}
                  alt="Full Size"
                  className="max-h-80 max-w-2xl object-contain" // Adjusted dimensions
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </VolunteerSidebar>
  );
}
