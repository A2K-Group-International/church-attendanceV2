import { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import Logout from "../../authentication/Logout";
import { Sheet, SheetTrigger, SheetContent } from "../../shadcn/sheet";
import { Button } from "../../shadcn/button";
import NavigationItem from "../NavigationItem";
import CalendarIcon from "../../assets/svg/calendarIcon.svg";
import PersonIcon from "../../assets/svg/person.svg";
import CheckListIcon from "../../assets/svg/checklist.svg";
import DashboardIcon from "../../assets/svg/dashboard.svg";
import HamburgerIcon from "../../assets/svg/hamburgerIcon.svg";
import RequestIcon from "../../assets/svg/requestIcon.svg";
import { useUser } from "../../authentication/useUser";
import useUserData from "../../api/useUserData";

const adminLinks = [
  { link: "/admin-dashboard", label: "Dashboard", icon: DashboardIcon },
  { link: "/attendance", label: "Attendance", icon: CheckListIcon },
  { link: "/groups", label: "Groups", icon: PersonIcon },
  { link: "/schedule", label: "Schedule", icon: CalendarIcon },
  { link: "/admin-calendar", label: "Calendar", icon: CalendarIcon },
  { link: "/volunteers", label: "Request(s)", icon: RequestIcon },
];

export default function AdminSidebar({ children }) {
  const navigate = useNavigate(); // Initialize useNavigate for navigation
  const { user } = useUser(); // Get the current user
  const { userData, error } = useUserData(user ? user.id : null); // Get user data

  useEffect(() => {
    if (error) {
      console.error("Error fetching user data:", error);
    }
  }, [error]);

  const handleNavigateToVolunteer = () => {
    navigate("/volunteer-dashboard"); // Navigate to the volunteer dashboard
  };

  const handleNavigateToUser = () => {
    navigate("/events-page"); // Navigate to the user events page
  };

  return (
    <div className="flex h-screen w-full">
      {/* Large screens */}
      <div className="hidden lg:block lg:w-64 lg:shrink-0 lg:border-r lg:bg-gray-100 dark:lg:bg-gray-800">
        <div className="flex h-full flex-col justify-between px-4 py-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2 font-bold">
              <span className="text-xl">Admin Management Centre</span>
            </div>
            <nav className="space-y-1">
              <ul>
                {adminLinks.map(({ link, label, icon }) => (
                  <NavigationItem key={link} link={link} icon={icon}>
                    {label}
                  </NavigationItem>
                ))}
              </ul>
            </nav>
          </div>
          <div className="space-y-4">
            {/* Navigate to Volunteer Dashboard Button */}
            <Button
              onClick={handleNavigateToVolunteer}
              variant="outline"
              className="w-full" // Add full width for better layout
            >
              Switch to Volunteer
            </Button>
            {/* Navigate to User Events Page Button */}
            <Button
              onClick={handleNavigateToUser}
              variant="outline"
              className="w-full" // Add full width for better layout
            >
              Switch to Parishioner
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
                  <div className="space-y-6">
                    <nav className="space-y-1">
                      <ul>
                        {adminLinks.map(({ link, label, icon }) => (
                          <NavigationItem key={link} link={link} icon={icon}>
                            {label}
                          </NavigationItem>
                        ))}
                      </ul>
                    </nav>
                  </div>
                  <div className="space-y-4">
                    {/* Navigate to Volunteer Dashboard Button for Small Screens */}
                    <Button
                      onClick={handleNavigateToVolunteer}
                      variant="outline"
                      className="w-full"
                    >
                      Switch to Volunteer
                    </Button>
                    {/* Navigate to User Events Page Button for Small Screens */}
                    <Button
                      onClick={handleNavigateToUser}
                      variant="outline"
                      className="w-full"
                    >
                      Switch to Parishioner
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
