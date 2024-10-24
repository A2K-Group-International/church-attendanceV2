import { useState, useEffect, useCallback } from "react";
import supabase from "../../api/supabase";
// Remove the sidebar import
// import UserSidebar from "../../components/user/UserSidebar";
import Table from "../../components/Table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../shadcn/pagination";
import { Button } from "../../shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "../../shadcn/dialog";
import { Input } from "../../shadcn/input";
import { Label } from "../../shadcn/label";
import { useUser } from "../../authentication/useUser";

const headers = ["#", "First Name", "Last Name", "Contact", "Type", "Actions"];

export default function FamilyPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 7;
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [editMemberDialogOpen, setEditMemberDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contact, setContact] = useState("");
  const [type, setType] = useState("Adult");
  const [userData, setUserData] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  const { user } = useUser();

  const fetchUserData = useCallback(async () => {
    try {
      const { data: fetchedUserData, error: userError } = await supabase
        .from("user_list")
        .select("user_id")
        .eq("user_uuid", user.id)
        .single();

      if (userError) throw userError;
      setUserData(fetchedUserData);
    } catch (error) {
      setError("Error fetching user data. Please try again.");
      console.error("Error in fetchUserData function:", error);
    }
  }, [user]);

  const fetchData = useCallback(async () => {
    if (!userData) return;
    setLoading(true);
    setError(null);
    try {
      const {
        data: fetchedData,
        error: familyError,
        count,
      } = await supabase
        .from("family_list")
        .select("*", { count: "exact" })
        .eq("guardian_id", userData.user_id)
        .range(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage - 1,
        );

      if (familyError) throw familyError;

      setTotalPages(Math.ceil(count / itemsPerPage));
      setData(fetchedData);
    } catch (error) {
      setError("Error fetching family data. Please try again.");
      console.error("Error in fetchData function:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, userData]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    fetchData();
  }, [currentPage, fetchData]);

  const rows = data.map((item, index) => [
    index + 1 + (currentPage - 1) * itemsPerPage,
    item.family_first_name,
    item.family_last_name,
    item.family_contact,
    item.family_type,
    <>
      <Button onClick={() => handleEditMember(item)}>Edit</Button>
      <Button
        variant="destructive"
        onClick={() => handleDeleteMember(item.family_member_id)}
      >
        Delete
      </Button>
    </>,
  ]);

  const handleAddFamilyMember = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("family_list").insert([
        {
          family_first_name: firstName,
          family_last_name: lastName,
          family_contact: contact,
          family_type: type,
          guardian_id: userData.user_id,
        },
      ]);
      if (error) throw error;
      setAddMemberDialogOpen(false);
      setFirstName("");
      setLastName("");
      setContact("");
      setType("Adult");

      setSuccessMessage("Family member added successfully!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      fetchData();
    } catch (error) {
      setError("Error adding family member. Please try again.");
      console.error("Error in adding family member:", error);
    }
  };

  const handleEditMember = (member) => {
    setSelectedMember(member);
    setFirstName(member.family_first_name);
    setLastName(member.family_last_name);
    setContact(member.family_contact);
    setType(member.family_type);
    setEditMemberDialogOpen(true);
  };

  const handleUpdateFamilyMember = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("family_list")
        .update({
          family_first_name: firstName,
          family_last_name: lastName,
          family_contact: contact,
          family_type: type,
        })
        .eq("family_member_id", selectedMember.family_member_id);

      if (error) throw error;
      setEditMemberDialogOpen(false);
      setSuccessMessage("Family member updated successfully!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      fetchData();
    } catch (error) {
      setError("Error updating family member. Please try again.");
      console.error("Error in updating family member:", error);
    }
  };

  const handleDeleteMember = (memberId) => {
    setMemberToDelete(memberId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteFamilyMember = async () => {
    try {
      const { error } = await supabase
        .from("family_list")
        .delete()
        .eq("family_member_id", memberToDelete);
      if (error) throw error;

      setDeleteDialogOpen(false);
      fetchData(); // Refresh the data after deletion
    } catch (error) {
      setError("Error deleting family member. Please try again.");
      console.error("Error in deleting family member:", error);
    }
  };

  return (
    <main className="mx-auto max-w-7xl p-4 lg:p-8">
      <h1 className="text-2xl font-bold">Family Information</h1>
      {successMessage && (
        <div className="mb-4 rounded-md bg-green-100 p-4 text-green-600">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-md bg-red-100 p-4 text-red-600">
          {error}
        </div>
      )}
      <div className="mb-4 mt-4">
        <Dialog
          open={addMemberDialogOpen}
          onOpenChange={setAddMemberDialogOpen}
        >
          <DialogTrigger asChild>
            <Button variant="primary" className="w-full">
              Add Family Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Family Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddFamilyMember} className="space-y-4">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact" className="text-sm font-medium">
                  Contact
                </Label>
                <Input
                  id="contact"
                  type="tel"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="type" className="text-sm font-medium">
                  Type
                </Label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="Adult">Adult</option>
                  <option value="Child">Child</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => setAddMemberDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" variant="primary">
                  Add
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Table headers={headers} rows={rows} loading={loading} />
      <Pagination>
        <PaginationPrevious
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        >
          Previous
        </PaginationPrevious>
        <PaginationContent>
          {Array.from({ length: totalPages }, (_, index) => (
            <PaginationItem key={index + 1}>
              <PaginationLink
                onClick={() => setCurrentPage(index + 1)}
                isCurrent={currentPage === index + 1}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
        </PaginationContent>
        <PaginationNext
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
        >
          Next
        </PaginationNext>
      </Pagination>
      <Dialog
        open={editMemberDialogOpen}
        onOpenChange={setEditMemberDialogOpen}
      >
        <DialogTrigger asChild>
          <Button variant="primary">Edit Member</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Family Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateFamilyMember} className="space-y-4">
            <div>
              <Label htmlFor="firstName" className="text-sm font-medium">
                First Name
              </Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-sm font-medium">
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="contact" className="text-sm font-medium">
                Contact
              </Label>
              <Input
                id="contact"
                type="tel"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="type" className="text-sm font-medium">
                Type
              </Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="Adult">Adult</option>
                <option value="Child">Child</option>
                <option value="Senior">Senior</option>
              </select>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setEditMemberDialogOpen(false)}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" variant="primary">
                Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Family Member</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this family member?</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="secondary"
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteFamilyMember}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
