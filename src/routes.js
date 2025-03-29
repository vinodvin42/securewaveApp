import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Users from "./components/Users";
import Login from "./components/Login";
import RouteGuard from "./components/RouteGuard"; // Assuming RouteGuard is a custom component
import ResourceManagement from "./components/Resource/ResourceManagement";
import Sessions from "./components/session";
import AccessRequests from "./components/access-requests";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Protected routes */}
        <Route element={<RouteGuard />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/resources" element={<ResourceManagement />} />
          <Route path="/session" element={<Sessions />} />
          <Route path="/access-requests" element={<AccessRequests />} />
        </Route>

        {/* Public Route - Login */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Users />} />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
