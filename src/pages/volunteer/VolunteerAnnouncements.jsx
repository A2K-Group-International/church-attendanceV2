import { useState, useEffect, useCallback } from "react";
import supabase from "../../api/supabase"; // Ensure this path is correct
import VolunteerSidebar from "../../components/volunteer/VolunteerSidebar"; // Ensure this path is correct
import { useUser } from "../../authentication/useUser"; // Ensure this path is correct
import Spinner from "../../components/Spinner"; // Ensure this path is correct
import { Button } from "../../shadcn/button"; // Ensure this path is correct
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../../shadcn/dialog"; // Ensure this path is correct
import { Input } from "../../shadcn/input"; // Ensure this path is correct
import { Label } from "../../shadcn/label";
import { format } from "date-fns"; // For date formatting

const headers = ["User Name", "Content", "Date Created"];

export default function VolunteerAnnouncements() {
  const [groupId, setGroupId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [groupData, setGroupData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    post_content: "",
  });

  const { user } = useUser(); // Assuming useUser provides { user: { id, name } }

  /**
   * Fetch the group_id for the current user from user_list table
   */
  const fetchGroupInfo = useCallback(async () => {
    if (!user) return; // Exit if user is not authenticated

    try {
      const { data: userData, error: userError } = await supabase
        .from("user_list")
        .select("*")
        .eq("user_uuid", user.id) // Assuming 'user_uuid' corresponds to 'user.id'
        .single();

      if (userError) throw userError;

      // Set user data and group ID
      setUserData(userData);
      setGroupId(userData.group_id);

      // Now fetch group information using the group_id
      try {
        const { data: groupData, error: groupError } = await supabase
          .from("group_list")
          .select("*")
          .eq("group_id", userData.group_id); // Use userData.group_id directly

        if (groupError) throw groupError;

        console.log("Group data:", groupData);
        setGroupData(groupData);
      } catch (groupError) {
        console.error("Error fetching group data:", groupError);
      }

      console.log("User and group data fetched successfully");
    } catch (err) {
      setError("Error fetching group information. Please try again.");
      console.error("Error fetching user data:", err);
    }
  }, [user]);

  /**
   * Fetch announcements from post_data where post_group_id matches user's group_id
   */
  const fetchAnnouncements = useCallback(async () => {
    if (!groupId) return; // Exit if groupId is not available

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("post_data")
        .select("*")
        .eq("post_group_id", groupId)
        .order("created_at", { ascending: false }); // Latest first

      if (error) throw error;

      setAnnouncements(data);
    } catch (err) {
      setError("Error fetching announcements. Please try again.");
      console.error("Error fetching announcements:", err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  /**
   * Handle the submission of a new announcement
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!newAnnouncement.post_content.trim()) {
      setError("Please enter the announcement content.");
      return;
    }

    try {
      // Ensure groupData[0] exists before using group_name
      const groupName =
        groupData && groupData[0] ? groupData[0].group_name : "";

      const { error } = await supabase.from("post_data").insert([
        {
          post_content: newAnnouncement.post_content,
          created_at: new Date().toISOString(),
          post_user_id: userData.user_id,
          post_group_id: groupId,
          group_name: groupName, // Correctly use group_name from groupData[0]
          user_name: `${userData.user_name} ${userData.user_last_name}`, // Concatenate with space between names
        },
      ]);

      if (error) throw error;

      // Refresh announcements list
      fetchAnnouncements();

      // Reset form and close dialog
      setIsDialogOpen(false);
      setNewAnnouncement({ post_content: "" });
    } catch (err) {
      setError("Error creating announcement. Please try again.");
      console.error("Error creating announcement:", err);
    }
  };

  /**
   * Fetch groupId when component mounts or user changes
   */
  useEffect(() => {
    fetchGroupInfo();
  }, [fetchGroupInfo]);

  /**
   * Fetch announcements when groupId is set
   */
  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  /**
   * Function to get initials from user name
   */
  const getInitials = (fullName) => {
    if (!fullName) return "V"; // Default initial if name is missing
    const names = fullName.split(" ");
    const initials =
      names.length >= 2
        ? `${names[0][0]}${names[names.length - 1][0]}`
        : names[0][0];
    return initials.toUpperCase();
  };

  return (
    <VolunteerSidebar>
      <main className="flex justify-center">
        {/* Container for centered content */}
        <div className="w-full max-w-2xl space-y-6 p-4 lg:p-8">
          <header className="flex items-center justify-between">
            {/* If groupData is available, display the group name in the title */}
            <h1 className="text-2xl font-bold">
              {groupData && groupData[0] && groupData[0].group_name
                ? `${groupData[0].group_name} Announcements`
                : "Volunteer Announcements"}
            </h1>
            {/* Create Announcement Button */}
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
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="post_content">Announcement Content</Label>
                      <Input
                        id="post_content"
                        type="text"
                        value={newAnnouncement.post_content}
                        onChange={(e) =>
                          setNewAnnouncement({
                            ...newAnnouncement,
                            post_content: e.target.value,
                          })
                        }
                        required
                        placeholder="Enter your announcement here..."
                        className="w-full"
                      />
                    </div>

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="submit">Post Announcement</Button>
                      </DialogClose>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            ) : null}
          </header>

          {/* Display Loading, Error, or Announcements */}
          {loading ? (
            <Spinner />
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : groupId === null ? ( // Check if groupId is null and display a message
            <p className="text-red-500">
              You are not assigned to any group. Please contact the admin.
            </p>
          ) : announcements.length > 0 ? (
            <ul className="space-y-4">
              {announcements.map((post) => (
                <li
                  key={post.post_id}
                  className="flex items-start rounded-lg bg-white p-4 shadow-md dark:bg-gray-800"
                >
                  {/* Avatar/Icon */}
                  <div className="mr-4 flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-lg font-semibold text-white">
                      {getInitials(post.user_name)}
                    </div>
                  </div>
                  {/* Announcement Content */}
                  <div className="flex-1">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {post.user_name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(post.created_at), "MMM dd, yyyy")}
                      </span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-300">
                      {post.post_content}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No announcements available.</p>
          )}
        </div>
      </main>
    </VolunteerSidebar>
  );
}
