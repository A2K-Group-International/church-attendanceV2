// src/components/volunteer/VolunteerDuties.jsx

import React, { useState, useEffect } from "react";
import supabase from "../../api/supabase";
import VolunteerSidebar from "../../components/volunteer/VolunteerSidebar";
import DutyCard from "../../components/volunteer/duty/DutyCard"; // Import the DutyCard component
import DutyFormModal from "../../components/volunteer/duty/DutyFormModal"; // Modal component for adding duties
import EditDutyModal from "../../components/volunteer/duty/EditDutyModal"; // Modal component for editing duties
import DeleteDutyModal from "../../components/volunteer/duty/DeleteDutyModal"; // Modal component for deleting duties
import AssignUsersModal from "../../components/volunteer/duty/AssignUsersModal"; // Import AssignUsersModal
import OverviewModal from "../../components/volunteer/duty/OverviewModal";
import { Button } from "../../shadcn/button"; // Import Shadcn Button component
import useUserData from "../../api/useUserData"; // Hook to get logged-in user data

const VolunteerDuties = () => {
  const { userData } = useUserData(); // Get logged-in user data
  const [loading, setLoading] = useState(true); // State to manage loading status
  const [duties, setDuties] = useState([]); // State to store fetched duties
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State to control Add Duty modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State to control Edit Duty modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State to control Delete Duty modal
  const [selectedDuty, setSelectedDuty] = useState(null); // Duty selected for editing or deleting

  const [isOverviewModalOpen, setIsOverviewModalOpen] = useState(false); // State for Overview modal

  const [users, setUsers] = useState([]); // State to store group users
  const [isAssignUsersModalOpen, setIsAssignUsersModalOpen] = useState(false);
  const [currentDuty, setCurrentDuty] = useState(null); // Duty selected for assigning users

  // Fetch users based on group_id
  const fetchUsers = async (dutyId = null) => {
    try {
      if (!userData?.group_id) return; // Ensure group_id is available

      // Fetch all users based on group_id
      const { data: allUsers, error: userError } = await supabase
        .from("user_list")
        .select("*")
        .eq("group_id", userData.group_id);

      if (userError) throw userError;

      // If dutyId is provided, fetch assigned users for that duty
      let assignedUserIds = [];
      if (dutyId) {
        const { data: assignments, error: assignmentError } = await supabase
          .from("user_assignments")
          .select("user_id")
          .eq("duties_id", dutyId);

        if (assignmentError) throw assignmentError;

        assignedUserIds = assignments.map((assignment) => assignment.user_id);
      }

      // Filter out users who are already assigned to the current duty
      const filteredUsers = dutyId
        ? allUsers.filter((user) => !assignedUserIds.includes(user.user_id))
        : allUsers;

      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error.message);
    }
  };

  // Fetch users when the component mounts or group_id changes
  useEffect(() => {
    fetchUsers();
  }, [userData?.group_id]); // Refetch when group_id becomes available

  // Fetch duties based on group_id, including assigned users
  const fetchDuties = async () => {
    try {
      if (!userData?.group_id) return; // Ensure group_id is available
      setLoading(true);
      const { data, error } = await supabase
        .from("duties_list")
        .select(
          `
          *,
          user_assignments (
            user_id,
            user_list (user_name, user_last_name)
          )
        `,
        )
        .eq("group_id", userData.group_id); // Fetch only duties for the user's group

      if (error) throw error;

      // Transform data to include assigned users
      const dutiesWithAssignments = data.map((duty) => ({
        ...duty,
        assigned_users: duty.user_assignments
          ? duty.user_assignments.map((assignment) => ({
              user_id: assignment.user_id,
              user_name: assignment.user_list.user_name,
              user_last_name: assignment.user_list.user_lasts_name,
            }))
          : [],
      }));

      setDuties(dutiesWithAssignments);
    } catch (error) {
      console.error("Error fetching duties:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch duties when the component mounts or group_id changes
  useEffect(() => {
    fetchDuties();
  }, [userData?.group_id]); // Refetch when group_id becomes available

  const handleAddDuty = async (newDuty) => {
    try {
      const {
        dutyName,
        dutyDescription,
        dutyStartTime,
        dutyEndTime,
        selectedDays, // Get the selected days
      } = newDuty;

      // Create a single duty object to insert
      const dutyToInsert = {
        duty_name: dutyName,
        duty_description: dutyDescription,
        duty_start_time: dutyStartTime,
        duty_end_time: dutyEndTime,
        recurrence_pattern: "weekly", // Set the recurrence pattern to weekly
        recurrence_days: selectedDays, // Use selectedDays directly (no need to wrap in an array)
        group_id: userData.group_id, // Include group_id when adding the duty
      };

      const { data, error } = await supabase
        .from("duties_list")
        .insert([dutyToInsert]); // Insert a single duty

      if (error) throw error;

      console.log("Duty added successfully:", data);
      fetchDuties(); // Refresh the duties list after adding
    } catch (error) {
      console.error("Error adding duty:", error.message);
      // Optionally, set an error state to display a message in the UI
    } finally {
      setIsAddModalOpen(false); // Close the modal after submission
    }
  };

  const handleRemoveUser = async (dutyId, userId) => {
    try {
      const { error } = await supabase
        .from("user_assignments")
        .delete()
        .eq("duties_id", dutyId)
        .eq("user_id", userId);

      if (error) throw error;

      console.log("User unassigned successfully");
      fetchDuties(); // Refresh the duties list after unassigning
    } catch (error) {
      console.error("Error unassigning user:", error.message);
    }
  };

  // Handle opening the Edit Duty modal
  const handleOpenEditModal = (duty) => {
    setSelectedDuty(duty);
    setIsEditModalOpen(true);
  };

  // Handle editing a duty
  const handleEditDuty = async (updatedDuty) => {
    try {
      const { dutyName, dutyDescription, dutyDueDate } = updatedDuty;

      const { error } = await supabase
        .from("duties_list")
        .update({
          duty_name: dutyName,
          duty_description: dutyDescription,
          duty_due_date: dutyDueDate,
        })
        .eq("duties_id", selectedDuty.duties_id);

      if (error) throw error;

      console.log("Duty updated successfully");
      fetchDuties(); // Refresh the duties list after editing
    } catch (error) {
      console.error("Error editing duty:", error.message);
    } finally {
      setIsEditModalOpen(false); // Close the modal after editing
      setSelectedDuty(null);
    }
  };

  // Handle opening the Delete Duty modal
  const handleOpenDeleteModal = (duty) => {
    setSelectedDuty(duty);
    setIsDeleteModalOpen(true);
  };

  // Handle deleting a duty
  const handleDeleteDuty = async () => {
    try {
      const { error } = await supabase
        .from("duties_list")
        .delete()
        .eq("duties_id", selectedDuty.duties_id);

      if (error) throw error;

      console.log("Duty deleted successfully");
      fetchDuties(); // Refresh the duties list after deleting
    } catch (error) {
      console.error("Error deleting duty:", error.message);
    } finally {
      setIsDeleteModalOpen(false); // Close the modal after deleting
      setSelectedDuty(null);
    }
  };

  // Handle opening the Assign Users modal
  const handleOpenAssignModal = (duty) => {
    setCurrentDuty(duty);
    fetchUsers(duty.duties_id); // Fetch users while considering current duty assignments
    setIsAssignUsersModalOpen(true);
  };

  // Function to assign users to the current duty
  const assignUsersToDuty = async (selectedUsers) => {
    try {
      if (!currentDuty || selectedUsers.length === 0) return; // Ensure duty and users are selected

      // Insert assignments into user_assignments
      const { error } = await supabase.from("user_assignments").insert(
        selectedUsers.map((userId) => ({
          duties_id: currentDuty.duties_id, // ID of the duty to which users are assigned
          user_id: userId, // ID of the user being assigned
        })),
      );

      if (error) throw error;

      console.log("Users assigned successfully");
      fetchDuties(); // Refresh the duties list after assignment
    } catch (error) {
      console.error("Error assigning users:", error.message);
    } finally {
      setIsAssignUsersModalOpen(false); // Close the modal after assigning
      setCurrentDuty(null);
    }
  };

  return (
    <VolunteerSidebar>
      <main className="mx-auto max-w-7xl p-4 lg:p-8">
        {/* Header Section */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Rota Management</h1>
          <div className="flex items-center space-x-2">
            {" "}
            {/* Added a flex container for buttons */}
            <Button
              onClick={() => setIsAddModalOpen(true)} // Open Add Duty modal
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Add Rota
            </Button>
            <Button
              onClick={() => setIsOverviewModalOpen(true)} // Correctly passing a function
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Overview
            </Button>
          </div>
        </div>

        {/* Duty Cards Layout */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            // Loading Spinner
            <div className="p-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading duties...</p>
            </div>
          ) : duties.length > 0 ? (
            // Render DutyCards with edit, delete, and assign handlers
            duties.map((duty) => (
              <DutyCard
                key={duty.duties_id}
                duty={duty}
                onEditDuty={handleOpenEditModal} // Pass edit handler
                onDeleteDuty={handleOpenDeleteModal} // Pass delete handler
                onAssignUsers={() => handleOpenAssignModal(duty)} // Pass assign handler
                onRemoveUser={handleRemoveUser} // Pass the remove user function
              />
            ))
          ) : (
            // No Duties Found
            <div className="p-8 text-center">
              <p>No duties found.</p>
            </div>
          )}
        </div>
      </main>

      {/* Add Duty Modal */}
      <DutyFormModal
        isOpen={isAddModalOpen}
        onRequestClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddDuty}
      />

      {/* Edit Duty Modal */}
      {selectedDuty && (
        <EditDutyModal
          isOpen={isEditModalOpen}
          onRequestClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditDuty}
          duty={selectedDuty}
        />
      )}

      {/* Delete Duty Modal */}
      {selectedDuty && (
        <DeleteDutyModal
          isOpen={isDeleteModalOpen}
          onRequestClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteDuty}
          duty={selectedDuty}
        />
      )}

      {/* Assign Users Modal */}
      {currentDuty && (
        <AssignUsersModal
          isOpen={isAssignUsersModalOpen}
          onRequestClose={() => setIsAssignUsersModalOpen(false)}
          onAssign={assignUsersToDuty} // Pass the assign function
          onRemoveUser={handleRemoveUser} // Unassign users
          duty={currentDuty}
          users={users} // Pass the fetched users to the modal
        />
      )}
      <OverviewModal
        isOpen={isOverviewModalOpen}
        onRequestClose={() => setIsOverviewModalOpen(false)}
        duties={duties} // Pass the loaded duties
      />
    </VolunteerSidebar>
  );
};

export default VolunteerDuties;
