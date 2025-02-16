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
import HomePage from "./pages/liff/Login";

const ProtectedRoute = ({ children }) => {
  // เช็คเฉพาะ userData แทนการเช็คทั้ง token และ userData2
  const userData = localStorage.getItem('userData');

  if (!userData) {
    // ลบข้อมูล authentication ทั้งหมดเพื่อป้องกันการ redirect วนซ้ำ
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('userData2');
    return <Navigate to="/" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  // เช็คเฉพาะ userData เช่นกัน
  const userData = localStorage.getItem('userData');

  if (userData) {
    try {
      // ตรวจสอบความถูกต้องของ userData
      JSON.parse(userData);
      return <Navigate to="/dashboard" replace />;
    } catch (error) {
      // ถ้า userData ไม่ถูกต้อง ให้ลบทิ้ง
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.removeItem('userData2');
    }
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
        {/* LIFF route ไม่ต้องมีการ protect */}
        <Route path="/liff" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;