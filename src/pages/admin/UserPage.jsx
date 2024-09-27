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

const headers = ["#", "Email", "Name", "Confirmed", "Action"];

export default function UsersPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const itemsPerPage = 7;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = supabase
        .from("user_list")
        .select("*", { count: "exact" })
        .range(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage - 1,
        );

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
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchData();
  }, [currentPage, fetchData]);

  const handleApproveAccount = async (userData) => {
    try {
      const { error } = await supabase
        .from("user_list")
        .update({ is_confirmed: true })
        .eq("user_id", userData.user_id);

      if (error) throw error;

      fetchData(); // Refresh the data after updating
    } catch (error) {
      console.error("Error approving account:", error);
    } finally {
      console.log("user approved");
      setIsDialogOpen(false);
    }
  };

  const handleApproveClick = (userData) => {
    setSelectedUser(userData);
    setIsDialogOpen(true);
  };

  const confirmApprove = () => {
    if (selectedUser) {
      handleApproveAccount(selectedUser);
    }
  };

  const getRowClassName = (isConfirmed) => {
    return isConfirmed ? "bg-green-100" : "bg-red-100";
  };

  const rows = data.map((item, index) => {
    const isConfirmed = item.is_confirmed;
    return [
      index + 1 + (currentPage - 1) * itemsPerPage,
      item.user_email,
      item.user_name,
      isConfirmed ? (
        <span className="font-bold text-green-600">Yes</span> // Emphasized for confirmed users
      ) : (
        <span className="text-red-600">No</span> // Highlighted for non-confirmed users
      ),
      <Button
        key={item.user_uuid}
        onClick={() => handleApproveClick(item)}
        variant="primary"
        disabled={isConfirmed}
        className={isConfirmed ? "cursor-not-allowed opacity-50" : ""} // Style for confirmed users
      >
        {isConfirmed ? "Confirmed" : "Approve Account"}
      </Button>,
    ];
  });

  return (
    <AdminSidebar>
      <main className="mx-auto max-w-7xl p-4 lg:p-8">
        <h1 className="text-2xl font-bold">Users</h1>
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
              <p className="text-muted-foreground">No users found.</p>
            </div>
          )}
        </div>
      </main>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-lg font-bold">Approve Account</h2>
            <p className="mt-2">
              Are you sure you want to approve the account for{" "}
              <strong>{selectedUser?.user_name}</strong>?
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => setIsDialogOpen(false)}
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
    </AdminSidebar>
  );
}
