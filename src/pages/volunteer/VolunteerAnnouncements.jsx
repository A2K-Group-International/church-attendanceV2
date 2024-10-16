import { useState, useEffect, useCallback } from "react";
import supabase from "../../api/supabase";
import VolunteerSidebar from "../../components/volunteer/VolunteerSidebar";
import { useUser } from "../../authentication/useUser";
import Spinner from "../../components/Spinner";
import { Button } from "../../shadcn/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../shadcn/dialog";
import { Input } from "../../shadcn/input";
import { Label } from "../../shadcn/label";
import useUserData from "../../api/useUserData";
import useAnnouncements from "../../api/useAnnouncements";
import AnnouncementCard from "../../components/volunteer/post/AnnouncementCard";
import AnnouncementForm from "../../components/volunteer/post/AnnouncementForm";
import AnnouncementEdit from "../../components/volunteer/post/AnnouncementEdit"; // Import the edit component

export default function VolunteerAnnouncements() {
  const [groupId, setGroupId] = useState(null);
  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // New state for edit dialog
  const [newAnnouncement, setNewAnnouncement] = useState({
    post_content: "",
    post_header: "",
  });

  const [announcementToEdit, setAnnouncementToEdit] = useState(null); // State for the announcement being edited
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(10); // For pagination
  const [uploadedImage, setUploadedImage] = useState(null); // State for the uploaded image

  const { user } = useUser();
  const { userData, loading: userLoading, error: userError } = useUserData();
  const {
    announcements,
    loading: announcementsLoading,
    error: announcementsError,
    fetchAnnouncements,
  } = useAnnouncements(groupId);

  const fetchGroupInfo = useCallback(async () => {
    if (!userData) return;

    // Check if userData.group_id is null or undefined
    if (userData.group_id == null) {
      console.log("NO GROUP");
      setError("You are not a member of any group. Please contact an admin.");
      setLoading(false); // Stop loading immediately
      return; // Exit early
    }

    try {
      setGroupId(userData.group_id);
      const { data: groupData, error: groupError } = await supabase
        .from("group_list")
        .select("*")
        .eq("group_id", userData.group_id);

      if (groupError) throw groupError;
      setGroupData(groupData);
    } catch (err) {
      setError("Error fetching group information. Please try again.");
      console.error("Error fetching group information:", err);
    } finally {
      setLoading(false); // Ensure loading is set to false
    }
  }, [userData]);

  // Helper function to retrieve public URL with retries
  const getPublicUrlWithRetry = async (
    bucket,
    filePath,
    retries = 3,
    delayMs = 1000,
  ) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      const { data, error } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      if (error) {
        console.error(
          `Attempt ${attempt}: URL Retrieval Error:`,
          error.message,
        );
      } else if (data && data.publicUrl) {
        console.log(`Attempt ${attempt}: Public URL retrieved successfully.`);
        return data.publicUrl;
      } else {
        console.warn(`Attempt ${attempt}: publicUrl is undefined.`);
      }

      // Wait for the specified delay before the next attempt
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    throw new Error(
      "Failed to retrieve the public URL after multiple attempts.",
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    if (
      !newAnnouncement.post_content.trim() ||
      !newAnnouncement.post_header.trim()
    ) {
      setError("Please enter both announcement content and header."); // Set error message
      return; // Stop further execution
    }

    try {
      const groupName =
        groupData && groupData[0] ? groupData[0].group_name : "";
      let imageUrl = null; // Initialize imageUrl to null

      if (uploadedImage) {
        const fileExtension = uploadedImage.name.split(".").pop();
        const date = new Date();
        const dateString = date.toISOString().split("T")[0].replace(/-/g, ""); // YYYYMMDD
        const sanitizedHeader = newAnnouncement.post_header.replace(
          /[^a-zA-Z0-9]/g,
          "_",
        );
        const fileName = `${sanitizedHeader}_${dateString}.${fileExtension}`;
        const folder = "Images";

        // **Important:** Do NOT encode the path components
        const filePath = `${groupName}/${folder}/${fileName}`; // No encoding

        const BUCKET_NAME = "Uploaded files"; // Ensure this matches your bucket name

        // Upload the image to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, uploadedImage, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload Error:", uploadError.message);
          throw new Error(`Upload Error: ${uploadError.message}`);
        }

        console.log(`Image uploaded successfully to: ${filePath}`);

        // Retrieve the public URL with retry mechanism
        imageUrl = await getPublicUrlWithRetry(BUCKET_NAME, filePath, 5, 1000);
        console.log(`Public URL retrieved: ${imageUrl}`);
      }

      // Insert the announcement into the database
      const { error: insertError } = await supabase.from("post_data").insert([
        {
          post_content: newAnnouncement.post_content,
          post_header: newAnnouncement.post_header,
          created_at: new Date().toISOString(),
          post_user_id: userData.user_id,
          post_group_id: groupId,
          group_name: groupName,
          user_name: `${userData.user_name} ${userData.user_last_name}`,
          uploaded_image: imageUrl, // Use the publicUrl variable here
        },
      ]);

      if (insertError) {
        console.error("Insert Error:", insertError.message);
        throw insertError;
      }

      console.log("Announcement inserted successfully.");

      // Fetch announcements to refresh the list
      fetchAnnouncements();

      // Reset the dialog and form state
      setIsDialogOpen(false);
      setNewAnnouncement({ post_content: "", post_header: "" });
      setUploadedImage(null); // Reset the uploaded image
    } catch (err) {
      setError("Error creating announcement. Please try again."); // Set error message
      console.error("Error creating announcement:", err);
    }
  };

  // New function to handle editing announcements
  const handleEdit = async (announcement) => {
    try {
      const { error } = await supabase
        .from("post_data")
        .update({
          post_content: announcement.post_content,
          post_header: announcement.post_header,
          edited: true,
        })
        .eq("post_id", announcement.post_id);

      if (error) {
        console.error("Edit Error:", error.message);
        throw error;
      }

      console.log("Announcement edited successfully.");

      fetchAnnouncements();
      setIsEditDialogOpen(false); // Close the edit dialog
      setAnnouncementToEdit(null); // Clear the selected announcement
    } catch (err) {
      setError("Error editing announcement. Please try again.");
      console.error("Error editing announcement:", err);
    }
  };

  // New function to handle deletion
  const handleDelete = async (postId) => {
    try {
      const { error } = await supabase
        .from("post_data")
        .delete()
        .eq("post_id", postId);
      if (error) {
        console.error("Delete Error:", error.message);
        throw error;
      }

      console.log("Announcement deleted successfully.");

      fetchAnnouncements();
    } catch (err) {
      setError("Error deleting announcement. Please try again.");
      console.error("Error deleting announcement:", err);
    }
  };

  useEffect(() => {
    fetchGroupInfo();
  }, [fetchGroupInfo]);

  const filteredAnnouncements = announcements.filter(
    (post) =>
      post.post_content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.post_header.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const loadMoreAnnouncements = () => {
    setVisibleCount((prevCount) => prevCount + 10);
  };

  return (
    <VolunteerSidebar>
      <main className="flex h-screen justify-center">
        <div
          className="w-full max-w-2xl space-y-6 overflow-y-auto p-4 lg:p-8"
          style={{ maxHeight: "calc(100vh - 2rem)" }}
        >
          {loading ? (
            <Spinner />
          ) : (
            <>
              <header className="mb-4 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">
                    {groupData && groupData[0] && groupData[0].group_name
                      ? `${groupData[0].group_name} Announcements`
                      : "Volunteer Announcements"}
                  </h1>
                  {userData && (
                    <p className="text-gray-600">
                      Welcome, {userData.user_name} {userData.user_last_name}
                    </p>
                  )}
                </div>
                {groupId ? (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="ml-4">Create Announcement</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Create New Announcement</DialogTitle>
                        <DialogDescription>
                          Post a new announcement for your group.
                        </DialogDescription>
                      </DialogHeader>
                      <AnnouncementForm
                        newAnnouncement={newAnnouncement}
                        setNewAnnouncement={setNewAnnouncement}
                        handleSubmit={handleSubmit} // Pass the handleSubmit to the form
                        error={error} // Pass the error state here
                        groupName={
                          groupData && groupData[0]
                            ? groupData[0].group_name
                            : ""
                        } // Pass the group name here
                        setUploadedImage={setUploadedImage} // Pass the function to set uploaded image
                      />
                    </DialogContent>
                  </Dialog>
                ) : null}
              </header>

              <div className="mt-4">
                <Input
                  type="text"
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-4"
                />
              </div>

              <div className="space-y-4">
                {filteredAnnouncements.slice(0, visibleCount).map((post) => (
                  <AnnouncementCard
                    key={post.post_id}
                    post={post}
                    userId={userData.user_id}
                    onEdit={() => {
                      // Fix the onEdit handler
                      setAnnouncementToEdit(post); // Set the announcement to edit
                      setIsEditDialogOpen(true); // Open the edit dialog
                    }}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {filteredAnnouncements.length > visibleCount && (
                <Button onClick={loadMoreAnnouncements} className="mt-4">
                  Load More
                </Button>
              )}

              {error && <div className="text-red-500">{error}</div>}
              {announcementsError && (
                <div className="text-red-500">{announcementsError}</div>
              )}

              {/* Edit Announcement Dialog */}
              {announcementToEdit && (
                <Dialog
                  open={isEditDialogOpen}
                  onOpenChange={setIsEditDialogOpen}
                >
                  <DialogContent className="sm:max-w-[500px]">
                    <AnnouncementEdit
                      announcement={announcementToEdit}
                      setAnnouncement={setAnnouncementToEdit} // Set the edited announcement
                      handleEdit={handleEdit} // Pass the edit function
                    />
                  </DialogContent>
                </Dialog>
              )}
            </>
          )}
        </div>
      </main>
    </VolunteerSidebar>
  );
}
