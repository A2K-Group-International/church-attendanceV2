import React from "react";
import supabase from "../../api/supabase"; // Import your Supabase client
import VolunteerSidebar from "../../components/volunteer/VolunteerSidebar"; // Sidebar component
import useUserData from "../../api/useUserData"; // Hook to get logged-in user data
import DutiesList from "../../components/volunteer/dashboard/DutiesList"; // Import the DutiesList component

const VolunteerDashboard = () => {
  const { userData } = useUserData(); // Get logged-in user data

  return (
    <VolunteerSidebar>
      <div className="flex">
        {/* Left side: Duties list */}
        <div className="w-1/3 p-4">
          <DutiesList userId={userData?.user_id} />
        </div>
        {/* Right side: Placeholder for Calendar */}
        <div className="w-2/3 p-4">
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
