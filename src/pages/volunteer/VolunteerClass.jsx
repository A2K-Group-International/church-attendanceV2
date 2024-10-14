import VolunteerSidebar from "@/components/volunteer/VolunteerSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/tabs";
import React from "react";
import VolunteerClassAnnouncement from "./VolunteerClassAnnouncement";
import VolunteerAssignment from "./VolunteerAssignment";
import VolunteerPeople from "./VolunteerPeople";
export default function VolunteerClass() {
  return (
    <VolunteerSidebar>
      <main className="h-screen overflow-y-scroll rounded-md shadow-md">
        <Tabs defaultValue="Courses" className="flex w-full flex-grow flex-col">
          <TabsList className="flex w-full justify-start rounded-none">
            <TabsTrigger className="rounded-none" value="Announcement">
              Announcements
            </TabsTrigger>
            <TabsTrigger className="rounded-none" value="Assignments">
              Assignments
            </TabsTrigger>
            <TabsTrigger className="rounded-none" value="People">
              People
            </TabsTrigger>
          </TabsList>

          <TabsContent className="flex-grow" value="Announcement">
            <VolunteerClassAnnouncement />
          </TabsContent>
          <TabsContent className="flex-grow" value="Assignments">
            <VolunteerAssignment />
          </TabsContent>
          <TabsContent className="flex-grow" value="People">
            <VolunteerPeople />
          </TabsContent>
        </Tabs>
      </main>
    </VolunteerSidebar>
  );
}
