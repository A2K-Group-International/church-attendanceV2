import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import supabase from "../../api/supabase";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { Button } from "../../shadcn/button";
import { Input } from "../../shadcn/input";
import { Label } from "../../shadcn/label";

// Define the number of items per page
const itemsPerPage = 7;

export default function GroupsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState(null);
  const [allVolunteers, setAllVolunteers] = useState([]);
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  // Fetch groups and their members
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: fetchedData,
        error,
        count,
      } = await supabase
        .from("group_list")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage - 1,
        );

      if (error) throw error;

      // Fetch members for each group
      const groupsWithMembers = await Promise.all(
        fetchedData.map(async (group) => {
          const { data: members, error: memberError } = await supabase
            .from("user_list")
            .select("*")
            .eq("group_id", group.group_id)
            .eq("user_role", "volunteer"); // Ensure only volunteers are fetched

          if (memberError) {
            console.error("Fetch Members Error:", memberError);
            return { ...group, members: [] }; // Return empty members array on error
          }

          return { ...group, members };
        }),
      );

      setTotalPages(Math.ceil(count / itemsPerPage));
      setData(groupsWithMembers);
    } catch (error) {
      setError("Error fetching groups. Please try again.");
      console.error("Fetch Groups Error:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  // Fetch all volunteers (for assignment)
  const fetchAllVolunteers = useCallback(async () => {
    try {
      const { data: volunteers, error } = await supabase
        .from("user_list")
        .select("*")
        .eq("user_role", "volunteer")
        .is("group_id", null); // Only fetch volunteers with no group assigned

      if (error) throw error;

      setAllVolunteers(volunteers);
    } catch (error) {
      console.error("Fetch Volunteers Error:", error);
      setAssignError("Error fetching volunteers. Please try again.");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [currentPage, fetchData]);

  // Fetch all volunteers when Assign Members modal is opened
  useEffect(() => {
    if (isAssignModalOpen) {
      fetchAllVolunteers();
      setSelectedVolunteers([]);
    }
  }, [isAssignModalOpen, fetchAllVolunteers]);

  // Handle creation of a new group
  const handleCreateGroup = async (formData) => {
    setCreateLoading(true);
    setCreateError(null);
    try {
      const { groupName, groupDescription } = formData;
      const newGroup = {
        group_name: groupName,
        group_description: groupDescription,
      };

      const { error: insertError } = await supabase
        .from("group_list")
        .insert([newGroup]);

      if (insertError) throw insertError;

      fetchData();
      setIsCreateModalOpen(false);
      reset();
    } catch (error) {
      setCreateError(
        error.message || "Failed to create group. Please try again.",
      );
      console.error("Create Group Error:", error);
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle editing a group
  const handleEditGroup = (groupData) => {
    setSelectedGroup(groupData);
    setValue("groupName", groupData.group_name);
    setValue("groupDescription", groupData.group_description);
    setIsEditModalOpen(true);
  };

  // Handle updating a group
  const handleUpdateGroup = async (formData) => {
    setEditLoading(true);
    setEditError(null);
    try {
      const { groupName, groupDescription } = formData;
      const updatedGroup = {
        group_name: groupName,
        group_description: groupDescription,
      };

      const { error: updateError } = await supabase
        .from("group_list")
        .update(updatedGroup)
        .eq("group_id", selectedGroup.group_id);

      if (updateError) throw updateError;

      fetchData();
      setIsEditModalOpen(false);
      reset();
    } catch (error) {
      setEditError(
        error.message || "Failed to update group. Please try again.",
      );
      console.error("Update Group Error:", error);
    } finally {
      setEditLoading(false);
    }
  };

  // Handle opening the confirmation dialog (e.g., for deleting a group)
  const handleActionClick = (groupData) => {
    setSelectedGroup(groupData);
    setIsDialogOpen(true);
  };

  // Confirm deletion of a group
  const confirmDeleteGroup = async () => {
    if (!selectedGroup) return;

    try {
      const { error } = await supabase
        .from("group_list")
        .delete()
        .eq("group_id", selectedGroup.group_id);

      if (error) throw error;

      fetchData();
      setIsDialogOpen(false);
    } catch (error) {
      setError("Failed to delete group. Please try again.");
      console.error("Delete Group Error:", error);
    }
  };

  // Handle opening the Assign Members modal
  const handleOpenAssignModal = (groupData) => {
    setSelectedGroup(groupData);
    setIsAssignModalOpen(true);
  };

  // Handle assigning selected volunteers to the group
  const handleAssignMembers = async () => {
    if (selectedVolunteers.length === 0) {
      setAssignError("Please select at least one volunteer to assign.");
      return;
    }

    setAssignLoading(true);
    setAssignError(null);

    try {
      const updates = selectedVolunteers.map((userId) => ({
        user_id: userId,
        group_id: selectedGroup.group_id,
      }));

      const { error } = await supabase
        .from("user_list")
        .upsert(updates, { onConflict: "user_id" });

      if (error) throw error;

      fetchData();
      setIsAssignModalOpen(false);
    } catch (error) {
      setAssignError(
        error.message || "Failed to assign members. Please try again.",
      );
      console.error("Assign Members Error:", error);
    } finally {
      setAssignLoading(false);
    }
  };

  // Function to initiate removing a member (opens confirmation dialog)
  const initiateRemoveMember = (member) => {
    setMemberToRemove(member);
    setIsRemoveDialogOpen(true);
  };

  // Function to remove a member from a group
  const removeMemberFromGroup = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("user_list")
        .update({ group_id: null }) // Set group_id to null to remove the member from the group
        .eq("user_id", userId); // Match the user by their user_id

      if (error) throw error;

      console.log(`Member with user_id: ${userId} removed from the group`);
      // Refetch the groups and their members to reflect the change
      fetchData();
    } catch (error) {
      console.error("Remove Member Error:", error);
      setAssignError("Error removing the member. Please try again.");
    }
  };

  // Handle checkbox change for volunteer selection
  const handleCheckboxChange = (userId) => {
    setSelectedVolunteers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  return (
    // <AdminSidebar>
    <main className="mx-auto max-w-7xl p-4 lg:p-8">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Group Management</h1>
      </div>

      {/* Create Group Button */}
      <div className="mb-8">
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 sm:w-auto"
        >
          Create Group
        </Button>
      </div>

      {/* Group Cards Layout */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading groups...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-destructive">{error}</p>
          </div>
        ) : data.length > 0 ? (
          data.map((item) => (
            <div
              key={item.group_id}
              className="rounded-lg border p-6 shadow transition-shadow duration-300 hover:shadow-lg"
            >
              <h2 className="mb-2 text-2xl font-bold">{item.group_name}</h2>
              <p className="mb-1 text-gray-700">{item.group_description}</p>
              <p className="mb-4 text-sm text-gray-500">
                Created At: {new Date(item.created_at).toLocaleString()}
              </p>

              {/* Displaying Members */}
              <div className="mb-6">
                <h3 className="mb-2 text-lg font-semibold">Members:</h3>
                {item.members && item.members.length > 0 ? (
                  <ul className="list-disc space-y-2 pl-5">
                    {item.members.map((member) => (
                      <li
                        key={member.user_id}
                        className="flex items-center justify-between space-x-4"
                      >
                        <span className="text-gray-800">
                          {member.user_name} {member.user_last_name}
                        </span>
                        <button
                          onClick={() => initiateRemoveMember(member)} // Open confirmation dialog
                          className="font-medium text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No members found.</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button
                  onClick={() => handleEditGroup(item)}
                  variant="secondary"
                  className="px-4 py-2"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleActionClick(item)}
                  variant="destructive"
                  className="px-4 py-2"
                >
                  Delete
                </Button>
                <Button
                  onClick={() => handleOpenAssignModal(item)}
                  variant="primary"
                  className="px-4 py-2"
                >
                  Assign Members
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <p>No groups found.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex items-center justify-center space-x-4">
        <Button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          variant="secondary"
          className="px-4 py-2"
        >
          Previous
        </Button>
        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          variant="secondary"
          className="px-4 py-2"
        >
          Next
        </Button>
      </div>

      {/* Create Group Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">Create Group</h2>
            {createError && <p className="mb-4 text-red-600">{createError}</p>}
            <form onSubmit={handleSubmit(handleCreateGroup)}>
              <div className="mb-4">
                <Label htmlFor="groupName" className="mb-1 block">
                  Group Name
                </Label>
                <Input
                  id="groupName"
                  {...register("groupName", { required: true })}
                  placeholder="Enter group name"
                  className="w-full"
                />
                {errors.groupName && (
                  <p className="mt-1 text-red-600">Group name is required.</p>
                )}
              </div>
              <div className="mb-4">
                <Label htmlFor="groupDescription" className="mb-1 block">
                  Group Description
                </Label>
                <Input
                  id="groupDescription"
                  {...register("groupDescription", { required: true })}
                  placeholder="Enter group description"
                  className="w-full"
                />
                {errors.groupDescription && (
                  <p className="mt-1 text-red-600">Description is required.</p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="px-4 py-2"
                  disabled={createLoading}
                >
                  {createLoading ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {isEditModalOpen && selectedGroup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">Edit Group</h2>
            {editError && <p className="mb-4 text-red-600">{editError}</p>}
            <form onSubmit={handleSubmit(handleUpdateGroup)}>
              <div className="mb-4">
                <Label htmlFor="groupName" className="mb-1 block">
                  Group Name
                </Label>
                <Input
                  id="groupName"
                  {...register("groupName", { required: true })}
                  placeholder="Enter group name"
                  className="w-full"
                />
                {errors.groupName && (
                  <p className="mt-1 text-red-600">Group name is required.</p>
                )}
              </div>
              <div className="mb-4">
                <Label htmlFor="groupDescription" className="mb-1 block">
                  Group Description
                </Label>
                <Input
                  id="groupDescription"
                  {...register("groupDescription", { required: true })}
                  placeholder="Enter group description"
                  className="w-full"
                />
                {errors.groupDescription && (
                  <p className="mt-1 text-red-600">Description is required.</p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="px-4 py-2"
                  disabled={editLoading}
                >
                  {editLoading ? "Updating..." : "Update"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Members Modal */}
      {isAssignModalOpen && selectedGroup && (
        <div className="fixed inset-0 flex items-center justify-center overflow-auto bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">
              Assign Members to "{selectedGroup.group_name}"
            </h2>
            {assignError && <p className="mb-4 text-red-600">{assignError}</p>}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAssignMembers();
              }}
            >
              <div className="mb-6">
                <Label className="mb-2 block">Select Volunteers</Label>
                <div className="max-h-64 space-y-2 overflow-y-auto rounded border p-4">
                  {allVolunteers.length > 0 ? (
                    allVolunteers.map((volunteer) => (
                      <div
                        key={volunteer.user_id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={`volunteer-${volunteer.user_id}`}
                          checked={selectedVolunteers.includes(
                            volunteer.user_id,
                          )}
                          onChange={() =>
                            handleCheckboxChange(volunteer.user_id)
                          }
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                          htmlFor={`volunteer-${volunteer.user_id}`}
                          className="text-gray-700"
                        >
                          {volunteer.user_name} {volunteer.user_last_name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No volunteers available.</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="px-4 py-2"
                  disabled={assignLoading}
                >
                  {assignLoading ? "Assigning..." : "Assign"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Dialog */}
      {isRemoveDialogOpen && memberToRemove && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">Confirm Removal</h2>
            <p className="mb-6">
              Are you sure you want to remove{" "}
              <strong>
                {memberToRemove.user_name} {memberToRemove.user_last_name}
              </strong>{" "}
              from the group?
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsRemoveDialogOpen(false)}
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  removeMemberFromGroup(memberToRemove.user_id);
                  setIsRemoveDialogOpen(false);
                }}
                variant="destructive"
                className="px-4 py-2"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDialogOpen && selectedGroup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete the group "
              {selectedGroup.group_name}"?
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                variant="secondary"
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteGroup}
                variant="destructive"
                className="px-4 py-2"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
    // </AdminSidebar>
  );
}
