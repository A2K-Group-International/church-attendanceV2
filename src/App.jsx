import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./authentication/ProtectedRoute";
import Home from "./pages/Home";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Attendance from "./pages/admin/Attendance";
import UsersPage from "./pages/admin/UserPage";
import Schedule from "./pages/admin/Schedule";
import EventsPage from "./pages/user/EventsPage";
import FamilyPage from "./pages/user/FamilyPage";
import EventInfo from "./pages/user/EventInfo";

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
          path="/schedule"
          element={
            <ProtectedRoute>
              <Schedule />
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
      </Routes>
    </Router>
  );
}

export default App;
