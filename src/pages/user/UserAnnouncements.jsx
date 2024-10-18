import { useState, useEffect, useCallback } from "react";
import supabase from "../../api/supabase";
import UserSidebar from "@/components/user/UserSidebar";
import { useUser } from "../../authentication/useUser";
import Spinner from "../../components/Spinner";
import { Button } from "../../shadcn/button";
import { Input } from "../../shadcn/input";
import useUserData from "../../api/useUserData";
import useAnnouncements from "../../api/useAnnouncements";
import AnnouncementCard from "../../components/user/post/AnnouncementCard";
import GroupSelect from "@/components/volunteer/post/GroupSelect";

export default function UserAnnouncements() {
  const [groupId, setGroupId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      setUserId(userData.user_id);
    } catch (err) {
      setError("Error fetching group information. Please try again.");
      console.error("Error fetching group information:", err);
    } finally {
      setLoading(false);
    }
  }, [userData]);

  const handleReaction = async (postId, reaction) => {
    try {
      const { data, error } = await supabase
        .from("reactions")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", userId);

      if (error) throw error;

      if (data.length > 0) {
        const existingReaction = data[0];

        if (existingReaction.reaction_type === reaction) {
          await supabase
            .from("reactions")
            .delete()
            .eq("reaction_id", existingReaction.reaction_id);
        } else {
          await supabase
            .from("reactions")
            .update({ reaction_type: reaction })
            .eq("reaction_id", existingReaction.reaction_id);
        }
      } else {
        await supabase
          .from("reactions")
          .insert([
            { post_id: postId, user_id: userId, reaction_type: reaction },
          ]);
      }
    } catch (error) {
      console.error("Error handling reaction:", error);
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
    <UserSidebar>
      <main className="flex h-screen justify-center">
        <div
          className="w-full max-w-2xl space-y-6 overflow-y-auto p-4 lg:p-8"
          style={{ maxHeight: "calc(100vh - 2rem)" }}
        >
          {loading ? (
            <Spinner />
          ) : (
            <>
              <header className="mb-4">
                <h1 className="text-2xl font-bold">Announcements</h1>
                {userData && (
                  <p className="text-gray-600">
                    Welcome, {userData.user_name} {userData.user_last_name}
                  </p>
                )}
              </header>

              <GroupSelect
                selectedGroupId={groupId}
                setSelectedGroupId={setGroupId}
              />

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
                    handleReaction={handleReaction}
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
    </UserSidebar>
  );
}
