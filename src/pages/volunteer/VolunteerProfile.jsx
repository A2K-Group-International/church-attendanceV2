import { useState, useEffect } from "react";
import { format } from "date-fns"; // For date formatting
import supabase from "../../api/supabase"; // Ensure this path is correct
import VolunteerSidebar from "../../components/volunteer/VolunteerSidebar"; // Ensure this path is correct
import { useUser } from "../../authentication/useUser"; // Ensure this path is correct
import Spinner from "../../components/Spinner"; // Ensure this path is correct
import useUserData from "../../api/useUserData"; // Ensure this path is correct
import { Link } from "react-router-dom"; // Make sure you have this import for navigation

export default function VolunteerProfile() {
  const [availability, setAvailability] = useState(null); // State for availability
  const [posts, setPosts] = useState([]); // State for posts
  const [loadingPosts, setLoadingPosts] = useState(true); // State for loading posts

  // Use the custom hook to fetch user data
  const { userData, loading, error } = useUserData();
  console.log(userData);

  // Fetch posts from the post_data table using userData.user_id
  useEffect(() => {
    const fetchPosts = async () => {
      if (!userData) return; // Exit if userData is not yet available

      const { data, error } = await supabase
        .from("post_data")
        .select("*") // You can specify which columns to fetch
        .eq("post_user_id", userData.user_id); // Filter posts based on userData.user_id

      if (error) {
        console.error("Error fetching posts:", error);
      } else {
        setPosts(data);
      }
      setLoadingPosts(false);
    };

    fetchPosts();
  }, [userData]);

  // Function to get initials from user name
  const getInitials = (fullName) => {
    if (!fullName) return "V";
    const names = fullName.trim().split(" ");
    if (names.length === 0) return "V";
    const initials =
      names.length >= 2
        ? `${names[0][0]}${names[names.length - 1][0]}`
        : names[0][0];
    return initials.toUpperCase();
  };

  // Function to handle availability setting
  const handleAvailabilityChange = (e) => {
    setAvailability(e.target.value);
  };

  return (
    <VolunteerSidebar>
      <main className="flex justify-center p-4 lg:p-8">
        <div className="grid w-full max-w-7xl grid-cols-1 gap-6 md:grid-cols-2">
          {/* User Information Section */}
          <div className="space-y-6 rounded-md bg-white p-4 shadow-md">
            <header className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">My Profile</h1>
            </header>

            {/* Display Loading, Error, or User Data */}
            {loading ? (
              <Spinner />
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : userData ? (
              <div className="space-y-4">
                {/* User Avatar/Initials */}
                <div className="flex justify-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-500 text-2xl font-semibold text-white">
                    {getInitials(
                      `${userData.user_name} ${userData.user_last_name}`,
                    )}
                  </div>
                </div>
                {/* User Information */}
                <div>
                  <h2 className="text-xl font-semibold">Name</h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    {userData.user_name} {userData.user_last_name}
                  </p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Email</h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    {userData.user_email}
                  </p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Contact Number</h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    {userData.user_contact}
                  </p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Role</h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    {userData.user_role.charAt(0).toUpperCase() +
                      userData.user_role.slice(1)}
                  </p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Account Created</h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    {format(new Date(userData.created_at), "MMMM dd, yyyy")}
                  </p>
                </div>
                {/* Set Availability */}
                <div>
                  <h2 className="text-xl font-semibold">Set Availability</h2>
                  <select
                    value={availability || ""}
                    onChange={handleAvailabilityChange}
                    className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring"
                  >
                    <option value="" disabled>
                      Select your availability
                    </option>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="maybe">Maybe</option>
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No user data available.</p>
            )}
          </div>

          {/* My Posts Section */}
          <div className="space-y-6 rounded-md bg-white p-4 shadow-md">
            <header className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">My Posts</h1>
            </header>
            {/* Display Loading Posts */}
            {loadingPosts ? (
              <Spinner />
            ) : posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="flex flex-col rounded-lg bg-white p-6 shadow-md dark:bg-gray-800"
                  >
                    <div className="mb-4 flex flex-col">
                      <div className="flex items-center">
                        <div className="mr-4 flex-shrink-0">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-lg font-semibold text-white">
                            {getInitials(`${userData.user_name}`)}{" "}
                            {/* Use user's initials */}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              {userData.user_name} {userData.user_last_name}{" "}
                              {/* Use user's name */}
                            </span>
                            <span className="text-sm text-gray-500">
                              {format(
                                new Date(post.created_at),
                                "MMM dd, yyyy hh:mm a",
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {post.post_header}
                    </div>

                    <p className="text-gray-700 dark:text-gray-300">
                      {post.post_content}
                    </p>

                    <Link
                      to={`/volunteer-announcements-info/${post.post_id}`}
                      className="mt-4 inline-block text-blue-600 hover:underline"
                    >
                      Read more
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No posts available.</p>
            )}
          </div>
        </div>
      </main>
    </VolunteerSidebar>
  );
}
