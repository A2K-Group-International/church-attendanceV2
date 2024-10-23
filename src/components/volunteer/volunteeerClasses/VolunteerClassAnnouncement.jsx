import { getInitial } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/avatar";
import { Separator } from "@/shadcn/separator";
import { Textarea } from "@/shadcn/textarea";
import upload from "@/assets/svg/upload.svg";
import { Button } from "@/shadcn/button";
import { useState } from "react";
import { Input } from "@/shadcn/input";
import { Label } from "@/shadcn/label";
import remove from "@/assets/svg/remove.svg";
import supabase from "@/api/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shadcn/use-toast";
import useUserData from "@/api/useUserData";
import { useForm } from "react-hook-form";
import deleteIcon from "@/assets/svg/delete.svg";
import editIcon from "@/assets/svg/edit.svg";
import { useParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/shadcn/dialog";
import Comments from "@/components/Comments";

export default function VolunteerClassAnnouncement() {
  const queryClient = useQueryClient();
  const { userData } = useUserData();
  const [files, setFiles] = useState([]);
  const { register, handleSubmit, reset, setValue } = useForm();
  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    setValue: setEditValue,
    reset: resetEdit,
  } = useForm();
  const { toast } = useToast();
  const { id } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // if(!userData){
  //   return <Navigate to="/" replace />;
  // }

  const handleFileUpload = (event) => {
    const selectedFiles = Array.from(event.target.files); // Convert FileList to array
    const filePreviews = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file), // Create a preview URL for the file
    }));
    setFiles((prevFiles) => [...prevFiles, ...filePreviews]); // Append new files with previews
    setValue("files", selectedFiles); // Set files in react-hook-form
  };

  const handleFileClick = (file) => {
    window.open(file);
  };

  const fetchClassAnnouncements = async () => {
    const { data: announcements, error: announcementError } = await supabase
      .from("volunteer_announcements")
      .select("*")
      .eq("class_id", id)
      .order("created_at", { ascending: false });

    if (announcementError)
      throw new Error(announcementError.message || "Unknown error occurred");

    const announcementsWithFiles = await Promise.all(
      announcements.map(async (announcement) => {
        const { data: filesData, error: filesError } = await supabase
          .from("announcement_files")
          .select("*")
          .eq("announcement_id", announcement.id);

        if (filesError)
          throw new Error(filesError.message || "Error fetching files");

        // Fetch public URLs for the files
        // console.log("filedata",filesData)
        const fileURLs = await Promise.all(
          filesData.map(async (file) => {
            // console.log("filepaths",file.filepath)
            const { data: fileURL, error: fileURLError } =
              await supabase.storage
                .from("Uploaded files")
                .getPublicUrl(file.filepath);

            if (fileURLError)
              throw new Error(
                fileURLError.message || "Error fetching file URL",
              );
            return {
              fileURL,
              filepath: file.filepath,
              filetype: file.filetype,
              filename: file.filename,
            };
          }),
        );
        // console.log("urls",fileURLs)
        return {
          ...announcement,
          files: fileURLs || [], // Attach files data to the announcement
        };
      }),
    );

    return announcementsWithFiles; // Return the updated announcements with files
  };

  const { data, isLoading } = useQuery({
    queryKey: ["classAnnouncements"],
    queryFn: fetchClassAnnouncements,
  });

  const createAnnouncement = async (inputData) => {
 
      const uploadPromises = inputData.files.map(async (filewithpreview) => {
        console.log("this is each files before uploading", filewithpreview);
        const { data, error } = await supabase.storage
          .from("Uploaded files")
          .upload(
            `class_announcements/${filewithpreview.file.name}`,
            filewithpreview.file,
          );

        if (error) throw new Error(error.message || "File upload error");

        return {
          filepath: data.path,
          filetype: filewithpreview.file.type,
          filename: filewithpreview.file.name,
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      const { data,error } = await supabase
        .from("volunteer_announcements")
        .insert([
          {
            postBy: userData.user_name,
            title: inputData.input.title,
            content: inputData.input.content,
            class_id: id,
            user_id: userData.user_id,
          },
        ])
        .select("id");

      if (error) throw new Error(error.message || "Unknown error occurred");
      // console.log("data added", data[0].id);

      const insertFilePromises = uploadedFiles.map(async (file) => {
        const { error } = await supabase.from("announcement_files").insert([
          {
            announcement_id: data[0].id,
            filepath: file.filepath,
            filetype: file.filetype,
            filename: file.filename,
          },
        ]);

        if (error) throw new Error(error.message || "File insert error");
      });

      // Wait for file insertions to complete
      await Promise.all(insertFilePromises);
    

    // Create the announcement

    console.log("Announcement created successfully");
    // } catch (error) {
    //   console.error("Error creating announcement:", error.message);
    // }
  };
  const updateAnnouncement = async (data) => {
    const { input } = data; // Destructure input and id from data
    const { error } = await supabase
      .from("volunteer_announcements")
      .update({ title: input.edittitle, content: input.editcontent })
      .eq("id", currentId); // Ensure you are using the correct ID

    if (error) throw new Error(error.message || "Update Failed");
  };
  const deleteAnnouncement = async (data) => {
    if (data.files.length > 0) {
      const filePaths = data.files.map((file) => file.filepath);
      console.log("file paths to be deleted", filePaths);
      const { data: deletedData, error: storageDeleteError } =
        await supabase.storage.from("Uploaded files").remove(filePaths);

      if (storageDeleteError)
        throw new Error(
          storageDeleteError.message || "Failed to delete file from storage",
        );

      console.log("Files deleted from storage:", deletedData);
    }

    const { error } = await supabase
      .from("volunteer_announcements")
      .delete()
      .eq("id", currentId);

    if (error) throw new Error(error.message || "File insert error");
  };

  const createMutation = useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Announcement created.",
      });
      reset();
      setFiles([]);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Something went wrong",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["classAnnouncements"] });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Announcement deleted.",
      });

      reset();
      setIsDialogOpen(false);
      setFiles([]);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Something went wrong",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["classAnnouncements"] });
    },
  });
  const updateMutation = useMutation({
    mutationFn: updateAnnouncement,
    onSuccess: () => {
      // Update only the modified announcement
      // queryClient.setQueryData(["classAnnouncements"], (oldData) =>
      //     oldData.map((announcement) =>
      //         announcement.id === data.id ? { ...announcement, ...data } : announcement
      //     )
      // );

      toast({
        title: "Success",
        description: "Announcement edited successfully.",
      });
      resetEdit();
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["classAnnouncements"] });
    },
  });

  const onEditSubmit = (input) => {
    const data = { input };
    updateMutation.mutate(data);
  };

  const onSubmit = (input) => {
    const data = {
      input,
      files,
    };

    createMutation.mutate(data);
  };
  const onDelete = (fileData) => {
    deleteMutation.mutate(fileData);
  };

  const renderFiles = (file, index) => {
    if (file.filetype.startsWith("image")) {
      // Render image
      return (
        <img
          className=" cursor-pointer snap-start object-contain"
          onClick={() => handleFileClick(file.fileURL.publicUrl)}
          key={index}
          src={file.fileURL.publicUrl}
          alt="announcement image"
        />
      );
    } else if (file.filetype.startsWith("video")) {
      // Render video
      return (
        <video
          className="h-full w-full cursor-pointer snap-start object-contain"
          onClick={() => handleFileClick(file.fileURL.publicUrl)}
          controls
          key={index}
        >
          <source src={file.fileURL.publicUrl} type={file.filetype} />
          Your browser does not support the video tag.
        </video>
      );
    } else if (file.filetype.startsWith("application")) {
      // Render download link
      return (
        <div key={index} className="flex p-3 m-2 rounded-md border gap-2 items-center justify-center">
          <a
            href={file.fileURL.publicUrl}
            className=" w-fit cursor-pointer underline hover:cursor-pointer"
            download
          >
            {file.filename}
          </a>
        </div>
      );
    }else{
      <a
      href={file.fileURL.publicUrl}
      className="mx-2 w-full cursor-pointer  underline hover:cursor-pointer lg:w-[35rem]"
      download
    >
      {file.filename}
    </a>
    }
    return null;
  };
  // console.log("data", currentId);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-2 p-2">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full rounded-md border p-4 shadow-md lg:w-3/5"
      >
        <Input
          className="mb-2"
          placeholder="Title of Highlight"
          {...register("title", { required: true })}
        />
        <Textarea
          className="mb-2"
          placeholder="Create a highlight for your class."
          {...register("content", { required: true })}
        />
        <div className="mb-2 flex flex-col gap-2">
          {files.map((file, index) => (
            <div
              className="flex items-center gap-2 rounded-md border p-2 hover:bg-slate-200"
              key={index}
            >
              <div
                onClick={() => handleFileClick(file.preview)}
                className="flex flex-1 cursor-pointer gap-2"
              >
                {file.file.type.startsWith("image/") && (
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="h-12 w-12 rounded-md"
                  />
                )}
                <div className="flex h-10 items-center p-2">
                  <p>{file.file.name}</p>
                  {/* <p>{file.file.type}</p> */}
                </div>
              </div>
              <div>
                <img
                  className="mr-3 cursor-pointer"
                  src={remove}
                  alt="remove file"
                  onClick={() => {
                    setFiles((prevFiles) =>
                      prevFiles.filter((_, i) => i !== index),
                    );
                  }}
                />
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
              multiple
            />
          </div>
          <div>
            <Button type="submit">Post</Button>
          </div>
        </div>
      </form>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        data.map((values, index) => (
          <div
            key={index}
            className="mx-4 w-full rounded-md border p-4 shadow-md lg:w-3/5"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback>{getInitial("Volunteer")}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p>{values.postBy}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(values.created_at).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {userData?.user_role === "volunteer" && (
                  <div className="flex gap-2">
                    <Dialog
                      open={isDialogOpen}
                      onOpenChange={(isOpen) => {
                        setCurrentId(values.id);
                        setIsDialogOpen(isOpen);
                      }}
                    >
                      <DialogTrigger>
                        <img
                          src={deleteIcon}
                          alt="delete"
                          className="h-6 w-6"
                        />
                      </DialogTrigger>
                      <DialogContent className="rounded-md">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">
                            Delete Highlight
                          </DialogTitle>
                          <Separator />
                        </DialogHeader>
                        <DialogDescription>
                          Are you sure you want to delete highlight?
                        </DialogDescription>
                        <DialogFooter className="mx-2 flex gap-2 sm:justify-between">
                          <Button
                            onClick={() => setIsDialogOpen(false)}
                            variant="destructive"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() =>
                              onDelete({ id: values.id, files: values.files })
                            }
                            // disabled={deletemutation.isLoading}
                          >
                            {/* {mutation.isLoading ? "Saving..." : "Save"} */}
                            Confirm
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog
                      open={isEditDialogOpen}
                      onOpenChange={(isOpen) => {
                        if (isOpen) {
                          setEditValue("edittitle", values.title);
                          setEditValue("editcontent", values.content);
                          setCurrentId(values.id);
                        }
                        setIsEditDialogOpen(isOpen);
                      }}
                    >
                      <DialogTrigger>
                        <img src={editIcon} alt="edit" className="h-6 w-6" />
                      </DialogTrigger>
                      <DialogContent className="rounded-md">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">
                            Edit Highlight
                          </DialogTitle>
                          <Separator />
                        </DialogHeader>
                        <form
                          id="editform"
                          onSubmit={handleEditSubmit((data) => {
                            onEditSubmit(data);
                          })}
                        >
                          <Label htmlFor="title">Title</Label>
                          <Input
                            {...registerEdit("edittitle", { required: true })}
                            placeholder="Title of Highlight"
                            className="mt-1"
                          />
                          <Label htmlFor="content">Highlight</Label>
                          <Textarea
                            {...registerEdit("editcontent", { required: true })}
                            placeholder="Put your highlight here"
                            className="mt-1 resize-none"
                          />
                        </form>
                        <DialogFooter className="mx-2 flex gap-2 sm:justify-between">
                          <Button
                            onClick={() => setIsEditDialogOpen(false)}
                            variant="destructive"
                          >
                            Cancel
                          </Button>
                          <Button form="editform" type="submit">
                            Edit
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
              <Separator className="my-3" />
              <div>
                <p className="mb-4 font-bold">{values.title}</p>
                <p style={{ whiteSpace: "pre-wrap" }} className="mb-4 text-sm">
                  {values.content}
                </p>
                {/* <p>{values.id}</p> */}

                <div className="flex snap-x snap-mandatory overflow-x-auto">
                  {values.files &&
                    values.files.map((file, index) => renderFiles(file, index))}
                </div>
              </div>
              <Separator className="mt-3" />

              <Comments post_id={values.id}/>

            </div>
          </div>
        ))
      )}
    </div>
  );
}
