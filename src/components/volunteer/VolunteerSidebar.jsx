import { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import Logout from "../../authentication/Logout";
import { Sheet, SheetTrigger, SheetContent } from "../../shadcn/sheet";
import { Button } from "../../shadcn/button";
import NavigationItem from "../NavigationItem";
import DashboardIcon from "../../assets/svg/dashboard.svg";
import HamburgerIcon from "../../assets/svg/hamburgerIcon.svg";
import CalendarIcon from "../../assets/svg/calendarIcon.svg";
import ChurchIcon from "../../assets/svg/churchIcon.svg";
import PersonIcon from "../../assets/svg/person.svg";
import UploadIcon from "../../assets/svg/upload.svg";
import { useUser } from "../../authentication/useUser";
import useUserData from "../../api/useUserData";
import blackboard from "../../assets/svg/blackboard.svg"

const volunteerLinks = [
  {
    link: "/volunteer-announcements",
    label: "Announcements",
    icon: ChurchIcon,
  },
  { link: "/volunteer-dashboard", label: "Dashboard", icon: DashboardIcon },
  { link: "/volunteer-duties", label: "Duties", icon: PersonIcon },
  { link: "/volunteer-schedule", label: "Schedule", icon: CalendarIcon },
  { link: "/volunteer-upload", label: "Upload", icon: UploadIcon },
  { link: "/volunteer-profile", label: "Profile", icon: PersonIcon },
  { link: "/volunteer-classes", label: "Classes", icon: blackboard },
];

export default function VolunteerSidebar({ children }) {
  const { user } = useUser(); // Get the current user
  const { userData, error } = useUserData(user ? user.id : null); // Get user data using useUserData
  const navigate = useNavigate(); // Initialize useNavigate for navigation

  useEffect(() => {
    if (error) {
      console.error("Error fetching user data:", error);
    }
  }, [error]);

  const handleSwitchToParishoner = () => {
    navigate("/events-page"); // Navigate to the events page
  };

  return (
    <div className="flex h-screen overflow-y-clip w-full">
      {/* Large screens */}
      <div className="hidden lg:block lg:w-64 lg:shrink-0 lg:border-r lg:bg-gray-100 dark:lg:bg-gray-800">
        <div className="flex h-full flex-col justify-between px-4 py-6">
          <div className="space-y-6">
            {/* Welcome Message */}
            {userData && (
              <div className="mt-2 flex flex-col">
                <span className="text-lg font-semibold">Welcome,</span>
                <span className="text-xl font-bold">
                  {userData.user_name} {userData.user_last_name}
                </span>
              </div>
            )}
            <nav className="space-y-1">
              <ul>
                {volunteerLinks.map(({ link, label, icon }) => (
                  <NavigationItem key={link} link={link} icon={icon}>
                    {label}
                  </NavigationItem>
                ))}
              </ul>
            </nav>
          </div>
          <div className="space-y-4">
            {/* Switch to Parishoner Button */}
            {userData?.user_role === "volunteer" && (
              <Button
                onClick={handleSwitchToParishoner}
                variant="outline"
                className="w-full" // Add full width for better layout
              >
                Switch to Parishoner
              </Button>
            )}
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
                    {/* Welcome Message for Small Screens */}
                    {userData && (
                      <div className="mt-2 flex flex-col">
                        <span className="text-lg font-semibold">Welcome,</span>
                        <span className="text-xl font-bold">
                          {userData.user_name} {userData.user_last_name}
                        </span>
                      </div>
                    )}
                    <nav className="space-y-1">
                      <ul>
                        {volunteerLinks.map(({ link, label, icon }) => (
                          <NavigationItem key={link} link={link} icon={icon}>
                            {label}
                          </NavigationItem>
                        ))}
                      </ul>
                    </nav>
                  </div>
                  <div className="space-y-4">
                    {/* Switch to Parishoner Button for Small Screens */}
                    {userData?.user_role === "volunteer" && (
                      <Button
                        onClick={handleSwitchToParishoner}
                        variant="outline"
                        className="w-full" // Add full width for better layout
                      >
                        Switch to Parishoner
                      </Button>
                    )}
                    <Logout />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>
        {children}
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}
