import React, { useState, useEffect } from "react";
import supabase from "../../api/supabase";
import VolunteerSidebar from "../../components/volunteer/VolunteerSidebar";
import DutyCard from "../../components/volunteer/DutyCard"; // Import the DutyCard component
import DutyFormModal from "../../components/volunteer/DutyFormModal"; // Modal component for adding duties
import EditDutyModal from "../../components/volunteer/EditDutyModal"; // Modal component for editing duties
import DeleteDutyModal from "../../components/volunteer/DeleteDutyModal"; // Modal component for deleting duties
import AssignUsersModal from "../../components/volunteer/AssignUsersModal"; // Import AssignUsersModal

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

  const [users, setUsers] = useState([]); // State to store group users
  const [isAssignUsersModalOpen, setIsAssignUsersModalOpen] = useState(false);
  const [currentDuty, setCurrentDuty] = useState(null);

  // Fetch users based on group_id
  const fetchUsers = async () => {
    try {
      if (!userData?.group_id) return; // Ensure group_id is available
      const { data, error } = await supabase
        .from("user_list")
        .select("*")
        .eq("group_id", userData.group_id); // Fetch users based on group_id

      if (error) throw error;

      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error.message);
    }
  };

  // Fetch users when the component mounts
  useEffect(() => {
    fetchUsers();
  }, [userData?.group_id]); // Refetch when group_id becomes available

  // Fetch duties based on group_id
  const fetchDuties = async () => {
    try {
      if (!userData?.group_id) return; // Ensure group_id is available
      setLoading(true);
      const { data, error } = await supabase
        .from("duties_list")
        .select("*")
        .eq("group_id", userData.group_id); // Fetch only duties for the user's group

      if (error) throw error;

      setDuties(data);
    } catch (error) {
      console.error("Error fetching duties:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch duties when the component mounts
  useEffect(() => {
    fetchDuties();
  }, [userData?.group_id]); // Refetch when group_id becomes available

  // Handle adding a new duty
  const handleAddDuty = async (newDuty) => {
    try {
      const { dutyName, dutyDescription, dutyDueDate } = newDuty;

      const { data, error } = await supabase.from("duties_list").insert([
        {
          duty_name: dutyName,
          duty_description: dutyDescription,
          duty_due_date: dutyDueDate,
          group_id: userData.group_id, // Include group_id when adding the duty
        },
      ]);

      if (error) throw error;

      console.log("Duty added successfully:", data);
      fetchDuties(); // Refresh the duties list after adding
    } catch (error) {
      console.error("Error adding duty:", error.message);
    } finally {
      setIsAddModalOpen(false); // Close the modal after submission
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
    setIsAssignUsersModalOpen(true);
  };

  // Function to assign users to the current duty
  const assignUsersToDuty = async (selectedUsers) => {
    try {
      // Here you would typically update your database with the assigned users
      const { error } = await supabase
        .from("duties_list")
        .update({ assigned_users: selectedUsers }) // Assuming you have a field for assigned users
        .eq("duties_id", currentDuty.duties_id);

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
          <h1 className="text-3xl font-bold">Volunteer Duties Management</h1>
          <Button
            onClick={() => setIsAddModalOpen(true)} // Open Add Duty modal
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Add Duty
          </Button>
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
          onAssign={assignUsersToDuty}
          duty={currentDuty}
          users={users} // Pass the fetched users to the modal
        />
      )}
    </VolunteerSidebar>
  );
};

export default VolunteerDuties;
