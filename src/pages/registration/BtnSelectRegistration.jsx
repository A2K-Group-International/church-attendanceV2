import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../shadcn/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shadcn/select";
import { Button } from "../../shadcn/button";
import DialogWalkInRegister from "./DialogWalkInRegister";

export default function BtnSelectRegistration() {
  const [activeTab, setActiveTab] = useState(""); // State to hold the selected value

  // Function to handle form submission (optional, based on your requirements)
  const handleSubmit = () => {
    console.log(activeTab);
    setActiveTab(activeTab); // For testing purposes

    // Perform further actions based on the activeTab value
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Walk-In Register</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Please select the type of Registration</DialogTitle>
            <DialogDescription className="sr-only">
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DialogDescription>

            {/* Select component to choose the type of registration */}
            <Select
              onValueChange={(value) => setActiveTab(value)} // Update the activeTab when a value is selected
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="children">Children</SelectItem>
                <SelectItem value="colleague">Friends/Colleague</SelectItem>
              </SelectContent>
            </Select>
          </DialogHeader>

          <Button onClick={handleSubmit}>Submit</Button>
        </DialogContent>
      </Dialog>

      {activeTab === "children" && <DialogWalkInRegister />}
    </>
  );
}
