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

const dummyTeacherData = [
  {
    name: "Franklin Sula",
  },
  {
    name: "Aldrich Bondoc",
  },
];

const dummyStudentData = [
  {
    name: "Tristan Santos",
  },
  {
    name: "Leigh David",
  },
];

const dummyParentData = [
  {
    name: "Karen Hill",
    contact: "+63 912 345 6789",
  },
  {
    name: "Jessica Jones",
    contact: "+63 987 654 3210",
  },
];


export default function VolunteerParticipants() {
  const [isCopied, setIsCopied] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleCopy = (contactNumber) => {
    toast("Simple Toast Test");
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

  useEffect(() => {
    if (isCopied) {
      toast({
        title: "Success!",
        description: "Number has been copied",
      });
    }
  }, [isCopied, toast]);

  const handleRemoveParticipant = () => {
    setIsDialogOpen(false);
  };

  console.log("copied", isCopied);

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="mx-4 w-full lg:w-3/5">
        <div>
          <div className=" flex justify-between">
          <h1 className="text-3xl font-semibold">Volunteers</h1>
          <Button>Copy Link</Button>
          </div>
          <Separator className="my-3" />
          <div>
            {dummyTeacherData.map((teacher, index) => (
              <div key={index}>
                <div className="flex items-center gap-3 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback>{getInitial(teacher.name)}</AvatarFallback>
                  </Avatar>
                  <div>{teacher.name}</div>
                </div>
                <Separator className="my-3" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold">Participants</h1>
            <p>{dummyStudentData.length} Participants</p>
          </div>
          <Separator className="my-3" />
          <div>
            <h2 className="text-2xl font-semibold">Children</h2>
            <Separator className="my-3" />
            {dummyStudentData.map((student, index) => (
              <div className="" key={index}>
                <div className="flex justify-between">
                  <div className="flex items-center gap-3 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {getInitial(student.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>{student.name}</div>
                  </div>
                  <div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger>
                        <Button variant={"destructive"}>Remove</Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-md">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">
                            Delete User?
                          </DialogTitle>
                          <Separator />
                        </DialogHeader>
                        <p>Are you Sure you want to remove this participant?</p>
                        <DialogFooter>
                          <Button onClick={() => setIsDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleRemoveParticipant}
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
          <div>
            <h2 className="text-2xl font-semibold">Parents</h2>
            <Separator className="my-3" />
            {dummyParentData.map((parent, index) => (
              <div className="" key={index}>
                <div className="flex justify-between">
                  <div className="flex items-center gap-3 px-2 md:flex-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {getInitial(parent.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>{parent.name}</div>
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p
                        onClick={() => handleCopy(parent.contact)}
                        className="hover:cursor-pointer hover:text-orange-400"
                      >
                        {parent.contact}
                      </p>
                      <img src={contact} alt="contact" className="h-6 w-6" />
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger>
                        <Button variant={"destructive"}>Remove</Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-md">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">
                            Delete User?
                          </DialogTitle>
                          <Separator />
                        </DialogHeader>
                        <p>Are you Sure you want to remove this participant?</p>
                        <DialogFooter>
                          <Button onClick={() => setIsDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleRemoveParticipant}
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
