import { getInitial } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/avatar";
import { Separator } from "@/shadcn/separator";
import { Textarea } from "@/shadcn/textarea";
import upload from "@/assets/svg/upload.svg";
import { Button } from "@/shadcn/button";
import { useState } from "react";
import { Input } from "@/shadcn/input";
import { Label } from "@/shadcn/label";
import remove from "@/assets/svg/remove.svg"

const dummyAnnouncements = [
  {
    id: 1,
    title: "Upcoming Parish Retreat",
    content:
      "Join us for a spiritual retreat on November 10th-12th at the St. Francis Retreat Center. All are welcome!",
    datePosted: "2024-10-15T10:00:00Z",
    poster: "Father John Smith",
    date: "2024-10-16T10:00:00Z",
    files: [
      {
        fileName: "retreat_brochure.pdf",
        fileType: "application/pdf",
        fileUrl: "https://example.com/files/retreat_brochure.pdf",
      },
      {
        fileName: "retreat_registration_form.docx",
        fileType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        fileUrl: "https://example.com/files/retreat_registration_form.docx",
      },
    ],
  },
  {
    id: 2,
    title: "Weekly Mass Schedule",
    content:
      "Please note the updated schedule for Mass services this month. Check the bulletin for details.",
    datePosted: "2024-10-14T14:00:00Z",
    poster: "Sister Mary Catherine",
    date: "2024-10-15T14:00:00Z",
    files: [
      {
        fileName: "mass_schedule_october.pdf",
        fileType: "application/pdf",
        fileUrl: "https://example.com/files/mass_schedule_october.pdf",
      },
    ],
  },
  {
    id: 3,
    title: "Confirmation Preparation Classes",
    content:
      "Classes for Confirmation preparation will begin on November 5th. Registration is open until October 30th.",
    datePosted: "2024-10-10T09:00:00Z",
    poster: "Father John Smith",
    date: "2024-10-14T09:00:00Z",
    files: [
      {
        fileName: "confirmation_classes_info.pdf",
        fileType: "application/pdf",
        fileUrl: "https://example.com/files/confirmation_classes_info.pdf",
      },
      {
        fileName: "registration_form.docx",
        fileType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        fileUrl: "https://example.com/files/registration_form.docx",
      },
    ],
  },
  {
    id: 4,
    title: "Community Service Day",
    content:
      "Join us on October 28th for a Community Service Day. Help us make a difference in our local community!",
    datePosted: "2024-10-16T10:00:00Z",
    poster: "Father John Smith",
    date: "2024-10-16T10:00:00Z",
    files: [
      {
        fileName: "service_day_details.pdf",
        fileType: "application/pdf",
        fileUrl: "https://example.com/files/service_day_details.pdf",
      },
    ],
  },
];

console.log(dummyAnnouncements);

export default function VolunteerClassAnnouncement() {
  // const { userData } = useUserData();
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

  console.log(files);
  return (
    <div className="flex w-full flex-col items-center justify-center gap-2">
      <div
        // key={index}
        className="w-full rounded-md border p-4 shadow-md lg:w-3/5"
      >
        <Textarea
          className="mb-2"
          placeholder={"Create an Announcement for your class."}
        />
        <div className="mb-2 flex flex-col gap-2">
          {files.map((file, index) => (
            <div
              className="flex items-center gap-2 rounded-md border p-"
              key={index}
           
            >
            <div onClick={() => handleFileClick(file)} className=" flex gap-2 cursor-pointer flex-1">
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
            <div>
              <img className=" mr-3 cursor-pointer " src={remove} alt="vertiical kebab" />
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
              This is your reminder that the Inscription mass is this Sunday
              (22nd September) at 9.30 and 11 am masses. I will remind you on
              the day but please do not let your child go to the childrens
              liturgy as the books will be handed out after the Gospel. The
              children will be called to the front of the church, they will sign
              a piece of paper - this is so they are entering into the
              programme. They will receive their book and stand on the Altar so
              the whole church can welcome them to the start of their journey.
            </p>
            <p className="mb-4">
              If you have not registered yet, I will be available after and
              before both masses. If you have not signed up for a mass, please
              email me and let me know your childs name. Thank you.
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
  );
}
