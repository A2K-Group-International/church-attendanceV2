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
import { Textarea } from "../../shadcn/textarea";
import { Label } from "../../shadcn/label";
import { format } from "date-fns";
import useUserData from "../../api/userUserData";

export default function VolunteerAnnouncements() {
  const [groupId, setGroupId] = useState(null);
  const [groupData, setGroupData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    post_content: "",
    post_header: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  // New state for managing displayed announcements
  const [visibleCount, setVisibleCount] = useState(10); // Initial number of announcements to show

  const { user } = useUser();
  const { userData, loading: userLoading, error: userError } = useUserData();

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

  const fetchAnnouncements = useCallback(async () => {
    if (!groupId) return;

    setLoading(true);
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
      setLoading(false);
    }
  }, [groupId]);

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

  const filteredAnnouncements = announcements.filter(
    (post) =>
      post.post_content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.post_header.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const loadMoreAnnouncements = () => {
    setVisibleCount((prevCount) => prevCount + 10); // Load 10 more announcements
  };

  return (
    <VolunteerSidebar>
      <main className="flex h-screen justify-center">
        <div
          className="w-full max-w-2xl space-y-6 overflow-y-auto p-4 lg:p-8"
          style={{ maxHeight: "calc(100vh - 2rem)" }}
        >
          {loading || userLoading ? (
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
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="post_header">
                            Announcement Header
                          </Label>
                          <Input
                            id="post_header"
                            type="text"
                            value={newAnnouncement.post_header}
                            onChange={(e) =>
                              setNewAnnouncement({
                                ...newAnnouncement,
                                post_header: e.target.value,
                              })
                            }
                            required
                            placeholder="Enter the announcement header..."
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="post_content">
                            Announcement Content
                          </Label>
                          <Textarea
                            id="post_content"
                            value={newAnnouncement.post_content}
                            onChange={(e) =>
                              setNewAnnouncement({
                                ...newAnnouncement,
                                post_content: e.target.value,
                              })
                            }
                            required
                            placeholder="Enter your announcement here..."
                            className="h-40 w-full"
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

              <div className="mt-4">
                <Input
                  type="text"
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-4"
                />
              </div>

              {error ? (
                <p className="text-red-500">{error}</p>
              ) : filteredAnnouncements.length > 0 ? (
                <div className="space-y-4">
                  {filteredAnnouncements.slice(0, visibleCount).map((post) => (
                    <div
                      key={post.post_id}
                      className="flex flex-col rounded-lg bg-white p-6 shadow-md dark:bg-gray-800"
                    >
                      <div className="mb-4 flex flex-col">
                        <div className="flex items-center">
                          <div className="mr-4 flex-shrink-0">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-lg font-semibold text-white">
                              {getInitials(`${post.user_name}`)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {post.user_name}
                              </span>
                              <span className="text-sm text-gray-500">
                                {format(new Date(post.created_at), "PP")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <h2 className="mt-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                          {post.post_header}
                        </h2>
                        <p className="mt-2 text-gray-700 dark:text-gray-300">
                          {post.post_content}
                        </p>
                      </div>
                      <Link
                        to={`/volunteer-announcements-info/${post.post_id}`}
                        className="text-blue-500 hover:underline"
                      >
                        Read more
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No announcements found.</p>
              )}

              {visibleCount < filteredAnnouncements.length && (
                <Button onClick={loadMoreAnnouncements} className="mt-4">
                  Load More
                </Button>
              )}
            </>
          )}
        </div>
      </main>
    </VolunteerSidebar>
  );
}
