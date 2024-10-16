import VolunteerAssignment from "@/components/volunteer/volunteeerClasses/VolunteerAssignment";
import VolunteerClassAnnouncement from "@/components/volunteer/volunteeerClasses/VolunteerClassAnnouncement";
import VolunteerClassContents from "@/components/volunteer/volunteeerClasses/VolunteerClassContents";
import VolunteerParticipants from "@/components/volunteer/volunteeerClasses/VolunteerParticipants";
import VolunteerSidebar from "@/components/volunteer/VolunteerSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/tabs";

export default function VolunteerClass() {
  return (
    <VolunteerSidebar>
      <main className="h-screen overflow-y-scroll rounded-md">
        <Tabs
          defaultValue="Announcement"
          className="flex w-full flex-grow flex-col"
        >
          <TabsList className="flex w-full justify-start rounded-none">
            <TabsTrigger className="flex-1" value="Announcement">
              Announcements
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="Contents">
              Contents
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="Assignments">
              Assignments
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="Participants">
              Participants
            </TabsTrigger>
          </TabsList>

          <TabsContent className="flex-grow" value="Announcement">
            <VolunteerClassAnnouncement />
          </TabsContent>
          <TabsContent className="flex-grow" value="Contents">
            <VolunteerClassContents />
          </TabsContent>
          <TabsContent className="flex-grow" value="Assignments">
            <VolunteerAssignment />
          </TabsContent>
          <TabsContent className="flex-grow" value="Participants">
            <VolunteerParticipants />
          </TabsContent>
        </Tabs>
      </main>
    </VolunteerSidebar>
  );
}
