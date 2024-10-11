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
  DialogFooter,
  DialogClose,
} from "../../shadcn/dialog";
import { Input } from "../../shadcn/input";
import { Textarea } from "../../shadcn/textarea";
import { Label } from "../../shadcn/label";
import useUserData from "../../api/useUserData";
import useAnnouncements from "../../api/useAnnouncements"; // Import the new hook
import AnnouncementCard from "../../components/volunteer/post/AnnouncementCard"; // Import the new component

export default function VolunteerAnnouncements() {
  const [groupId, setGroupId] = useState(null);
  const [groupData, setGroupData] = useState(null);
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

  // Use the custom hook to fetch announcements
  const {
    announcements,
    loading: announcementsLoading,
    error: announcementsError,
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

      // Fetch the announcements again after adding a new one
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

                        {/* Attach File button above the submit button */}
                        <div className="flex justify-between">
                          <Button
                            type="button"
                            className="w-full"
                            onClick={() => {
                              // Implement attachment functionality later
                              console.log("Attach file clicked");
                            }}
                          >
                            Attach File
                          </Button>
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

              <div className="space-y-4">
                {filteredAnnouncements.slice(0, visibleCount).map((post) => (
                  <AnnouncementCard
                    key={post.post_id}
                    post={post}
                    userId={userData.user_id}
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
            </>
          )}
        </div>
      </main>
    </VolunteerSidebar>
  );
}
