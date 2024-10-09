import { useState, useEffect, useCallback } from "react";
import supabase from "../../api/supabase";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Table from "../../components/Table";
import { Button } from "../../shadcn/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../shadcn/pagination";

const headers = ["#", "Email", "Name", "Role", "Confirmed", "Action"];

export default function UsersPage() {
  // State Variables
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Confirmation filter dropdown
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false); // Role filter dropdown
  const [filter, setFilter] = useState("all"); // Confirmation filter state
  const [roleFilter, setRoleFilter] = useState("all"); // Role filter state
  const [newRole, setNewRole] = useState("user"); // State for new role selection
  const [feedbackMessage, setFeedbackMessage] = useState(null); // Inline feedback message

  const itemsPerPage = 7;

  // Fetch Data Function with Filters
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("user_list")
        .select("*", { count: "exact" })
        .range(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage - 1,
        );

      // Apply confirmation filter
      if (filter === "approved") {
        query = query.eq("is_confirmed", true);
      } else if (filter === "not_approved") {
        query = query.eq("is_confirmed", false);
      }

      // Apply role filter
      if (roleFilter !== "all") {
        query = query.eq("user_role", roleFilter);
      }

      const { data: fetchedData, error, count } = await query;

      if (error) throw error;

      setTotalPages(Math.ceil(count / itemsPerPage));
      setData(fetchedData);
    } catch (error) {
      setError("Error fetching users. Please try again.");
      console.error("Error in fetchData function:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, filter, roleFilter]);

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [currentPage, fetchData]);

  // Approve Account Function
  const handleApproveAccount = async (userData) => {
    try {
      const { error } = await supabase
        .from("user_list")
        .update({ is_confirmed: true })
        .eq("user_id", userData.user_id);

      if (error) throw error;

      fetchData(); // Refresh the data after updating
      setFeedbackMessage(`User ${userData.user_name} approved successfully.`);
    } catch (error) {
      console.error("Error approving account:", error);
      setFeedbackMessage("Failed to approve the user. Please try again.");
    } finally {
      setIsApproveDialogOpen(false);
      // Clear the feedback message after 3 seconds
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  // Open Approve Dialog
  const handleApproveClick = (userData) => {
    setSelectedUser(userData);
    setIsApproveDialogOpen(true);
  };

  // Confirm Approval
  const confirmApprove = () => {
    if (selectedUser) {
      handleApproveAccount(selectedUser);
    }
  };

  // Handle Change Role Click
  const handleChangeRoleClick = (userData) => {
    setSelectedUser(userData);
    setNewRole(userData.user_role); // Initialize with current role
    setIsRoleDialogOpen(true);
  };

  // Change User Role Function
  const handleChangeRole = async () => {
    try {
      const { error } = await supabase
        .from("user_list")
        .update({ user_role: newRole })
        .eq("user_id", selectedUser.user_id);

      if (error) throw error;

      fetchData(); // Refresh the data after updating
      setFeedbackMessage(
        `User ${selectedUser.user_name}'s role updated to ${newRole}.`,
      );
    } catch (error) {
      console.error("Error changing user role:", error);
      setFeedbackMessage("Failed to update the user's role. Please try again.");
    } finally {
      setIsRoleDialogOpen(false);
      // Clear the feedback message after 3 seconds
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  // Rows Mapping
  const rows = data.map((item, index) => {
    const isConfirmed = item.is_confirmed;
    return [
      index + 1 + (currentPage - 1) * itemsPerPage,
      item.user_email,
      item.user_name,
      // Display the user's role with proper capitalization
      item.user_role.charAt(0).toUpperCase() + item.user_role.slice(1),
      isConfirmed ? (
        <span className="font-bold text-green-600">Yes</span> // Emphasized for confirmed users
      ) : (
        <span className="text-red-600">No</span> // Highlighted for non-confirmed users
      ),
      // Action Buttons with Proper Alignment
      <div className="flex items-center justify-end space-x-2">
        {/* Approve Account Button */}
        <Button
          key={item.user_uuid}
          onClick={() => handleApproveClick(item)}
          variant="primary"
          disabled={isConfirmed}
          className={`${
            isConfirmed
              ? "cursor-not-allowed opacity-50"
              : "hover:bg-primary-600"
          }`}
        >
          {isConfirmed ? "Confirmed" : "Approve Account"}
        </Button>
        {/* Change Role Button */}
        <Button onClick={() => handleChangeRoleClick(item)} variant="secondary">
          Change Role
        </Button>
      </div>,
    ];
  });

  return (
    <AdminSidebar>
      <main className="mx-auto max-w-7xl p-4 lg:p-8">
        <h1 className="text-2xl font-bold">Users</h1>

        {/* Feedback Message */}
        {feedbackMessage && (
          <div className="mt-4 rounded bg-blue-100 p-4 text-blue-800">
            {feedbackMessage}
          </div>
        )}

        {/* Filters Section */}
        <div className="mb-4 mt-4 flex space-x-4">
          {/* Confirmation Filter Dropdown */}
          <div className="relative inline-block text-left">
            <div>
              <Button
                variant="default"
                className="flex w-56 items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
              >
                {filter === "all" && "All Users"}
                {filter === "approved" && "Approved Users"}
                {filter === "not_approved" && "Not Approved Users"}
                <svg
                  className={`-mr-1 ml-2 h-5 w-5 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180 transform" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </div>

            {/* Confirmation Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 z-10 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <div
                  className="py-1"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="options-menu"
                >
                  {["all", "approved", "not_approved"].map((option) => (
                    <button
                      key={option}
                      className={`block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${
                        filter === option
                          ? "bg-gray-100 font-semibold text-gray-900"
                          : ""
                      }`}
                      role="menuitem"
                      onClick={() => {
                        setFilter(option);
                        setCurrentPage(1); // Reset to first page when filter changes
                        setIsDropdownOpen(false); // Close the dropdown after selection
                      }}
                    >
                      {option === "all"
                        ? "All Users"
                        : option === "approved"
                          ? "Approved Users"
                          : "Not Approved Users"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Role Filter Dropdown */}
          <div className="relative inline-block text-left">
            <div>
              <Button
                variant="default"
                className="flex w-56 items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                onClick={() => setIsRoleDropdownOpen((prev) => !prev)}
              >
                {roleFilter === "all" && "All Roles"}
                {roleFilter === "admin" && "Admins"}
                {roleFilter === "user" && "Users"}
                {roleFilter === "volunteer" && "Volunteers"}
                <svg
                  className={`-mr-1 ml-2 h-5 w-5 transition-transform duration-200 ${
                    isRoleDropdownOpen ? "rotate-180 transform" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </div>

            {/* Role Dropdown Menu */}
            {isRoleDropdownOpen && (
              <div className="absolute right-0 z-10 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <div
                  className="py-1"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="role-options-menu"
                >
                  {["all", "admin", "user", "volunteer"].map((option) => (
                    <button
                      key={option}
                      className={`block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${
                        roleFilter === option
                          ? "bg-gray-100 font-semibold text-gray-900"
                          : ""
                      }`}
                      role="menuitem"
                      onClick={() => {
                        setRoleFilter(option);
                        setCurrentPage(1); // Reset to first page when filter changes
                        setIsRoleDropdownOpen(false); // Close the dropdown after selection
                      }}
                    >
                      {option === "all"
                        ? "All Roles"
                        : option === "admin"
                          ? "Admins"
                          : option === "user"
                            ? "Users"
                            : "Volunteers"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="mt-4 rounded-lg bg-card shadow">
          {loading ? (
            <div className="p-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading users...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-destructive">{error}</p>
            </div>
          ) : data.length > 0 ? (
            <>
              <Table headers={headers} rows={rows} />
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
                      }}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === index + 1}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(index + 1);
                        }}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages)
                          setCurrentPage((prev) => prev + 1);
                      }}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </>
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No users found.</p>
            </div>
          )}
        </div>
      </main>

      {/* Approve Account Dialog */}
      {isApproveDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-lg font-bold">Approve Account</h2>
            <p className="mt-2">
              Are you sure you want to approve the account for{" "}
              <strong>{selectedUser?.user_name}</strong>?
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="destructive"
                onClick={() => setIsApproveDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={confirmApprove}>
                Approve
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Dialog */}
      {isRoleDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-lg font-bold">Change User Role</h2>
            <p className="mt-2">
              Change the role for <strong>{selectedUser?.user_name}</strong>.
            </p>
            <div className="mt-4">
              <label
                htmlFor="role-select"
                className="block text-sm font-medium text-gray-700"
              >
                Select New Role:
              </label>
              <select
                id="role-select"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="volunteer">Volunteer</option>
              </select>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="destructive"
                onClick={() => setIsRoleDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleChangeRole}
                disabled={newRole === selectedUser?.user_role} // Disable if role hasn't changed
              >
                Update Role
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminSidebar>
  );
}
