import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Label } from "../../shadcn/label";
import { Input } from "../../shadcn/input";
import { Button } from "../../shadcn/button";
import { Textarea } from "../../shadcn/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../shadcn/dialog";
import { Icon } from "@iconify/react";

export default function CreatePoll() {
  // schema for the react hook form
  const meetingSchema = z.object({
    meeting_title: z.string().min(1, "Meeting title is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(meetingSchema),
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>New Poll</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Poll</DialogTitle>
          <DialogDescription className="sr-only">
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-y-2 pt-8"
          >
            <div className="flex items-center gap-x-2">
              <Icon icon="mdi:pencil-outline" width="1.5em" height="1.5em" />
              <Input placeholder="Add title" {...register("meeting_title")} />
            </div>
            <div className="flex items-center gap-x-2">
              <Icon
                icon="icon-park-twotone:people-plus"
                width="1.5em"
                height="1.5em"
              />
              <Input placeholder="Add required attendees or groups" />
            </div>
            <div className="flex items-center gap-x-2">
              <Icon
                icon="basil:location-outline"
                width="1.5em"
                height="1.5em"
              />
              <Input placeholder="Add Location" />
            </div>
            <div className="flex items-center gap-x-2">
              <Icon icon="formkit:date" width="1.5em" height="1.5em" />
              <Input type="date" placeholder="Add date" />
            </div>
            <div className="flex items-center gap-x-2">
              <Icon icon="mingcute:time-line" width="1.5em" height="1.5em" />
              <Input type="time" placeholder="Add Time" />
            </div>
            <div className="flex items-center gap-x-2">
              <Icon icon="gg:details-more" width="1.5em" height="1.5em" />
              <Textarea placeholder="Type details for this new meeting" />
            </div>
            <DialogFooter>
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
