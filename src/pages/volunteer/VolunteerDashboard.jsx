// VolunteerDashboard.js
import React, { useState, useEffect } from "react";
import supabase from "../../api/supabase"; // Import your Supabase client
import VolunteerSidebar from "../../components/volunteer/VolunteerSidebar"; // Sidebar component
import useUserData from "../../api/useUserData"; // Hook to get logged-in user data
import DutiesList from "../../components/volunteer/dashboard/DutiesList"; // Import the DutiesList component
import DashboardCalendar from "../../components/volunteer/dashboard/DashboardCalendar"; // Import the DashboardCalendar

const VolunteerDashboard = () => {
  const { userData } = useUserData(); // Get logged-in user data
  const [duties, setDuties] = useState([]); // State to store fetched duties
  const [loading, setLoading] = useState(true); // State to manage loading status
  const [error, setError] = useState(null); // State for error handling

  // Fetch duties assigned to the logged-in user
  const fetchDuties = async () => {
    try {
      if (!userData?.user_id) return; // Ensure user_id is available
      setLoading(true);
      setError(null); // Reset error state

      // Step 1: Get assignments for the user
      const { data: assignments, error: assignmentError } = await supabase
        .from("user_assignments")
        .select("duties_id")
        .eq("user_id", userData.user_id); // Fetch assignments for the logged-in user

      if (assignmentError) throw assignmentError;

      // Step 2: Get duties based on assignments
      const dutyIds = assignments.map((assignment) => assignment.duties_id);
      if (dutyIds.length === 0) return; // No duties assigned

      const { data: dutiesData, error: dutiesError } = await supabase
        .from("duties_list")
        .select("*")
        .in("duties_id", dutyIds); // Fetch duties with the IDs from assignments

      if (dutiesError) throw dutiesError;

      setDuties(dutiesData); // Store fetched duties
    } catch (error) {
      console.error("Error fetching duties:", error.message);
      setError("Failed to fetch duties. Please try again later."); // Set error message
    } finally {
      console.log(duties);
      setLoading(false); // Set loading to false
    }
  };

  useEffect(() => {
    fetchDuties(); // Fetch duties on component mount
  }, [userData]); // Refetch when userData changes

  return (
    // <VolunteerSidebar>
    <div className="flex h-screen">
      {/* Left side: Duties list */}
      <div className="flex w-1/3 flex-col p-4">
        {/* Pass fetched duties, loading, and error to DutiesList */}
        <DutiesList duties={duties} loading={loading} error={error} />
      </div>
      {/* Right side: Calendar */}
      <div className="flex w-2/3 flex-col p-4">
        <h2 className="mb-4 text-xl font-bold">Calendar</h2>
        <div className="h-full rounded-lg border border-gray-300 p-4">
          <DashboardCalendar duties={duties} />{" "}
          {/* Pass duties to the calendar */}
        </div>
      </div>
    </div>
    // </VolunteerSidebar>
  );
};

export default VolunteerDashboard;
