import { Separator } from "@/shadcn/separator";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/avatar";

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
function getInitials(name){
    const initials = name?.split(" ").map(word => word[0]).join('') ?? '';
    return initials
  }

export default function VolunteerPeople() {
  return (
    <div className="flex w-full flex-col items-center justify-center">
      {/* <div className="text- font-bold">People</div> */}

      <div className="lg:w-3/5 w-full mx-4">
        <div>
          <h1 className=" text-3xl font-semibold">Teachers</h1>
          <Separator className="my-3" />
          <div>
            {dummyTeacherData.map((teacher, index) => (
              <div>
                <div className=" flex items-center px-2 gap-3">
                <Avatar className=" w-8 h-8">
                  <AvatarImage src="" />
                  <AvatarFallback>{getInitials(teacher.name)}</AvatarFallback>
                </Avatar>
                <div> {teacher.name}</div>
                </div>
                <Separator className="my-3" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className=" flex items-center justify-between">
          <h1 className=" text-3xl font-semibold">Students</h1>
          <p>{dummyStudentData.length} Students</p>
          </div>
          <Separator className="my-3" />
          <div>
            {dummyStudentData.map((student, index) => (
              <div>
                <div className=" flex items-center px-2 gap-3">
                <Avatar className=" w-8 h-8">
                  <AvatarImage src="" />
                  <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                </Avatar>
                <div> {student.name}</div>
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
