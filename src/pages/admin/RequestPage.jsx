import { Link } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { Button } from "../../shadcn/button";

const buttonLinks = [
  { link: "/volunteers", label: "Volunteers" },
  { link: "/users", label: "Parishioners" },
  { link: "/categories", label: "Categories" },
  { link: "#", label: "Mass Intentions" },
  { link: "#", label: "Facilities" },
];

export default function RequestPage({ children }) {
  return (
    <AdminSidebar>
      <main className="mx-auto max-w-7xl p-4 lg:p-8">
        <div className="mb-2 md:flex md:justify-between">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Request(s)</h1>
            <p className="text-muted-foreground">
              Manage and track request records.
            </p>
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
    </AdminSidebar>
  );
}
