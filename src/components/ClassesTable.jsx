import Kebab from "../../src/assets/svg/threeDots.svg";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/popover";
import { Link } from "react-router-dom";
import people from "@/assets/svg/people.svg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/shadcn/dialog";
import { useState } from "react";
import { Separator } from "@/shadcn/separator";
import { Label } from "@/shadcn/label";
import { Input } from "@/shadcn/input";
import { Button } from "@/shadcn/button";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import supabase from "@/api/supabase";
import { useToast } from "@/shadcn/use-toast";

export default function ClassesTable({ classes, handleCopy, deleteClass }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { register, handleSubmit } = useForm();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateClass = async ({ input, id }) => {
    console.log("these are the data", input, id);
    const { error } = await supabase
      .from("volunteer_classes")
      .update({ class_name: input.classname })
      .eq("id", id);

    console.log("Supabase response:", error);
    if (error) throw new Error(error.message || "Unknown error occurred");
  };
  const updateMutateClass = (input, id) => {
    console.log(input, id);
    updateMutation.mutate({ input, id });
  };
  const updateMutation = useMutation({
    mutationFn: updateClass,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Class Updated.",
      });
      setIsDialogOpen(false);
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
  // const getTotalParticipants = async () => {
  //   const [totalParentsResponse, totalChildrenResponse] = await Promise.all([
  //     supabase
  //       .from("participant_parents")
  //       .select("*", { count: "exact" }),
  //     supabase
  //       .from("participant_children")
  //       .select("*", { count: "exact" }),
  //   ]);

  //   if (totalParentsResponse.error) throw new Error(totalParentsResponse.error.message);
  //   if (totalChildrenResponse.error) throw new Error(totalChildrenResponse.error.message);

  //   const total =
  //     (totalParentsResponse.count || 0) + (totalChildrenResponse.count || 0);
  //   return total;
  // };



  // const { data: totalParticipants } = useQuery({
  //   queryKey: ["totalParticipants"],
  //   queryFn: getTotalParticipants,
  // });

  // console.log("total",totalParticipants)
  return (
    <div className="flex flex-col gap-3">
      {classes?.map((classdata, id) => (
        <div
          key={id}
          className="flex items-center justify-between rounded-md p-4 shadow-md"
        >
          <Link
            to={`/volunteer-classes/${classdata.id}`}
            className="hover:cursor-pointer"
          >
            {classdata.class_name}
          </Link>
          <div className="flex min-w-60 justify-evenly gap-4">
            <div className="flex w-11 items-center justify-between">
              <p>{classdata.class_total_students}</p>
              <img src={people} alt="people icon" className="h-4 w-4" />
            </div>
            <p>
              {new Date(classdata.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            <Popover>
              <PopoverTrigger>
                <img
                  src={Kebab}
                  alt="Icon"
                  className={clsx("h-6 w-6", {
                    invisible: classdata.status === "joined",
                  })}
                />
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className={clsx("w-32 p-0", {
                  invisible: classdata.status === "joined",
                })}
              >
                <div
                  onClick={() => handleCopy(classdata.class_code)}
                  className={clsx("p-3 text-start hover:cursor-pointer", {
                    invisible: classdata.status === "joined",
                  })}
                >
                  Copy Code
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger>
                    <div className="p-3 text-start hover:cursor-pointer">
                      Edit
                    </div>
                  </DialogTrigger>
                  <DialogContent className="rounded-md">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">
                        Create Class
                      </DialogTitle>
                      <Separator />
                    </DialogHeader>
                    <div>
                      <form
                        onSubmit={handleSubmit((data) =>
                          updateMutateClass(data, classdata.id),
                        )}
                        id="myform"
                      >
                        <Label htmlFor="classname">Class Name</Label>
                        <Input
                          {...register("classname", {
                            required: "Class name is required",
                          })}
                          defaultValue={classdata.class_name}
                          placeholder="Bible Study"
                          className="mt-1"
                          id="classname"
                        />
                      </form>
                    </div>
                    <DialogFooter className="mx-2 flex gap-2 sm:justify-between">
                      <Button
                        onClick={() => setIsDialogOpen(false)}
                        variant="destructive"
                      >
                        Cancel
                      </Button>
                      <Button
                        form="myform"
                        type="submit"
                        // onClick={handleSubmit(updateClass, classdata.id)}
                        // disabled={mutation.isLoading}
                      >
                        {/* {mutation.isLoading ? "Saving..." : "Save"} */}
                        Save
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <div
                  onClick={() => deleteClass(classdata.id)}
                  className="p-3 text-start text-red-500 hover:cursor-pointer"
                >
                  Delete
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      ))}
    </div>
  );
}
