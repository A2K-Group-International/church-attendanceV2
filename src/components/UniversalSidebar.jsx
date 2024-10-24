import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logout from "../authentication/Logout";
import { Sheet, SheetTrigger, SheetContent } from "../shadcn/sheet";
import { Button } from "../shadcn/button";
import NavigationItem from "./NavigationItem";
import FamilyIcon from "../assets/svg/family.svg";
import CalendarIcon from "../assets/svg/calendarIcon.svg";
import HamburgerIcon from "../assets/svg/hamburgerIcon.svg";
import RequestIcon from "../assets/svg/requestIcon.svg";
import BlackBoardIcon from "../assets/svg/blackboard.svg";
import DashboardIcon from "../assets/svg/dashboard.svg"; // Add import for DashboardIcon
import CheckListIcon from "../assets/svg/checklist.svg";
import PersonIcon from "../assets/svg/person.svg"; // Add import for PersonIcon
import { useUser } from "../context/UserContext"; // Import the context

export default function UniversalSidebar({ children }) {
  const { userData, loggedIn } = useUser(); // Get user data and loggedIn state from context
  const userRole = userData?.user_role || "user"; // Default to 'user' if user role is not defined
  const userName =
    `${userData?.user_name || ""} ${userData?.user_last_name || ""}`.trim(); // Combine first and last name
  const navigate = useNavigate();

  // If the user is not logged in, render the children without the sidebar
  if (!loggedIn) {
    return <>{children}</>; // Render children only, without the sidebar
  }

  // Define the links for different user roles
  const links = {
    admin: [
      { link: "/admin-dashboard", label: "Dashboard", icon: DashboardIcon },
      { link: "/attendance", label: "Attendance", icon: CheckListIcon },
      { link: "/groups", label: "Groups", icon: PersonIcon },
      { link: "/event", label: "Schedule", icon: CalendarIcon },
      { link: "/admin-rotas", label: "Rotas", icon: PersonIcon },
      { link: "/admin-calendar", label: "Calendar", icon: CalendarIcon },
      { link: "/volunteers", label: "Request(s)", icon: RequestIcon },
    ],
    volunteer: [
      {
        link: "/volunteer-announcements",
        label: "Announcements",
        icon: CalendarIcon,
      },
      { link: "/volunteer-dashboard", label: "Dashboard", icon: CalendarIcon },
      {
        link: "/volunteer-schedule",
        label: "Volunteer Events",
        icon: CalendarIcon,
      },
      {
        link: "/volunteer-duties",
        label: "Rota Management",
        icon: CalendarIcon,
      },
      { link: "/volunteer-upload", label: "Upload", icon: CalendarIcon },
      { link: "/volunteer-profile", label: "Profile", icon: CalendarIcon },
      { link: "/volunteer-classes", label: "Classes", icon: BlackBoardIcon },
      { link: "/volunteer-requests", label: "Requests", icon: RequestIcon },
    ],
    user: [
      {
        link: "/user-announcements",
        label: "Announcements",
        icon: CalendarIcon,
      },
      { link: "/events-page", label: "Events", icon: CalendarIcon },
      { link: "/family", label: "Family", icon: FamilyIcon },
      { link: "#", label: "Classes", icon: BlackBoardIcon },
      { link: "/parishioner-request", label: "Request", icon: RequestIcon },
    ],
  };

  const currentLinks = links[userRole] || []; // Get the links for the current user role

  return (
    <div className="flex h-screen w-full overflow-y-clip">
      {/* Large screens */}
      <div className="hidden lg:block lg:w-64 lg:shrink-0 lg:border-r lg:bg-gray-100 dark:lg:bg-gray-800">
        <div className="flex h-full flex-col justify-between px-4 py-6">
          <div className="space-y-4">
            {/* Display user name and role */}
            <div className="text-lg font-semibold">{userName}</div>
            <div className="text-sm font-medium text-gray-600">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </div>
            <nav className="space-y-1">
              <ul>
                {currentLinks.map(({ link, label, icon }) => (
                  <NavigationItem key={link} link={link} icon={icon}>
                    {label}
                  </NavigationItem>
                ))}
              </ul>
            </nav>
          </div>
          <div className="flex items-center justify-between">
            <Button onClick={() => navigate("/volunteer-profile")}>
              Profile
            </Button>
            <Logout />
          </div>
        </div>
      </div>

      {/* Small screens */}
      <div className="flex-1">
        <header className="sticky z-10 border-b bg-white p-0 px-4 py-3 dark:border-gray-800 dark:bg-gray-900 lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <span className="text-xl">Management Centre</span>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <img
                    src={HamburgerIcon}
                    alt="Toggle Sidebar"
                    className="h-6 w-6"
                  />
                  <span className="sr-only">Toggle Navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex h-full flex-col justify-between px-4 py-6">
                  <div className="space-y-4">
                    {/* Display user name and role */}
                    <div className="text-lg font-semibold">{userName}</div>
                    <div className="text-sm font-medium text-gray-600">
                      {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    </div>
                    <nav className="space-y-1">
                      <ul>
                        {currentLinks.map(({ link, label, icon }) => (
                          <NavigationItem key={link} link={link} icon={icon}>
                            {label}
                          </NavigationItem>
                        ))}
                      </ul>
                    </nav>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button onClick={() => navigate("/volunteer-profile")}>
                      Profile
                    </Button>
                    <Logout />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
