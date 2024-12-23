import { Route, Routes, BrowserRouter, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GeneralSettings from "./pages/Generalsettings";
import Register from "./pages/register";
import Settings from "./pages/Settings";
import UserSettings from "./pages/Usersettings";
import Warehouse from "./pages/Warehouse";
import Restaurant from "./pages/Restaurant"
import Room4Room5 from "./pages/Room4Room5"

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.authentication.token);
  const userData = localStorage.getItem('userData2');

  if (!isAuthenticated && !userData) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.authentication.token);
  const userData = localStorage.getItem('userData2');

  if (isAuthenticated || userData) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/generalsettings" element={
          <ProtectedRoute>
            <GeneralSettings />
          </ProtectedRoute>
        } />
        <Route path="/register" element={
          <ProtectedRoute>
            <Register />
          </ProtectedRoute>
        } />
        <Route path="/usersettings" element={
          <ProtectedRoute>
            <UserSettings />
          </ProtectedRoute>
        } />
        <Route path="/warehouse" element={
          <ProtectedRoute>
            <Warehouse />
          </ProtectedRoute>
        } />
        <Route path="/restaurant" element={
          <ProtectedRoute>
            <Restaurant />
          </ProtectedRoute>
        } />
        <Route path="/kitchen" element={
          <ProtectedRoute>
            <Room4Room5 />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;