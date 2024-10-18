import React, { useState } from "react";
import DashboardDutyCard from "./DashboardDutyCard"; // Import the DashboardDutyCard component
import Spinner from "../../../components/Spinner";

const DutiesList = ({ duties, loading, error }) => {
  // State to manage status filter
  const [filter, setFilter] = useState("All");

  // Filter duties based on selected status
  const filteredDuties =
    filter === "All"
      ? duties
      : duties.filter((duty) => duty.duty_status === filter);

  return (
    <div className="flex h-full flex-col">
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
        {loading ? (
          <Spinner /> // Show loading spinner
        ) : filteredDuties.length > 0 ? (
          filteredDuties.map((duty) => (
            <DashboardDutyCard
              key={duty.duties_id}
              duty={duty}
              // Pass the onSetStatus function if needed
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
