import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form"; // Import useForm from react-hook-form
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "../../shadcn/dialog";
import { Input } from "../../shadcn/input";
import { Label } from "../../shadcn/label";
import RequestPage from "./RequestPage";

// Define the table headers
const headers = [
  "#",
  "Email",
  "First Name",
  "Last Name",
  "Contact Number",
  "Confirmed",
  "Action",
];

export default function VolunteersPage() {
  // State variables for fetching volunteers
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Toggle for filter dropdown
  const [visiblePassword, setVisiblePassword] = useState(false); // Toggle for password visibility
  const itemsPerPage = 7;
  const [filter, setFilter] = useState("all"); // "all", "confirmed", "not_confirmed"

  // State variables for creating a new volunteer
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Toggle for create modal
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset, // To reset the form after submission
  } = useForm();

  // Fetch data from Supabase
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("user_list")
        .select("*", { count: "exact" })
        .eq("user_role", "volunteer") // Filter by user_role = volunteer
        .range(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage - 1,
        );

      // Apply additional filter based on selected option
      if (filter === "confirmed") {
        query = query.eq("is_confirmed", true);
      } else if (filter === "not_confirmed") {
        query = query.eq("is_confirmed", false);
      }

      const { data: fetchedData, error, count } = await query;

      if (error) throw error;

      setTotalPages(Math.ceil(count / itemsPerPage));
      setData(fetchedData);
    } catch (error) {
      setError("Error fetching volunteers. Please try again.");
      console.error("Error in fetchData function:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, filter]);

  // Fetch data when component mounts or dependencies change
  useEffect(() => {
    fetchData();
  }, [currentPage, fetchData]);

  // Handle activation/deactivation
  const handleToggleConfirmation = async (volunteerData) => {
    try {
      const { error } = await supabase
        .from("user_list")
        .update({ is_confirmed: !volunteerData.is_confirmed })
        .eq("user_id", volunteerData.user_id); // Assuming 'user_id' is the primary key

      if (error) throw error;

      fetchData(); // Refresh the data after updating
    } catch (error) {
      console.error("Error toggling confirmation:", error);
      setError("Failed to update volunteer status. Please try again.");
    } finally {
      setIsDialogOpen(false);
    }
  };

  // Open confirmation dialog
  const handleActionClick = (volunteerData) => {
    setSelectedVolunteer(volunteerData);
    setIsDialogOpen(true);
  };

  // Confirm activation/deactivation
  const confirmToggleConfirmation = () => {
    if (selectedVolunteer) {
      handleToggleConfirmation(selectedVolunteer);
    }
  };

  // Handle opening the create volunteer modal
  const handleOpenCreateModal = () => {
    reset(); // Reset the form fields
    setCreateError(null);
    setIsCreateModalOpen(true);
  };

  // Handle closing the create volunteer modal
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  // Handle creating a new volunteer
  const handleCreateVolunteer = async (formData) => {
    setCreateLoading(true);
    setCreateError(null);
    try {
      const { firstName, lastName, email, password, contactNumber } = formData;

      // Call the signUp function to create a new volunteer
      const { data: user, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        throw signUpError;
      }

      const { error: insertError } = await supabase.from("user_list").insert([
        {
          user_uuid: user.user.id,
          user_name: firstName,
          user_last_name: lastName,
          user_role: "volunteer", // Set role to "volunteer"
          user_email: email,
          user_contact: contactNumber,
          is_confirmed: false,
        },
      ]);

      if (insertError) {
        throw insertError;
      }

      // Refresh the data to include the new volunteer
      fetchData();

      // Close the modal
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating volunteer:", error);
      setCreateError(
        error.message || "Failed to create volunteer. Please try again.",
      );
    } finally {
      setCreateLoading(false);
    }
  };

  // Define table rows
  const rows = data.map((item, index) => {
    const isConfirmed = item.is_confirmed;
    return [
      index + 1 + (currentPage - 1) * itemsPerPage,
      item.user_email,
      item.user_name,
      item.user_last_name,
      item.user_contact,
      isConfirmed ? (
        <span className="font-bold text-green-600">Yes</span>
      ) : (
        <span className="text-red-600">No</span>
      ),
      <Button
        key={item.user_uuid}
        onClick={() => handleActionClick(item)}
        variant={isConfirmed ? "destructive" : "primary"}
        disabled={loading}
        className={isConfirmed ? "cursor-not-allowed opacity-50" : ""}
      >
        {isConfirmed ? "Confirmed" : "Approve Account"}
      </Button>,
    ];
  });

  return (
    <RequestPage>
      {/* Filter and Generate Volunteer Account Button */}
      <div className="mb-4 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        {/* Filter Dropdown */}
        <div className="relative inline-block text-left">
          <Button
            variant="default"
            className="flex w-56 items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
          >
            {filter === "all" && "All Volunteers"}
            {filter === "confirmed" && "Confirmed Volunteers"}
            {filter === "not_confirmed" && "Not Confirmed Volunteers"}
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

          {/* Conditionally render the dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute left-0 z-10 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div
                className="py-1"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="options-menu"
              >
                {["all", "confirmed", "not_confirmed"].map((option) => (
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
                      ? "All Volunteers"
                      : option === "confirmed"
                        ? "Confirmed Volunteers"
                        : "Not Confirmed Volunteers"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Generate Volunteer Account Button */}
        <div>
          <Button onClick={handleOpenCreateModal}>Create Account</Button>
        </div>
      </div>

      {/* Volunteers Table */}
      <div className="mt-4 rounded-lg bg-card shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading volunteers...</p>
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
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No volunteers found.</p>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {isDialogOpen && selectedVolunteer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-lg font-bold">
              {selectedVolunteer.is_confirmed ? "Deactivate" : "Confirm"}{" "}
              Volunteer
            </h2>
            <p className="mt-2">
              Are you sure you want to{" "}
              {selectedVolunteer.is_confirmed ? "deactivate" : "approve"} the
              volunteer{" "}
              <strong>
                {selectedVolunteer.user_name} {selectedVolunteer.user_last_name}
              </strong>
              ?
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="destructive"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={confirmToggleConfirmation}>
                {selectedVolunteer.is_confirmed ? "Deactivate" : "Approve"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Volunteer Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-lg font-bold">Generate Volunteer Account</h2>
            <form
              onSubmit={handleSubmit(handleCreateVolunteer)}
              className="mt-4 space-y-4"
            >
              {/* First Name Field */}
              <div>
                <Label htmlFor="first-name" className="text-sm font-medium">
                  First Name
                </Label>
                <Input
                  id="first-name"
                  type="text"
                  placeholder="Enter volunteer's first name"
                  {...register("firstName", {
                    required: "First name is required",
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name Field */}
              <div>
                <Label htmlFor="last-name" className="text-sm font-medium">
                  Last Name
                </Label>
                <Input
                  id="last-name"
                  type="text"
                  placeholder="Enter volunteer's last name"
                  {...register("lastName", {
                    required: "Last name is required",
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter volunteer's email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type={visiblePassword ? "text" : "password"}
                  placeholder="Enter a password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
                <div className="mt-1 flex items-center">
                  <input
                    type="checkbox"
                    id="show-password"
                    onChange={() => setVisiblePassword((prev) => !prev)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="show-password" className="ml-2 text-sm">
                    Show password
                  </Label>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Contact Number Field */}
              <div>
                <Label htmlFor="contact-number" className="text-sm font-medium">
                  Contact Number
                </Label>
                <Input
                  id="contact-number"
                  type="text"
                  placeholder="Enter volunteer's contact number"
                  {...register("contactNumber", {
                    required: "Contact number is required",
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Contact number must contain only digits",
                    },
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
                {errors.contactNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.contactNumber.message}
                  </p>
                )}
              </div>

              {/* Display create error if any */}
              {createError && (
                <p className="text-sm text-red-600">{createError}</p>
              )}

              {/* Submit and Cancel Buttons */}
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleCloseCreateModal}
                  disabled={createLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={createLoading}
                  className="bg-blue-600 font-semibold text-white hover:bg-blue-700"
                >
                  {createLoading ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </RequestPage>
  );
}
