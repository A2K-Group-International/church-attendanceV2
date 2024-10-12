import React from "react";
import { Button } from "../../../shadcn/button";
import { DialogFooter, DialogClose } from "../../../shadcn/dialog";
import { Input } from "../../../shadcn/input";
import { Textarea } from "../../../shadcn/textarea";
import { Label } from "../../../shadcn/label";

const AnnouncementForm = ({
  newAnnouncement,
  setNewAnnouncement,
  handleSubmit,
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="post_header">Announcement Header</Label>
        <Input
          id="post_header"
          type="text"
          value={newAnnouncement.post_header}
          onChange={(e) =>
            setNewAnnouncement({
              ...newAnnouncement,
              post_header: e.target.value,
            })
          }
          required
          placeholder="Enter the announcement header..."
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="post_content">Announcement Content</Label>
        <Textarea
          id="post_content"
          value={newAnnouncement.post_content}
          onChange={(e) =>
            setNewAnnouncement({
              ...newAnnouncement,
              post_content: e.target.value,
            })
          }
          required
          placeholder="Enter your announcement here..."
          className="h-40 w-full"
        />
      </div>
      <div className="flex justify-between">
        <Button
          type="button"
          className="w-full"
          onClick={() => {
            // Implement attachment functionality later
            console.log("Attach file clicked");
          }}
        >
          Attach File
        </Button>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="submit">Post Announcement</Button>
        </DialogClose>
      </DialogFooter>
    </form>
  );
};

export default AnnouncementForm;
