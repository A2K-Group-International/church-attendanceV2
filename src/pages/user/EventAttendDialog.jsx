import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Label } from "../../shadcn/label";
import { Button } from "../../shadcn/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shadcn/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../../shadcn/dialog";
import supabase from "../../api/supabase";
import { useUser } from "../../authentication/useUser";

export default function EventAttendDialog({ open, onClose, eventData }) {
  const user = useUser(); // Retrieve user data from the custom hook
  const queryClient = useQueryClient();

  const [familyMembers, setFamilyMembers] = useState([]); // State to hold family members
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]); // Store selected members as objects
  const [error, setError] = useState(""); // State to hold error messages
  const [successMessage, setSuccessMessage] = useState(""); // State to hold success messages
  const [guardianData, setGuardianData] = useState("");

  useEffect(() => {
    if (open) {
      fetchFamilyMembers(); // Fetch family members when the dialog opens
    }
  }, [open]);

  const fetchFamilyMembers = async () => {
    if (!user || !user.user || !user.user.id) {
      console.error("User data not available");
      return;
    }

    try {
      // Fetch user data based on user UUID
      const { data: userData, error } = await supabase
        .from("user_list")
        .select("*")
        .eq("user_uuid", user.user.id)
        .single();

      if (error || !userData) {
        console.error("Error fetching user data:", error);
        return;
      }
      setGuardianData(userData);

      // Use the fetched user data to get family members based on guardian ID
      const { data, error: fetchError } = await supabase
        .from("family_list")
        .select("*")
        .eq("guardian_id", userData.user_id); // Using userData.user_id as guardian ID

      if (fetchError) throw fetchError;

      if (!data || data.length === 0) {
        console.warn(
          "No family members found for this guardian ID:",
          userData.user_id,
        );
      }
      setFamilyMembers(data);
    } catch (error) {
      console.error("Error fetching family members:", error);
    }
  };

  const handleTimeChange = (value) => {
    setSelectedTime(value);
    setError(""); // Clear error when the time is selected
  };

  const handleMemberChange = (member) => {
    setSelectedMembers((prev) => {
      // Check if the member is already selected
      const isSelected = prev.some(
        (m) => m.family_member_id === member.family_member_id,
      );
      if (isSelected) {
        // Remove member if already selected
        return prev.filter(
          (m) => m.family_member_id !== member.family_member_id,
        );
      } else {
        // Add member if not selected
        return [...prev, member];
      }
    });
    setError(""); // Clear error when a member is selected
  };

  const handleSubmit = async () => {
    // Check if a time is selected
    if (!selectedTime) {
      setError("Please select a time.");
      return;
    }

    // Check if at least one family member is selected
    if (selectedMembers.length === 0) {
      setError("Please select at least one family member.");
      return;
    }

    try {
      // Loop through each selected family member and insert data
      for (const member of selectedMembers) {
        const { data, error } = await supabase
          .from("attendance_pending")
          .insert({
            guardian_first_name:
              member.guardian === false ? guardianData.user_name : "N/A",
            guardian_last_name: member.guardian === false ? null : "N/A",
            guardian_telephone:
              member.guardian === false ? guardianData.user_contact : "N/A",
            children_first_name: member.family_first_name,
            children_last_name: member.family_last_name,
            has_attended: false, // Default attendance status
            preferred_time: selectedTime,
            schedule_day: eventData.schedule_day, // Example: assuming schedule_day is part of eventData
            attendance_type: null, // Modify if needed
            attendance_code: eventData.attendance_code, // Assuming eventData has this field
            children_age: member.family_age, // Assuming family member has an age field
            selected_event: eventData.name, // Event name from eventData
            schedule_id: eventData.schedule_id, // Assuming eventData has a schedule ID field
          });

        if (error) {
          throw error;
        }
      }

      // Refresh query cache or trigger any further action as needed
      queryClient.invalidateQueries(["attendance_pending"]);

      // Show success message and clear previous errors
      setSuccessMessage("Attendance successfully submitted!");
      setError("");

      // Automatically close the dialog after 2 seconds
      setTimeout(() => {
        onClose(); // Close the dialog after successful submission
        setSuccessMessage(""); // Clear success message after closing
      }, 2000);
    } catch (error) {
      console.error("Error submitting attendance data:", error);
      setError("An error occurred while submitting attendance data.");
    }
  };

  // Function to format time to 9:00 AM/PM
  const formatTime = (time) => {
    const [hours, minutes] = time.split("+")[0].split(":");
    const hours12 = hours % 12 || 12; // Convert to 12-hour format
    const ampm = hours < 12 ? "AM" : "PM"; // Determine AM/PM
    return `${hours12}:${minutes.padStart(2, "0")} ${ampm}`; // Return formatted time
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-6 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Register for {eventData.name}
          </DialogTitle>
        </DialogHeader>

        <Label>Select Time</Label>
        <Select value={selectedTime} onValueChange={handleTimeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a time" />
          </SelectTrigger>
          <SelectContent>
            {eventData.time.map((time, index) => (
              <SelectItem key={index} value={time}>
                {formatTime(time)} {/* Display formatted time */}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <p className="mt-4 text-sm text-gray-600">
          Please select the family members who will attend the event:
        </p>

        <div className="mt-4 space-y-4">
          {familyMembers.map((member) => (
            <div key={member.family_member_id} className="flex items-center">
              <input
                type="checkbox"
                id={`member-${member.family_member_id}`}
                checked={selectedMembers.some(
                  (m) => m.family_member_id === member.family_member_id,
                )}
                onChange={() => handleMemberChange(member)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor={`member-${member.family_member_id}`}
                className="ml-2 text-sm"
              >
                {member.family_first_name} {member.family_last_name}
              </label>
            </div>
          ))}
        </div>

        {error && <p className="mt-4 text-red-600">{error}</p>}
        {successMessage && (
          <p className="mt-4 text-green-600">{successMessage}</p>
        )}

        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} className="ml-2">
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
