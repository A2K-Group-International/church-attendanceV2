import { useState, useEffect, useCallback } from "react";
import supabase from "../../api/supabase"; // Ensure this path is correct
import VolunteerSidebar from "../../components/volunteer/VolunteerSidebar"; // Ensure this path is correct
import { useUser } from "../../authentication/useUser"; // Ensure this path is correct
import Spinner from "../../components/Spinner"; // Ensure this path is correct
import { format } from "date-fns"; // For date formatting

export default function VolunteerProfile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availability, setAvailability] = useState(null); // New state for availability

  const { user } = useUser(); // Assuming useUser provides { user: { id, name, email } }

  // Fetch the current user's data from user_list table
  const fetchUserData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("user_list")
        .select("*")
        .eq("user_uuid", user.id)
        .single();

      if (error) throw error;

      setUserData(data);
    } catch (err) {
      setError("Error fetching user data. Please try again.");
      console.error("Error fetching user data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch user data when component mounts or user changes
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

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
        {/* Container for centered content */}
        <div className="w-full max-w-xl space-y-6 rounded-md bg-white p-4 shadow-md">
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
      </main>
    </VolunteerSidebar>
  );
}
