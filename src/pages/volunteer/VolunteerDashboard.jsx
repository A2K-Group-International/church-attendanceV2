import React from "react";
import supabase from "../../api/supabase"; // Import your Supabase client
import VolunteerSidebar from "../../components/volunteer/VolunteerSidebar"; // Sidebar component
import useUserData from "../../api/useUserData"; // Hook to get logged-in user data
import DutiesList from "../../components/volunteer/dashboard/DutiesList"; // Import the DutiesList component

const VolunteerDashboard = () => {
  const { userData } = useUserData(); // Get logged-in user data

  return (
    <VolunteerSidebar>
      <div className="flex h-screen">
        {" "}
        {/* Use full height for the dashboard */}
        {/* Left side: Duties list */}
        <div className="flex w-1/3 flex-col p-4">
          {" "}
          {/* Set the DutiesList to use flex column */}
          <DutiesList userId={userData?.user_id} />
        </div>
        {/* Right side: Placeholder for Calendar */}
        <div className="flex w-2/3 flex-col p-4">
          {" "}
          {/* Set the calendar area to use flex column */}
          <h2 className="mb-4 text-xl font-bold">Calendar Placeholder</h2>
          <div className="h-full rounded-lg border border-gray-300 p-4">
            {/* Here you can add your calendar component or placeholder */}
            <p>This is where the calendar will be displayed.</p>
          </div>
        </div>
      </div>
    </VolunteerSidebar>
  );
};

export default VolunteerDashboard;
