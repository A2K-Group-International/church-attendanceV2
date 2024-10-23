import React, { useState } from "react";
import { Button } from "../../../shadcn/button";
import { DialogFooter } from "../../../shadcn/dialog";
import { Input } from "../../../shadcn/input";
import { Textarea } from "../../../shadcn/textarea";
import { Label } from "../../../shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shadcn/select"; // Import ShadCN select

const AnnouncementForm = ({
  newAnnouncement,
  setNewAnnouncement,
  handleSubmit,
  setUploadedImage,
  error,
}) => {
  const [imagePreview, setImagePreview] = useState(null); // State for image preview

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
      if (validImageTypes.includes(file.type)) {
        setUploadedImage(file); // Set the uploaded image
        setImagePreview(URL.createObjectURL(file)); // Set the image preview
      } else {
        alert("Please upload a valid image file (JPEG, PNG, GIF).");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Display error message if it exists */}
      {error && <div className="text-red-500">{error}</div>}

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

      <div className="space-y-2">
        <Label htmlFor="image_upload">Upload Image</Label>
        <Input
          type="file"
          id="image_upload"
          accept="image/jpeg,image/png,image/gif"
          onChange={handleImageUpload}
          className="w-full"
        />
        {imagePreview && (
          <div className="mt-2">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-32 w-32 object-cover"
            />
          </div>
        )}
      </div>

      {/* Privacy option using ShadCN Select */}
      <div className="space-y-2">
        <Label htmlFor="announcement_privacy">Announcement Privacy</Label>
        <Select
          value={newAnnouncement.privacy}
          onValueChange={(value) =>
            setNewAnnouncement({ ...newAnnouncement, privacy: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select privacy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button type="submit">Post Announcement</Button>
      </DialogFooter>
    </form>
  );
};

export default AnnouncementForm;
