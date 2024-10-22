import { Separator } from "@/shadcn/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/avatar";
import { Button } from "@/shadcn/button";
import contact from "@/assets/svg/contact.svg";
import { useEffect, useState } from "react";
import { useToast } from "@/shadcn/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/shadcn/dialog";
import { getInitial } from "@/lib/utils";
import useUserData from "@/api/useUserData";
import supabase from "@/api/supabase";
import { useParams } from "react-router-dom";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export default function VolunteerParticipants() {
  const [isCopied, setIsCopied] = useState(false);
  const { userData } = useUserData();
  // const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { id } = useParams();

  const [isChildDialogOpen, setIsChildDialogOpen] = useState(false);
  const [isParentDialogOpen, setIsParentDialogOpen] = useState(false);
  const [isVolunteerDialogOpen, setIsVolunteerDialogOpen] = useState(false);

  const fetchAllParticipants = async () => {
    const [
      volunteersResponse,
      parentsResponse,
      childrenResponse,
      classOwnerDetails,
    ] = await Promise.all([
      supabase.from("participant_volunteers").select("*").eq("class_id", id),
      supabase.from("participant_parents").select("*").eq("class_id", id),
      supabase.from("participant_children").select("*").eq("class_id", id),
      supabase
        .from("volunteer_classes")
        .select("user_list(*)") // Select all columns from volunteer_classes and related users
        .eq("id", id)
        .single(),
    ]);

    const errors = [
      volunteersResponse.error,
      parentsResponse.error,
      childrenResponse.error,
      classOwnerDetails.error,
    ].filter(Boolean);

    if (errors.length > 0) {
      throw new Error(errors[0].message || "Unknown Error");
    }

    return {
      volunteers: volunteersResponse.data,
      parents: parentsResponse.data,
      children: childrenResponse.data,
      owner: classOwnerDetails.data.user_list,
    };
  };

  const removeParticipants = async (payload) => {
    // console.log("payloads", payload.id, payload.tablename);

    // const {error:findError} =  await supabase.from()
    const { error } = await supabase
      .from(`participant_${payload.tablename}`)
      .delete()
      .eq("id", payload.id);

    if (error) {
      throw new Error(error || "unknown error");
    }
  };
  const deleteMutation = useMutation({
    mutationFn: removeParticipants,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User Removed",
      });
      // reset();
      setIsChildDialogOpen(false);
      setIsParentDialogOpen(false);
      setIsVolunteerDialogOpen(false);
    },

    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Something went wrong",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["participants"] });
    },
  });

  const handleCopy = (contactNumber) => {
    navigator.clipboard
      .writeText(contactNumber)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset the copied state after 2 seconds
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };
  const { data, error, isLoading } = useQuery({
    queryKey: ["participants", id],
    queryFn: fetchAllParticipants,
  });

  useEffect(() => {
    if (isCopied) {
      toast({
        title: "Success!",
        description: "Number has been copied",
      });
    }
  }, [isCopied, toast]);

  const handleRemoveParticipant = (id, tablename) => {
    // console.log("getting this data",id,tablename)
    const payload = {
      id,
      tablename,
    };
    deleteMutation.mutate(payload);
    // setIsDialogOpen(false);
  };

  console.log("owner", data?.owner);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex w-full flex-col items-center justify-center p-2">
      <div className="mx-4 w-full lg:w-3/5">
        <div>
          <div className="flex justify-between">
            <h1 className="text-3xl font-semibold">Volunteers</h1>
          </div>
          <Separator className="my-3" />
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {getInitial(
                      `${data?.owner.user_name} ${data?.owner.user_last_name}`,
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>{`${data?.owner.user_name} ${data?.owner.user_last_name}`}</div>
              </div>
              <div>Owner</div>
            </div>
            <Separator className="my-3" />
            {data?.volunteers.map((volunteers, index) => (
              <div key={index}>
                <div className="flex justify-between">
                  <div className="flex items-center gap-3 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {getInitial(volunteers.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>{volunteers.name}</div>
                  </div>
                  <div>
                    <Dialog
                      open={isVolunteerDialogOpen}
                      onOpenChange={setIsVolunteerDialogOpen}
                    >
                      <DialogTrigger>
                        <Button variant={"destructive"}>Remove</Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-md">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">
                            Remove {volunteers.name}?
                          </DialogTitle>
                          <Separator />
                        </DialogHeader>
                        <p>
                          Are you Sure you want to remove {volunteers.name}?
                        </p>
                        <DialogFooter>
                          <Button
                            onClick={() => setIsVolunteerDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() =>
                              handleRemoveParticipant(
                                volunteers.id,
                                "volunteers",
                              )
                            }
                          >
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <Separator className="my-3" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold">Participants</h1>
            <p>{data.parents.length + data.children.length} Participants</p>
          </div>
          <Separator className="my-3" />
          <div>
            <h2 className="text-2xl font-semibold">Children</h2>
            <Separator className="my-3" />
            {data.children.map((child, index) => (
              <div className="" key={index}>
                <div className="flex justify-between">
                  <div className="flex items-center gap-3 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback>{getInitial(child.name)}</AvatarFallback>
                    </Avatar>
                    <div>{child.name}</div>
                  </div>
                  <div>
                    {userData?.user_role === "volunteer" && (
                      <Dialog
                        open={isChildDialogOpen}
                        onOpenChange={setIsChildDialogOpen}
                      >
                        <DialogTrigger>
                          <Button variant={"destructive"}>Remove</Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-md">
                          <DialogHeader>
                            <DialogTitle className="text-2xl">
                              Remove {child.name}?
                            </DialogTitle>
                            <Separator />
                          </DialogHeader>
                          <p>Are you Sure you want to remove {child.name}?</p>
                          <DialogFooter>
                            <Button onClick={() => setIsChildDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() =>
                                handleRemoveParticipant(child.id, "children")
                              }
                            >
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
                <Separator className="my-3" />
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Parents</h2>
            <Separator className="my-3" />
            {data.parents.map((parent, index) => (
              <div className="" key={index}>
                <div className="flex justify-between">
                  <div className="flex items-center gap-3 px-2 md:flex-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback>{getInitial(parent.name)}</AvatarFallback>
                    </Avatar>
                    <div>{parent.name}</div>
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p
                        onClick={() => handleCopy(parent.contact)}
                        className="hover:cursor-pointer hover:text-orange-400"
                      >
                        {parent.phone_number}
                      </p>
                      <img src={contact} alt="contact" className="h-6 w-6" />
                    </div>

                    <Dialog
                      open={isParentDialogOpen}
                      onOpenChange={setIsParentDialogOpen}
                    >
                      <DialogTrigger>
                        <Button variant={"destructive"}>Remove</Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-md">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">
                            Remove {parent.name}?
                          </DialogTitle>
                          <Separator />
                        </DialogHeader>
                        <p>Are you Sure you want to remove {parent.name}?</p>
                        <DialogFooter>
                          <Button onClick={() => setIsParentDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() =>
                              handleRemoveParticipant(parent.id, "parents")
                            }
                          >
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <Separator className="my-3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
