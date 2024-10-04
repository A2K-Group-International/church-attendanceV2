// src/pages/VolunteerAnnouncements.jsx

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
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
  DialogFooter,
  DialogClose,
} from "../../shadcn/dialog";
import { Input } from "../../shadcn/input";
import { Label } from "../../shadcn/label";
import { format } from "date-fns";
import useUserData from "../../api/userUserData"; // Import your custom hook

const headers = ["User Name", "Content", "Date Created"];

export default function VolunteerAnnouncements() {
  const [groupId, setGroupId] = useState(null);
  const [groupData, setGroupData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    post_content: "",
  });

  const { user } = useUser(); // Get the current user
  const { userData, loading: userLoading, error: userError } = useUserData(); // Use custom hook for user data

  /**
   * Fetch the group_id for the current user from user_list table
   */
  const fetchGroupInfo = useCallback(async () => {
    if (!userData) return; // Exit if userData is not available

    try {
      setGroupId(userData.group_id); // Set groupId directly from userData

      // Now fetch group information using the group_id
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
      setLoading(false); // Set loading to false after fetching the data
    }
  }, [userData]);

  /**
   * Fetch announcements from post_data where post_group_id matches user's group_id
   */
  const fetchAnnouncements = useCallback(async () => {
    if (!groupId) return; // Exit if groupId is not available

    setLoading(true); // Set loading to true when fetching announcements
    setError(null);

    try {
      const { data, error } = await supabase
        .from("post_data")
        .select("*")
        .eq("post_group_id", groupId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAnnouncements(data);
    } catch (err) {
      setError("Error fetching announcements. Please try again.");
      console.error("Error fetching announcements:", err);
    } finally {
      setLoading(false); // Set loading to false after fetching the data
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
      const groupName =
        groupData && groupData[0] ? groupData[0].group_name : "";

      const { error } = await supabase.from("post_data").insert([
        {
          post_content: newAnnouncement.post_content,
          created_at: new Date().toISOString(),
          post_user_id: userData.user_id, // Use userData from the hook
          post_group_id: groupId,
          group_name: groupName,
          user_name: `${userData.user_name} ${userData.user_last_name}`, // Use userData from the hook
        },
      ]);

      if (error) throw error;

      fetchAnnouncements();

      setIsDialogOpen(false);
      setNewAnnouncement({ post_content: "" });
    } catch (err) {
      setError("Error creating announcement. Please try again.");
      console.error("Error creating announcement:", err);
    }
  };

  useEffect(() => {
    fetchGroupInfo();
  }, [fetchGroupInfo]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const getInitials = (fullName) => {
    if (!fullName) return "V";
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
        <div className="w-full max-w-2xl space-y-6 p-4 lg:p-8">
          {loading || userLoading ? ( // Check for loading state from user data
            <Spinner />
          ) : (
            <>
              <header className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                  {groupData && groupData[0] && groupData[0].group_name
                    ? `${groupData[0].group_name} Announcements`
                    : "Volunteer Announcements"}
                </h1>
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
                          <Label htmlFor="post_content">
                            Announcement Content
                          </Label>
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

              {error ? (
                <p className="text-red-500">{error}</p>
              ) : announcements.length > 0 ? (
                <ul className="space-y-4">
                  {announcements.map((post) => (
                    <li
                      key={post.post_id}
                      className="flex items-start rounded-lg bg-white p-4 shadow-md dark:bg-gray-800"
                    >
                      <div className="mr-4 flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-lg font-semibold text-white">
                          {getInitials(post.user_name)}
                        </div>
                      </div>
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
                        <Link
                          to={`/volunteer-announcements-info/${post.post_id}`}
                        >
                          <Button variant="link" className="mt-2 text-blue-500">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No announcements available.</p>
              )}
            </>
          )}
        </div>
      </main>
    </VolunteerSidebar>
  );
}
