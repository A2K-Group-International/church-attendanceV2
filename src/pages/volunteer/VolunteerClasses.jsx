import { useState } from "react";
import VolunteerSidebar from "@/components/volunteer/VolunteerSidebar";
import { Button } from "@/shadcn/button";
import { useForm } from "react-hook-form";

import Title from "@/components/Title";
import ClassesTable from "@/components/ClassesTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/shadcn/dialog";
import { Separator } from "@/shadcn/separator";
import { Label } from "@/shadcn/label";
import { Input } from "@/shadcn/input";
import supabase from "@/api/supabase";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/shadcn/use-toast";

export default function VolunteerClasses() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const { toast } = useToast();

  const fetchClass =  async () => {
    const { data: error } = await supabase
      .from("volunteer_classes")
      .select("*")

    console.log("Supabase response:",  error);
    if (error) throw new Error(error.message || "Unknown error occurred");
  } 

  const { data } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchClass
  })

  const mutation = useMutation({
    mutationFn: async (data) => {
      const { data: error } = await supabase
        .from("volunteer_classes")
        .insert([{ class_name: data.classname }]);
  
      console.log("Supabase response:", error); 
      if (error) throw new Error(error.message || "Unknown error occurred");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Class added.",
      });
      setIsDialogOpen(false);
      reset();
    },
    onError: (error) => {
      console.error("Mutation error:", error); // Ensure that the actual error is being logged
      toast({
        title: "Something went wrong",
        description: `${error.message}`, // Use error.message to avoid logging blank objects
      });
    },
  });
  

  const createClass = (data) => {
    console.log(data); 
    mutation.mutate(data);
  };

  console.log(data)

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
                  <Input
                    {...register("classname", {
                      required: "Class name is required",
                    })}
                    placeholder="Bible Study"
                    className="mt-1"
                    id="classname"
                  />
                </div>
              </div>
              <DialogFooter className="mx-2 flex gap-2 sm:justify-between">
                <Button
                  onClick={() => setIsDialogOpen(false)}
                  variant="destructive"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit(createClass)}
                  disabled={mutation.isLoading}
                >
                  {mutation.isLoading ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <ClassesTable />
      </main>
    </VolunteerSidebar>
  );
}
