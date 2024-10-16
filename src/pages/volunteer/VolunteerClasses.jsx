import React, { useState } from "react";
import VolunteerSidebar from "@/components/volunteer/VolunteerSidebar";
import { Button } from "@/shadcn/button";
import Title from "@/components/Title";
import ClassesTable from "@/components/ClassesTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/shadcn/dialog";
import { Separator } from "@/shadcn/separator";
import { Label } from "@/shadcn/label";
import { Input } from "@/shadcn/input";


export default function VolunteerClasses() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const createClass = () => {
    setIsDialogOpen(false);
  };
  return (
    <VolunteerSidebar>
      <main className="h-screen overflow-y-scroll rounded-md p-8 shadow-md">
        <div className="mb-4 flex flex-grow justify-between">
          <Title>Your Classes</Title>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger>
              <Button onClick={() => setIsDialogOpen(true)}>Add Class</Button>
            </DialogTrigger>
            <DialogContent className="rounded-md">
              <DialogHeader>
                <DialogTitle className="text-2xl">Create Class</DialogTitle>
                <Separator />
              </DialogHeader>
              <div>
                <div>
                  <Label htmlFor="classname">Class Name</Label>
                  <Input placeholder="Bible Study" className="mt-1" name="classname" id="classname" />
                </div>
              </div>
              <DialogFooter className="flex gap-2 sm:justify-between mx-2">
                <Button
                  onClick={() => setIsDialogOpen(false)}
                  variant="destructive"
                >
                  Cancel
                </Button>
                <Button onClick={createClass}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {/* <ClassesTable/> */}
  
        <ClassesTable />
      </main>
    </VolunteerSidebar>
  );
}
