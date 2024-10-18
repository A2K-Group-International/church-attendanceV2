import React, { useState, useEffect } from "react";
import supabase from "../../../api/supabase";
import DashboardDutyCard from "./DashboardDutyCard"; // Import the DashboardDutyCard component
import Spinner from "../../../components/Spinner";

const DutiesList = ({ userId }) => {
  const [duties, setDuties] = useState([]); // State to store fetched duties
  const [loading, setLoading] = useState(true); // State to manage loading status
  const [error, setError] = useState(null); // State for error handling
  const [filter, setFilter] = useState("All"); // State to manage status filter

  // Fetch duties assigned to the logged-in user
  const fetchDuties = async () => {
    try {
      if (!userId) return; // Ensure user_id is available
      setLoading(true);
      setError(null); // Reset error state

      // Step 1: Get assignments for the user
      const { data: assignments, error: assignmentError } = await supabase
        .from("user_assignments")
        .select("duties_id")
        .eq("user_id", userId); // Fetch assignments for the logged-in user

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
      setLoading(false); // Set loading to false
    }
  };

  useEffect(() => {
    fetchDuties(); // Fetch duties on component mount
  }, [userId]); // Refetch when user_id becomes available

  // Function to handle setting the status of a duty
  const handleSetStatus = async (dutyId, newStatus) => {
    try {
      // Update duty status in the database
      const { error } = await supabase
        .from("duties_list")
        .update({ duty_status: newStatus }) // Update status
        .eq("duties_id", dutyId); // Where clause

      if (error) throw error;

      // Update local state
      setDuties((prevDuties) =>
        prevDuties.map((d) =>
          d.duties_id === dutyId ? { ...d, duty_status: newStatus } : d,
        ),
      );
    } catch (error) {
      console.error("Error updating duty status:", error.message);
      setError("Failed to update duty status. Please try again."); // Set error message
    }
  };

  // Filter duties based on selected status
  const filteredDuties =
    filter === "All"
      ? duties
      : duties.filter((duty) => duty.duty_status === filter);

  return (
    <div className="flex h-full flex-col">
      {" "}
      {/* Set the component to be a flex container */}
      <h1 className="mb-4 text-xl font-bold">Current Rotas</h1>
      {/* Status Filter */}
      <div className="mb-4">
        <label htmlFor="statusFilter" className="mr-2">
          Filter by Status:
        </label>
        <select
          id="statusFilter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded border border-gray-300 p-2"
        >
          <option value="All">All</option>
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      {error && <p className="text-red-600">{error}</p>}{" "}
      {/* Show error message */}
      <div className="flex flex-1 flex-col space-y-4 overflow-y-auto">
        {" "}
        {/* Add scrollable container with flex-1 */}
        {loading ? (
          <Spinner /> // Show loading spinner
        ) : filteredDuties.length > 0 ? (
          filteredDuties.map((duty) => (
            <DashboardDutyCard
              key={duty.duties_id}
              duty={duty}
              onSetStatus={handleSetStatus} // Pass the set status handler
            />
          ))
        ) : (
          <p>No Rotas assigned.</p> // Show message if no duties
        )}
      </div>
    </div>
  );
};

export default DutiesList;
