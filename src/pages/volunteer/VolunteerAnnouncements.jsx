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
      const { data, error } = await supabase
        .from("user_list")
        .select("group_id") // Removed "group_name"
        .eq("user_uuid", user.id) // Assuming 'user_uuid' corresponds to 'user.id'
        .single();

      if (error) throw error;

      setGroupId(data.group_id);
    } catch (err) {
      setError("Error fetching group information. Please try again.");
      console.error("Error fetching group info:", err);
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
      const { error } = await supabase.from("post_data").insert([
        {
          post_content: newAnnouncement.post_content,
          created_at: new Date().toISOString(), // Current timestamp
          post_user_id: user.id,
          post_group_id: groupId,
          user_name: user.name || "Volunteer", // Fallback to "Volunteer" if name is not available
          // group_name: groupName, // Removed as group_name isn't fetched
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
   * Prepare table rows from announcements data
   */
  const rows = announcements.map((announcement) => [
    announcement.user_name || "Volunteer",
    announcement.post_content,
    format(new Date(announcement.created_at), "PPpp"), // Example: Oct 1, 2024, 5:49 PM
  ]);

  return (
    <VolunteerSidebar>
      <main className="flex justify-center">
        {/* Container for centered content */}
        <div className="w-full max-w-2xl space-y-6 p-4 lg:p-8">
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Volunteer Announcements</h1>
            {/* Create Announcement Button */}
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

                  {/* Optionally, allow selecting a date */}
                  {/* If you want to allow users to set a specific date, you can add a date picker here */}

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="submit">Post Announcement</Button>
                    </DialogClose>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </header>

          {/* Display Loading, Error, or Announcements */}
          {loading ? (
            <Spinner />
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : announcements.length > 0 ? (
            <ul className="space-y-4">
              {announcements.map((post) => (
                <li
                  key={post.post_id}
                  className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold">
                      {post.user_name || "Volunteer"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(post.created_at), "PPpp")}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {post.post_content}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No announcements available.</p>
          )}
        </div>
      </main>
    </VolunteerSidebar>
  );
}
