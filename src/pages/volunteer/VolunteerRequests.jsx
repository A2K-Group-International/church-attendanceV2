import BtnVolunteerRequestCategory from "../../components/volunteer/BtnVolunteerRequestCategory";
import Title from "../../components/Title";
import VolunteerSidebar from "../../components/volunteer/VolunteerSidebar";

export default function VolunteerRequests() {
  return (
    <VolunteerSidebar>
      <main className="h-screen overflow-y-scroll rounded-md p-8 shadow-md">
        <div className="mb-4 flex flex-grow justify-between">
          <Title>Requests</Title>
        </div>
        <BtnVolunteerRequestCategory />
      </main>
    </VolunteerSidebar>
  );
}
