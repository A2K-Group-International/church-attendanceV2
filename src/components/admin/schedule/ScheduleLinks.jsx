import { Link } from "react-router-dom";
import AdminSidebar from "../../admin/AdminSidebar";
import { Button } from "../../../shadcn/button";

const buttonLinks = [
  { link: "/event", label: "Event" },
  { link: "/meeting", label: "Meeting" },
  { link: "#", label: "Poll" },
];

export default function ScheduleLinks({ children }) {
  return (
    // <AdminSidebar>
    <main className="mx-auto max-w-7xl p-4 lg:p-8">
      <div className="mb-2 md:flex md:justify-between">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Schedule</h1>
          <p className="text-muted-foreground">Manage Schedules.</p>
        </div>
      </div>
      <div className="flex gap-x-3">
        {buttonLinks.map((item, index) => (
          <Link key={index} to={item.link}>
            <Button variant="outline">{item.label}</Button>
          </Link>
        ))}
      </div>
      <div className="py-5">{children}</div>
    </main>
    // </AdminSidebar>
  );
}
