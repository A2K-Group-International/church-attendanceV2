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
  const [groupName, setGroupName] = useState("");

  const { userData } = useUserData();

  const fetchGroupInfo = useCallback(async () => {
    if (!userData) return;
    try {
      const { data: groupData, error: groupError } = await supabase
        .from("group_list")
        .select("")
        .eq("group_id", userData.group_id);
      if (groupError) throw groupError;

      // Ensure groupData is an array and extract the group_name
      if (groupData && groupData.length > 0) {
        setGroupName(groupData[0].group_name); // Set the group name correctly
      } else {
        setGroupName("No Group Found"); // Fallback if no group is found
      }
    } catch (err) {
      console.error("Error fetching group information:", err);
    }
  }, [userData]);

  useEffect(() => {
    fetchGroupInfo();
    fetchUploadedContent();
  }, [fetchGroupInfo]);
  // Handle file selection
  const handleFileSelect = (e) => {
    if (e.target.files.length === 0) return;
    const file = e.target.files[0];
    setSelectedFile(file);
    setUploadError(null);
  };

  // Upload the selected file
  // Upload the selected file
  const handleUpload = async (customFileName) => {
    if (!selectedFile || !groupName) return;

    try {
      setLoadingUpload(true);
      const isImage = selectedFile.type.startsWith("image");
      const folder = isImage ? "Images" : "Files";
      const fileExtension = selectedFile.name.split(".").pop();
      const fileName = `${customFileName}.${fileExtension}`;

      // Include groupName in the file path
      const filePath = `${groupName}/${folder}/${fileName}`;

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
      await fetchUploadedContent(); // Ensure data is updated after upload
    } catch (err) {
      console.error("Upload Error:", err);
      setUploadError("Error uploading file. Please try again.");
    } finally {
      setLoadingUpload(false);
    }
  };

  // Fetch uploaded images and files
  const fetchUploadedContent = async () => {
    if (!groupName) return; // Ensure groupName is available
    setLoadingFetch(true); // Start loading
    try {
      const fetchData = async (folder) => {
        const { data: files, error } = await supabase.storage
          .from("Uploaded files")
          .list(`${groupName}/${folder}`);
        if (error) throw error;

        const urls = await Promise.all(
          files
            .filter((file) => file.name !== ".emptyFolderPlaceholder")
            .map(async (file) => {
              const { data } = supabase.storage
                .from("Uploaded files")
                .getPublicUrl(`${groupName}/${folder}/${file.name}`);
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
      setLoadingFetch(false); // Stop loading
    }
  };

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
      const oldPath = `${groupName}/${folder}/${name}`;
      const newPath = `${groupName}/${folder}/${finalNewName}`;

      const { error: moveError } = await supabase.storage
        .from("Uploaded files")
        .move(oldPath, newPath);

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
    setDeleteModalOpen(true); // Show the confirmation modal for deletion
  };

  // Confirm deletion of the selected file
  const confirmDelete = async () => {
    if (!deleteItem) return;

    const { name, folder } = deleteItem;

    if (!folder || !name || !groupName) {
      console.error(
        "Delete Error: Missing folder, name, or groupName in item:",
        deleteItem,
      );
      return;
    }

    setLoadingDelete(true);
    try {
      const filePath = `${groupName}/${folder}/${name}`;
      const { error: deleteError } = await supabase.storage
        .from("Uploaded files")
        .remove([filePath]);

      if (deleteError) throw deleteError;

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
          <div>
            <h1 className="text-2xl font-bold">{groupName} Files</h1>
            {/* Display group name */}
          </div>
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
                {loadingFetch ? (
                  <p className="py-4 text-center">Loading images...</p> // You can replace this with a spinner if you have one.
                ) : (
                  <UploadedImagesSection
                    images={uploadedImages}
                    onImageSelect={setSelectedImage}
                    onRename={(item) => openRenameModal(item, "Images")}
                    onDelete={handleDelete}
                    loadingDelete={loadingDelete}
                  />
                )}
              </div>
            </div>

            {/* Image Viewer */}
            <div className="flex h-96 flex-col lg:w-2/3">
              <h2 className="mb-2 text-xl font-semibold">Image Viewer</h2>
              <div className="flex-grow overflow-auto rounded-md border">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={selectedImage.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <p className="text-center">
                    No image selected. Please select an image to view.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Uploaded Files Section */}
          {loadingFetch ? (
            <p className="py-4 text-center">Loading files...</p> // Again, replace with a spinner if available.
          ) : (
            <UploadedFilesSection
              files={uploadedFiles}
              onRename={(item) => openRenameModal(item, "Files")}
              onDelete={handleDelete}
              loadingDelete={loadingDelete}
            />
          )}
        </div>

        {/* Rename Modal */}
        <RenameModal
          isOpen={!!renameItem}
          onClose={() => setRenameItem(null)}
          item={renameItem}
          onRenameConfirm={handleRenameConfirm}
          loadingRename={loadingRename}
        />

        {/* Success Modal */}
        <SuccessModal
          isOpen={successModalOpen}
          onClose={() => setSuccessModalOpen(false)}
          message={successMessage}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          item={deleteItem}
          loadingDelete={loadingDelete}
        />
      </main>
    </VolunteerSidebar>
  );
}
