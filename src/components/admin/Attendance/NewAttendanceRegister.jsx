import { useState } from "react";
import Modal from "../../Modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shadcn/select";
import { Button } from "@/shadcn/button";
import SingleRegistrationForm from "./SingleRegistrationForm";

export default function NewAttendanceRegister() {
  const [tab, setTab] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = () => {
    if (tab === "single") {
      setShowForm(true);
    } else {
      setShowForm(false);
    }
  };

  const resetForm = () => {
    setTab("");
    setShowForm(false);
  };

  return (
    <Modal onOpenChange={resetForm} BtnName="Add" ModalTitle="Add New Attendee">
      <h2>Please select the type of attendee</h2>
      <Select onValueChange={(value) => setTab(value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="single">Single</SelectItem>
          <SelectItem value="familyk">Family</SelectItem>
          <SelectItem value="colleague">Colleague/Friend</SelectItem>
        </SelectContent>
      </Select>
      {!showForm && (
        <div className="text-end">
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      )}
      {showForm && <SingleRegistrationForm />}
    </Modal>
  );
}
