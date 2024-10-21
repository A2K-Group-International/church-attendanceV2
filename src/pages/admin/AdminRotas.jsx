import React, { useState, useEffect } from "react";
import supabase from "../../api/supabase";
import AdminSidebar from "../../components/admin/AdminSidebar";
import DutiesList from "../../components/volunteer/dashboard/DutiesList";
import DashboardCalendar from "../../components/volunteer/dashboard/DashboardCalendar";

const AdminRotas = () => {
  const [groups, setGroups] = useState([]); // State for group list
  const [selectedGroup, setSelectedGroup] = useState(null); // Selected group
  const [users, setUsers] = useState([]); // State for users in selected group
  const [selectedUser, setSelectedUser] = useState(null); // Selected user
  const [duties, setDuties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch available groups
  const fetchGroups = async () => {
    try {
      const { data: groupsData, error: groupError } = await supabase
        .from("group_list")
        .select("group_id, group_name"); // Fetch group ID and name

      if (groupError) throw groupError;
      setGroups(groupsData);
    } catch (error) {
      console.error("Error fetching groups:", error.message);
      setError("Failed to fetch groups. Please try again later.");
    }
  };

  // Fetch users based on selected group
  const fetchUsers = async (groupId) => {
    try {
      const { data: usersData, error: usersError } = await supabase
        .from("user_list")
        .select("user_id, user_name") // Fetch users
        .eq("group_id", groupId);

      if (usersError) throw usersError;
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error.message);
      setError("Failed to fetch users. Please try again later.");
    }
  };

  // Fetch duties based on group or user
  const fetchDuties = async (groupId, userId = null) => {
    try {
      setLoading(true);
      setError(null);

      let dutiesData = [];

      if (userId) {
        // Fetch duties by user (user_assignments -> duties_list)
        const { data: assignments, error: assignmentError } = await supabase
          .from("user_assignments")
          .select("duties_id")
          .eq("user_id", userId);

        if (assignmentError) throw assignmentError;

        const dutyIds = assignments.map((assignment) => assignment.duties_id);

        if (dutyIds.length === 0) {
          setDuties([]); // Clear duties when no duties are found for the user
          return;
        }

        const { data: duties, error: dutiesError } = await supabase
          .from("duties_list")
          .select("*")
          .in("duties_id", dutyIds);

        if (dutiesError) throw dutiesError;
        dutiesData = duties;
      } else if (groupId) {
        // Fetch duties by group
        const { data: duties, error: dutiesError } = await supabase
          .from("duties_list")
          .select("*")
          .eq("group_id", groupId);

        if (dutiesError) throw dutiesError;
        dutiesData = duties;
      } else {
        // Fetch all duties when neither group nor user is selected
        const { data: duties, error: dutiesError } = await supabase
          .from("duties_list")
          .select("*");

        if (dutiesError) throw dutiesError;
        dutiesData = duties;
      }

      setDuties(dutiesData || []); // Update duties (empty if no data found)
    } catch (error) {
      console.error("Error fetching duties:", error.message);
      setError("Failed to fetch duties. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch groups on component mount
  useEffect(() => {
    fetchGroups();
  }, []);

  // Fetch users when a group is selected
  useEffect(() => {
    if (selectedGroup) {
      fetchUsers(selectedGroup);
    } else {
      setUsers([]); // Clear users when no group is selected
      setSelectedUser(null); // Reset user when group changes
      fetchDuties(null); // Fetch all duties when group is cleared
    }
  }, [selectedGroup]);

  // Fetch duties when a user or group is selected
  useEffect(() => {
    fetchDuties(selectedGroup, selectedUser);
  }, [selectedUser, selectedGroup]);

  return (
    <AdminSidebar>
      <div className="flex h-screen">
        {/* Selection portion on the left side */}
        <div className="flex w-1/3 flex-col p-4">
          {/* Group Selector */}
          <div className="mb-2 flex items-center">
            <label htmlFor="groupSelect" className="mr-2">
              Select Group:
            </label>
            <select
              id="groupSelect"
              value={selectedGroup || ""}
              onChange={(e) => {
                setSelectedGroup(e.target.value);
                setSelectedUser(null); // Reset user when group changes
              }}
              className="rounded border p-2"
            >
              <option value="" disabled>
                Select a group
              </option>
              {groups.map((group) => (
                <option key={group.group_id} value={group.group_id}>
                  {group.group_name}
                </option>
              ))}
            </select>
          </div>

          {/* User Selector */}
          {selectedGroup && (
            <div className="mb-2 flex items-center">
              <label htmlFor="userSelect" className="mr-2">
                Select User:
              </label>
              <select
                id="userSelect"
                value={selectedUser || ""}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="rounded border p-2"
              >
                <option value="" disabled>
                  Select a user
                </option>
                {users.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.user_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Duties list */}
          <DutiesList duties={duties} loading={loading} error={error} />
        </div>

        {/* Right side: Calendar stretching vertically */}
        <div className="flex w-2/3 flex-col p-4">
          <h2 className="mb-4 text-xl font-bold">Calendar</h2>
          <div className="h-full flex-grow rounded-lg border border-gray-300 p-4">
            <DashboardCalendar duties={duties} />
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
};

export default AdminRotas;
