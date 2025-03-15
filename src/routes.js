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

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Protected routes */}
        <Route element={<RouteGuard />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/Users" element={<Users />} />
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
