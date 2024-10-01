import { useCallback, useState, useEffect } from "react";
import Logout from "../../authentication/Logout";
import { Sheet, SheetTrigger, SheetContent } from "../../shadcn/sheet";
import { Button } from "../../shadcn/button";
import NavigationItem from "../NavigationItem";
import DashboardIcon from "../../assets/svg/dashboard.svg";
import HamburgerIcon from "../../assets/svg/hamburgerIcon.svg";
import { useUser } from "../../authentication/useUser";
import supabase from "../../api/supabase"; // Ensure you have imported supabase

const volunteerLinks = [
  { link: "/volunteer-dashboard", label: "Dashboard", icon: DashboardIcon },
  {
    link: "/volunteer-announcements",
    label: "Announcements",
    icon: DashboardIcon,
  },
  { link: "/volunteer-events", label: "Events", icon: DashboardIcon },
];

export default function VolunteerSidebar({ children }) {
  const { user } = useUser();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  const fetchUserData = useCallback(async () => {
    try {
      const { data: fetchedUserData, error: userError } = await supabase
        .from("user_list")
        .select("user_id")
        .eq("user_uuid", user.id)
        .single();

      if (userError) throw userError;
      setUserData(fetchedUserData);
    } catch (error) {
      setError("Error fetching user data. Please try again.");
      console.error("Error in fetchUserData function:", error);
    }
  }, [user]);

  // Fetch user data when component mounts
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user, fetchUserData]);

  return (
    <div className="flex h-screen w-full">
      {/* Large screens */}
      <div className="hidden lg:block lg:w-64 lg:shrink-0 lg:border-r lg:bg-gray-100 dark:lg:bg-gray-800">
        <div className="flex h-full flex-col justify-between px-4 py-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2 font-bold">
              <span className="text-xl">Volunteer Management Centre</span>
            </div>
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
                        {volunteerLinks.map(({ link, label, icon }) => (
                          <NavigationItem key={link} link={link} icon={icon}>
                            {label}
                          </NavigationItem>
                        ))}
                      </ul>
                    </nav>
                  </div>
                  <div className="space-y-4">
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
