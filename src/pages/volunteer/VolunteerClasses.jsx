import { useEffect, useState } from "react";
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
import {
  QueryClientContext,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useToast } from "@/shadcn/use-toast";
import useUserData from "@/api/useUserData";

export default function VolunteerClasses() {
  const { userData } = useUserData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const { register, handleSubmit, reset:resetAddClass } = useForm();
  const {
    register: registerJoinClass,
    handleSubmit: submitJoinClass,
    reset: resetJoinClass,
  } = useForm();
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const getClasses = async () => {
    const { data: ownedClasses, error: ownedError } = await supabase
      .from("volunteer_classes")
      .select("*")
      .eq("user_id", userData.user_id);

    if (ownedError)
      throw new Error(ownedError.message || "Error fetching owned classes");

    // Fetch joined volunteer classes with their details
    const { data: joinedClasses, error: joinedError } = await supabase
      .from("volunteer_joined_classes")
      .select("class_id, volunteer_classes(*)")
      .eq("user_id", userData.user_id);

    if (joinedError)
      throw new Error(joinedError.message || "Error fetching joined classes");

    // console.log("joined classes",joinedClasses)
    const combinedClasses = [
      ...ownedClasses.map((classItem) => ({ ...classItem, status: "owned" })),
      ...joinedClasses.map((joinedItem) => ({
        ...joinedItem.volunteer_classes,
        status: "joined",
      })),
    ];

    // console.log("Combined Classes:", combinedClasses);
    return combinedClasses;
  };

  const addClass = async (input) => {
    if (!userData) {
      throw new Error("Authentication required");
    }
    const { error, data } = await supabase
      .from("volunteer_classes")
      .insert([{ class_name: input.classname, user_id: userData?.user_id }]).select("id").single();

    console.log("Supabase response:", error);
    if (error) throw new Error(error.message || "Unknown error occurred");

    // let joinError;
    // console.log("data being returned",data.id)
    // switch (userData?.user_role) {
    //   case "volunteer":
    //     const volunteerResponse = await supabase
    //       .from("participant_volunteers")
    //       .insert([
    //         {
    //           name: `${userData?.user_name} ${userData?.user_last_name}`,
    //           class_id: data.id,
    //         },
    //       ]);

    //       joinError = volunteerResponse.error;
    //     break;

    //   case "parent":
    //     const parentResponse = await supabase
    //       .from("participant_parents")
    //       .insert([
    //         {
    //           name: `${userData?.user_name} ${userData?.user_last_name}`,
    //           class_id: data.id,
    //         },
    //       ]);

    //       joinError = parentResponse.error;
    //     break;

    //   case "child":
    //     const childResponse = await supabase
    //       .from("participant_children")
    //       .insert([
    //         {
    //           name: `${userData?.user_name} ${userData?.user_last_name}`,
    //           class_id: data.id,
    //         },
    //       ]);

    //       joinError = childResponse.error;
    //     break;
    // }

    // if (joinError)
    //   throw new Error(joinError.message || "Unknown error occurred");
  };


  const deleteClass = async (id) => {
    const { error } = await supabase
      .from("volunteer_classes")
      .delete()
      .eq("id", id);

    console.log("Supabase response:", error);
    if (error) throw new Error(error.message || "Unknown error occurred");
    // return(data.class_name)
  };

  const joinClassAction = async (input) => {
    let error;

    if (!userData) {
      throw new Error("You must be authenticated!");
    }

    const { data: classData, error: classError } = await supabase
      .from("volunteer_classes")
      .select("*")
      .eq("class_code", input.classCode)
      .single();

    if (classError || !classData) {
      throw new Error("Class not found");
    }

    const classId = classData.id; // Extract the ID

    switch (userData?.user_role) {
      case "volunteer":
        const volunteerResponse = await supabase
          .from("participant_volunteers")
          .insert([{ name: `${userData?.user_name} ${userData?.user_last_name}`, class_id: classId }]);

        error = volunteerResponse.error;
        break;

      case "parent":
        const parentResponse = await supabase
          .from("participant_parents")
          .insert([{ name: `${userData?.user_name} ${userData?.user_last_name}`, class_id: classId }]);

        error = parentResponse.error;
        break;

      case "child":
        const childResponse = await supabase
          .from("participant_children")
          .insert([{ name: `${userData?.user_name} ${userData?.user_last_name}`, class_id: classId }]);

        error = childResponse.error;
        break;
    }

    const { error: insertJoinError } = await supabase
      .from("volunteer_joined_classes")
      .insert([{ user_id: userData.user_id, class_id: classId }]);
    if (insertJoinError)
      throw new Error(insertJoinError.message || "Unknown error occurred");

    const { error: addError } = await supabase
    .from("volunteer_classes")
    .update({ class_total_students: classData.class_total_students + 1 })
    .eq("id", classId); // Replace classId with the actual class ID you want to update
  
  if (addError) {
    throw new Error(addError.message || "Error updating total count");
  }
    if (error) throw new Error(error.message || "Unknown error occurred");
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["classes"],
    queryFn: getClasses,
  });

  const mutation = useMutation({
    mutationFn: addClass,
    onSuccess: () => {
      resetAddClass
      toast({
        title: "Success",
        description: "Class added.",
      });
     
      setIsDialogOpen(false);
    
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Something went wrong",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
 
    },
  });
  const joinClassMutation = useMutation({
    mutationFn: joinClassAction,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Class Joined",
      });
      resetJoinClass();
      setIsJoinDialogOpen(false);
    },

    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Something went wrong",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });



  const deleteMutation = useMutation({
    mutationFn: deleteClass,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Class Deleted",
      });
      // reset();
      // setIsDialogOpen(false);
    },

    onError: (error) => {
      console.error("Mutation error:", error); // Ensure that the actual error is being logged
      toast({
        title: "Something went wrong",
        description: `${error.message}`, // Use error.message to avoid logging blank objects
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });

  // const deleteMutation = useMutation({
  //   mutationFn:
  // })

  const handleCopy = (code) => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset the copied state after 2 seconds
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  useEffect(() => {
    if (isCopied) {
      toast({
        title: "Success!",
        description: "Code has been copied",
      });
    }
  }, [isCopied, toast]);

  const createClass = (input) => {
    console.log("input being clicked hello", input);
    mutation.mutate(input);
  };
  const joinClass = (input) => {
    console.log("joining", input.classCode);
    joinClassMutation.mutate(input);
  };


  const deleteMutateClass = (id) => {
    deleteMutation.mutate(id);
  };

  // if (error) return <div>Error loading classes: {error.message}</div>;
  console.log("data i am getting", data);

  return (
    <VolunteerSidebar>
      <main className="h-screen overflow-y-scroll p-8">
        <div className="mb-4 flex justify-between">
          <Title>Your Classes</Title>
          <div className="flex gap-2">
            <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
              <DialogTrigger>
                <Button onClick={() => setIsJoinDialogOpen(true)}>
                  Join Class
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Join Class</DialogTitle>
                  <Separator />
                </DialogHeader>
                <div>
                  <div>
                    <Label htmlFor="classCode">Class Code</Label>
                    <Input
                      {...registerJoinClass("classCode", {
                        required: "Class code is required",
                      })}
                      placeholder="Place your class code here"
                      className="mt-1"
                      id="classcode"
                    />
                  </div>
                </div>
                <DialogFooter className="mx-2 flex gap-2 sm:justify-between">
                  <Button
                    onClick={() => setIsJoinDialogOpen(false)}
                    variant="destructive"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={submitJoinClass(joinClass)}
                    // form="joinForm"
                    // type="submit"
                    disabled={mutation.isLoading}
                  >
                    {mutation.isLoading ? "Joining..." : "Join Class"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                      // id="classname"
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
                    type="submit"
                    form="addClassForm"
                    onClick={handleSubmit(createClass)}
                    disabled={mutation.isLoading}
                  >
                    {mutation.isLoading ? "Adding..." : "Add"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <p>loading...</p>
        ) : (
          <ClassesTable
            classes={data}
            // updateClass={updateMutateClass}
            deleteClass={deleteMutateClass}
            handleCopy={handleCopy}
          />
        )}
      </main>
    </VolunteerSidebar>
  );
}
