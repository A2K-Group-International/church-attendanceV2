import { getInitial } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/avatar";
import { Separator } from "@/shadcn/separator";
import { Textarea } from "@/shadcn/textarea";
import upload from "@/assets/svg/upload.svg";
import { Button } from "@/shadcn/button";
import { Input } from "@/shadcn/input";
import { Label } from "@/shadcn/label";
import { useState } from "react";


export default function VolunteerClassContents() {
    const [files, setFiles] = useState([]);

    const handleFileUpload = (event) => {
      const selectedFiles = Array.from(event.target.files); // Convert FileList to array
      const filePreviews = selectedFiles.map((file) => {
        return {
          file,
          preview: URL.createObjectURL(file), // Create a preview URL for the file
        };
      });
      setFiles((prevFiles) => [...prevFiles, ...filePreviews]); // Append new files with previews
    };
  
    const handleFileClick = (file) => {
      window.open(file.preview);
    };
  
  return (
    <div className="flex p-2 w-full flex-col items-center justify-center gap-2">
    <div
      // key={index}
      className="w-full rounded-md border p-4 shadow-md lg:w-3/5"
    >
      <Textarea
        className="mb-2"
        placeholder={"Content description."}
      />
      <div className="mb-2 flex flex-col gap-2">
        {files.map((file, index) => (
          <div
            className="flex cursor-pointer items-center gap-2 rounded-md border p-2 hover:bg-slate-200"
            key={index}
            onClick={() => handleFileClick(file)}
          >
            {file.file.type.startsWith("image/") && (
              <img
                src={file.preview}
                alt={file.file.name}
                className="h-12 w-12 rounded-md"
              />
            )}
            <div>
              <p>{file.file.name}</p>
              <p>{file.file.type}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-300">
          <Label
            htmlFor="file-upload"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-slate-300"
          >
            <img src={upload} alt="Upload" />
          </Label>
          <Input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
        <div>
          <Button>Post</Button>
        </div>
      </div>
    </div>
    <div
      // key={index}
      className="mx-4 w-full rounded-md border p-4 shadow-md lg:w-3/5"
    >
      <div>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback>{getInitial("Volunteer")}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p>
              {`Volunteer `}
              {"Sample"}
            </p>
            <p className="text-sm text-slate-500">October 16,2024</p>
          </div>
        </div>
        <Separator className="my-3" />
        <div>
          <p className="mb-4">
            Here is the powerpoint presentation to the Chapter 1 of our Class
          </p>
        </div>
        <Separator className="my-3" />
        <div className=" flex gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src="" />
          <AvatarFallback>{getInitial("Volunteer")}</AvatarFallback>
        </Avatar>
        <Input placeholder="Add comment"/>
        </div>
      </div>
    </div>
  </div>
  )
}
