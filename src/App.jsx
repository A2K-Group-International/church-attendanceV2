import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./authentication/ProtectedRoute";
import Home from "./pages/Home";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Attendance from "./pages/admin/Attendance";
import UsersPage from "./pages/admin/UserPage";
import Schedule from "./pages/admin/Schedule";
import AdminCalendar from "./pages/admin/AdminCalendar";
import EventsPage from "./pages/user/EventsPage";
import FamilyPage from "./pages/user/FamilyPage";
import EventInfo from "./pages/user/EventInfo";
import VolunteersPage from "./pages/admin/VolunteersPage";
import GroupsPage from "./pages/admin/GroupsPage";
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";
import VolunteerEvents from "./pages/volunteer/VolunteerEvents";
import VolunteerAnnouncements from "./pages/volunteer/VolunteerAnnouncements";
import VolunteerAnnouncementsInfo from "./pages/volunteer/VolunteerAnnoucementsInfo";
import VolunteerProfile from "./pages/volunteer/VolunteerProfile";
import VolunteerDuties from "./pages/volunteer/VolunteerDuties";
import CategoryPage from "./pages/admin/CategoryPage";
import VolunteerClasses from "./pages/volunteer/VolunteerClasses";
import VolunteerClass from "./pages/volunteer/VolunteerClass";
import VolunteerUpload from "./pages/volunteer/VolunteerUpload";
import CategoryPage from "./pages/admin/CategoryPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteers"
          element={
            <ProtectedRoute>
              <VolunteersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <GroupsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <Schedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-calendar"
          element={
            <ProtectedRoute>
              <AdminCalendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <CategoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events-page"
          element={
            <ProtectedRoute>
              <EventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/event-info/:eventId"
          element={
            <ProtectedRoute>
              <EventInfo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/family"
          element={
            <ProtectedRoute>
              <FamilyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer-dashboard"
          element={
            <ProtectedRoute>
              <VolunteerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer-events"
          element={
            <ProtectedRoute>
              <VolunteerEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer-announcements"
          element={
            <ProtectedRoute>
              <VolunteerAnnouncements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer-announcements-info/:postId"
          element={
            <ProtectedRoute>
              <VolunteerAnnouncementsInfo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer-duties"
          element={
            <ProtectedRoute>
              <VolunteerDuties />
            </ProtectedRoute>
          }
        />

        <Route
          path="/volunteer-profile"
          element={
            <ProtectedRoute>
              <VolunteerProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer-classes"
          element={
            <ProtectedRoute>
              <VolunteerClasses />
            </ProtectedRoute>
          }
        />
        <Route 
        path="/volunteer-classes/:id" 
        element={<VolunteerClass />} />
          path="/volunteer-upload"
          element={
            <ProtectedRoute>
              <VolunteerUpload />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
