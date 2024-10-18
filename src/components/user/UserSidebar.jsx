import { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import Logout from "../../authentication/Logout";
import { Sheet, SheetTrigger, SheetContent } from "../../shadcn/sheet";
import { Button } from "../../shadcn/button";
import NavigationItem from "../NavigationItem";
import FamilyIcon from "../../assets/svg/family.svg";
import CalendarIcon from "../../assets/svg/calendarIcon.svg";
import HamburgerIcon from "../../assets/svg/hamburgerIcon.svg";
import { useUser } from "../../authentication/useUser"; // Import useUser to get the current user
import useUserData from "../../api/useUserData"; // Import useUserData to fetch user data

const userLinks = [
  { link: "/user-announcements", label: "Announcements", icon: CalendarIcon },
  { link: "/events-page", label: "Events", icon: CalendarIcon },
  { link: "/family", label: "Family", icon: FamilyIcon },
];

export default function UserSidebar({ children }) {
  const { user } = useUser(); // Get the current user
  const { userData, error } = useUserData(user ? user.id : null); // Get user data
  const navigate = useNavigate(); // Initialize useNavigate for navigation

  useEffect(() => {
    if (error) {
      console.error("Error fetching user data:", error);
    }
  }, [error]);

  const handleSwitchToVolunteer = () => {
    navigate("/volunteer-announcements"); // Navigate to the volunteer announcements page
  };

  const handleReturnToAdmin = () => {
    navigate("/admin-dashboard"); // Navigate to the Admin dashboard
  };

  return (
    <div className="flex h-screen w-full overflow-y-clip">
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
                {userLinks.map(({ link, label, icon }) => (
                  <NavigationItem key={link} link={link} icon={icon}>
                    {label}
                  </NavigationItem>
                ))}
              </ul>
            </nav>
          </div>
          <div className="space-y-4">
            {/* Switch to Volunteer Button */}
            {(userData?.user_role === "volunteer" ||
              userData?.user_role === "admin") && (
              <Button
                onClick={handleSwitchToVolunteer}
                variant="outline"
                className="w-full" // Add full width for better layout
              >
                Switch to Volunteer
              </Button>
            )}

            {/* Return to Admin Button */}
            {userData?.user_role === "admin" && (
              <Button
                onClick={handleReturnToAdmin}
                variant="outline"
                className="w-full" // Add full width for better layout
              >
                Return to Admin
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
                        {userLinks.map(({ link, label, icon }) => (
                          <NavigationItem key={link} link={link} icon={icon}>
                            {label}
                          </NavigationItem>
                        ))}
                      </ul>
                    </nav>
                  </div>
                  <div className="space-y-4">
                    {/* Switch to Volunteer Button for Small Screens */}
                    {(userData?.user_role === "volunteer" ||
                      userData?.user_role === "admin") && (
                      <Button
                        onClick={handleSwitchToVolunteer}
                        variant="outline"
                        className="w-full" // Add full width for better layout
                      >
                        Switch to Volunteer
                      </Button>
                    )}

                    {/* Return to Admin Button for Small Screens */}
                    {userData?.user_role === "admin" && (
                      <Button
                        onClick={handleReturnToAdmin}
                        variant="outline"
                        className="w-full" // Add full width for better layout
                      >
                        Return to Admin
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
        {error && <div className="error-message">{error}</div>}{" "}
        {/* Display error message if any */}
      </div>
    </div>
  );
}
