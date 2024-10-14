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
      setLoading(false);
    }
  }, [userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !newAnnouncement.post_content.trim() ||
      !newAnnouncement.post_header.trim()
    ) {
      setError("Please enter both announcement content and header.");
      return;
    }
    try {
      const groupName =
        groupData && groupData[0] ? groupData[0].group_name : "";
      const { error } = await supabase.from("post_data").insert([
        {
          post_content: newAnnouncement.post_content,
          post_header: newAnnouncement.post_header,
          created_at: new Date().toISOString(),
          post_user_id: userData.user_id,
          post_group_id: groupId,
          group_name: groupName,
          user_name: `${userData.user_name} ${userData.user_last_name}`,
        },
      ]);
      if (error) throw error;

      fetchAnnouncements();
      setIsDialogOpen(false);
      setNewAnnouncement({ post_content: "", post_header: "" });
    } catch (err) {
      setError("Error creating announcement. Please try again.");
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

      if (error) throw error;

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
      if (error) throw error;
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
          {loading || userLoading || announcementsLoading ? (
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
                    onEdit={(postId) => {
                      setAnnouncementToEdit(post); // Set the announcement to edit
                      setIsEditDialogOpen(true); // Open the edit dialog
                    }}
                    onDelete={handleDelete} // Pass the delete function
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
