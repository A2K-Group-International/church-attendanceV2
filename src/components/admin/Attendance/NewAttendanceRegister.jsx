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
import FamilyRegistrationForm from "./FamilyRegistrationForm";

export default function NewAttendanceRegister({ BtnName }) {
  const [tab, setTab] = useState("");
  const [showSingleForm, setShowSingleForm] = useState(false);
  const [showFamilyForm, setShowFamilyForm] = useState(false);
  const [showColleagueForm, setShowColleagueForm] = useState(false);

  const handleSubmit = () => {
    if (tab === "single") {
      setShowSingleForm(true);
    } else if (tab === "family") {
      setShowFamilyForm(true);
    } else if (tab === "colleague") {
      setShowColleagueForm(true);
    }
  };

  const resetForm = () => {
    setTab("");
    setShowSingleForm(false);
    setShowFamilyForm(false);
    setShowColleagueForm(false);
  };

  return (
    <Modal onOpenChange={resetForm} BtnName={BtnName}>
      {!showSingleForm && !showFamilyForm && !showColleagueForm && (
        <>
          <h2>Please select the type of attendee</h2>
          <Select onValueChange={(value) => setTab(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="colleague">Colleague/Friend</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-end">
            <Button onClick={handleSubmit}>Next</Button>
          </div>
        </>
      )}
      {showSingleForm && <SingleRegistrationForm />}
      {showFamilyForm && (
        <FamilyRegistrationForm
          label="Parent/Carer"
          attendees="Children"
          btnAdd="Add"
        />
      )}
      {showColleagueForm && (
        <FamilyRegistrationForm
          label="Main Applicant"
          attendees="Friend/Colleague"
          btnAdd="Add"
        />
      )}
    </Modal>
  );
}
