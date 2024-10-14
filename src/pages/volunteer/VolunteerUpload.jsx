import { useState, useEffect, useCallback } from "react";
import supabase from "../../api/supabase";
import VolunteerSidebar from "../../components/volunteer/VolunteerSidebar";
import FileUploadSection from "../../components/volunteer/VolunteerUpload/FileUploadSection";
import UploadedImagesSection from "../../components/volunteer/VolunteerUpload/UploadedImagesSection";
import UploadedFilesSection from "../../components/volunteer/VolunteerUpload/UploadedFilesSection";
import RenameModal from "../../components/volunteer/VolunteerUpload/RenameModal";
import SuccessModal from "../../components/volunteer/VolunteerUpload/SuccessModal";
import DeleteConfirmationModal from "../../components/volunteer/VolunteerUpload/DeleteConfirmationModal";
import useUserData from "../../api/useUserData";

export default function VolunteerUploadPage() {
  // State variables
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [renameItem, setRenameItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingRename, setLoadingRename] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [groupData, setGroupData] = useState(null);
  const { userData } = useUserData();

  const fetchGroupInfo = useCallback(async () => {
    if (!userData || !userData.group_id) return;

    setLoadingFetch(true);
    try {
      const { data, error } = await supabase
        .from("group_list")
        .select("*")
        .eq("group_id", userData.group_id);

      if (error) throw error;

      // Assuming groupData is always an array
      if (data.length > 0) {
        setGroupData(data[0]); // Set group data (first item)
      } else {
        console.warn("No group data found.");
      }
    } catch (err) {
      console.error("Error fetching group information:", err);
    } finally {
      setLoadingFetch(false);
      console.log(groupData.group_name);
    }
  }, [userData]);

  useEffect(() => {
    fetchGroupInfo();
  }, [fetchGroupInfo]);

  // Handle file selection
  const handleFileSelect = (e) => {
    if (e.target.files.length === 0) return;
    const file = e.target.files[0];
    setSelectedFile(file);
    setUploadError(null);
  };

  // Upload the selected file
  const handleUpload = async (customFileName) => {
    if (!selectedFile) return;

    try {
      setLoadingUpload(true);
      const isImage = selectedFile.type.startsWith("image");
      const folder = isImage ? "Images" : "Files";
      const fileExtension = selectedFile.name.split(".").pop();
      const fileName = `${customFileName}.${fileExtension}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("Uploaded files")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      setSuccessMessage(`File "${fileName}" uploaded successfully!`);
      setSuccessModalOpen(true);
      setSelectedFile(null); // Clear selected file after upload
      await fetchUploadedContent(); // Await to ensure data is updated
    } catch (err) {
      console.error("Upload Error:", err);
      setUploadError("Error uploading file. Please try again.");
    } finally {
      setLoadingUpload(false);
    }
  };

  // Fetch uploaded images and files
  const fetchUploadedContent = async () => {
    setLoadingFetch(true);
    try {
      const fetchData = async (folder) => {
        const { data: files, error } = await supabase.storage
          .from("Uploaded files")
          .list(folder);
        if (error) throw error;

        const urls = await Promise.all(
          files
            .filter((file) => file.name !== ".emptyFolderPlaceholder")
            .map(async (file) => {
              const { data } = supabase.storage
                .from("Uploaded files")
                .getPublicUrl(`${folder}/${file.name}`);
              return { name: file.name, url: data.publicUrl, folder };
            }),
        );

        return urls;
      };

      const imageUrls = await fetchData("Images");
      const fileUrls = await fetchData("Files");

      setUploadedImages(imageUrls);
      setUploadedFiles(fileUrls);
    } catch (err) {
      console.error("Error fetching content:", err);
    } finally {
      setLoadingFetch(false);
    }
  };

  useEffect(() => {
    fetchUploadedContent();
  }, []);

  // Rename file
  const handleRenameConfirm = async (newFileName) => {
    if (!renameItem) return;

    setLoadingRename(true);
    try {
      const { name, folder } = renameItem;
      const fileExtension = name.split(".").pop();
      const finalNewName = newFileName.endsWith(`.${fileExtension}`)
        ? newFileName
        : `${newFileName}.${fileExtension}`;

      const { error: moveError } = await supabase.storage
        .from("Uploaded files")
        .move(`${folder}/${name}`, `${folder}/${finalNewName}`);

      if (moveError) throw moveError;

      setRenameItem(null);
      setSuccessMessage(`File "${finalNewName}" renamed successfully!`);
      setSuccessModalOpen(true);
      await fetchUploadedContent();
    } catch (err) {
      console.error("Rename Error:", err);
    } finally {
      setLoadingRename(false);
    }
  };

  // Delete file
  const handleDelete = (item) => {
    setDeleteItem(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    const { name, folder } = deleteItem;

    if (!folder || !name) {
      console.error(
        "Delete Error: Missing folder or name in item:",
        deleteItem,
      );
      return;
    }

    setLoadingDelete(true);
    try {
      const filePath = `${folder}/${name}`;
      const { data, error: deleteError } = await supabase.storage
        .from("Uploaded files")
        .remove([filePath]);

      if (deleteError) {
        console.error("Delete Error:", deleteError);
        throw deleteError;
      }

      if (selectedImage === deleteItem.url && folder === "Images") {
        setSelectedImage(null);
      }

      setSuccessMessage(`File "${name}" deleted successfully!`);
      setSuccessModalOpen(true);
      await fetchUploadedContent();
    } catch (err) {
      console.error("Delete Error:", err);
    } finally {
      setLoadingDelete(false);
      setDeleteModalOpen(false);
    }
  };

  // Open Rename Modal
  const openRenameModal = (item, folder) => {
    setRenameItem({ name: item.name, folder });
  };

  // Clear selected image
  const clearSelectedImage = () => {
    setSelectedImage(null);
  };

  return (
    <VolunteerSidebar>
      <main className="flex h-screen flex-col lg:flex-row">
        {/* Main Content */}
        <div className="w-full space-y-6 overflow-auto p-4 lg:w-3/4 lg:p-8">
          {/* File Upload Section */}
          <FileUploadSection
            onFileSelect={handleFileSelect}
            onUpload={handleUpload}
            loading={loadingUpload}
            uploadError={uploadError}
            selectedFile={selectedFile} // Pass selectedFile state
          />

          {/* Main layout for images and viewer */}
          <div className="flex flex-col lg:flex-row lg:space-x-4">
            {/* Uploaded Images Section */}
            <div className="flex h-96 flex-col lg:w-1/3">
              <h2 className="mb-2 text-xl font-semibold">📸 Uploaded Images</h2>
              <div className="flex-grow overflow-auto rounded-md border">
                <UploadedImagesSection
                  images={uploadedImages}
                  onImageSelect={setSelectedImage}
                  onRename={(item) => openRenameModal(item, "Images")}
                  onDelete={handleDelete}
                  loading={loadingFetch}
                />
              </div>
            </div>

            {/* Image Viewer Section */}
            <div className="flex h-96 flex-col lg:w-2/3">
              <h2 className="mb-2 text-xl font-semibold">Image Viewer</h2>
              <div className="flex-grow overflow-auto rounded-md border">
                {selectedImage && (
                  <div className="flex flex-col items-center justify-center">
                    <img
                      src={selectedImage}
                      alt="Selected"
                      className="h-full object-cover"
                    />
                    <button
                      className="mt-2 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                      onClick={clearSelectedImage}
                    >
                      Clear Selection
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Uploaded Files Section */}
          <div className="flex flex-col lg:w-full">
            <h2 className="mb-2 text-xl font-semibold">📁 Uploaded Files</h2>
            <div className="overflow-auto rounded-md border">
              <UploadedFilesSection
                files={uploadedFiles}
                onRename={openRenameModal}
                onDelete={handleDelete}
                loading={loadingFetch}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Rename Modal */}
      {renameItem && (
        <RenameModal
          item={renameItem}
          onConfirm={handleRenameConfirm}
          onCancel={() => setRenameItem(null)}
          loading={loadingRename}
        />
      )}

      {/* Success Modal */}
      {successModalOpen && (
        <SuccessModal
          message={successMessage}
          onClose={() => setSuccessModalOpen(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <DeleteConfirmationModal
          item={deleteItem}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModalOpen(false)}
          loading={loadingDelete}
        />
      )}
    </VolunteerSidebar>
  );
}
