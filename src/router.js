// import { useEffect } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
//Layouts

//Core Pages

import { useEffect, useState } from "react";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
// import SignUpPage from "./pages/SignUp";
// import DashboardPage from "./pages/Dashboard";
import GeneralSettings from "./pages/Generalsettings"
import Register from "./pages/register";
import Settings from "./pages/Settings";
import UserSettings from "./pages/Usersettings";
import Warehouse from "./pages/Warehouse";


const Router = () => {
    const isAuthentication = useSelector((state) => state.authentication.token);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                {/* <Route path="/SignUp" element={<SignUpPage />} /> */}
                <Route path="/settings" element={<Settings />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/generalsettings" element={<GeneralSettings />} />
                <Route path="/register" element={<Register />} />
                <Route path="/usersettings" element={<UserSettings />} />
                <Route path="/warehouse" element={<Warehouse />}/>
            </Routes>
        </BrowserRouter>
    );
};

export default Router;