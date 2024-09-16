// import { useEffect } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
//Layouts

//Core Pages

import { useEffect, useState } from "react";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/dashboard";
// import SignUpPage from "./pages/SignUp";
// import DashboardPage from "./pages/Dashboard";
import GeneralSettings from "./pages/generalsettings"
import Register from "./pages/register";
import Update from "./pages/update";
import Delete from "./pages/delete";


const Router = () => {
    const isAuthentication = useSelector((state) => state.authentication.token);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                {/* <Route path="/SignUp" element={<SignUpPage />} /> */}
                <Route path="/Dashboard" element={<Dashboard />} />
                <Route path="/GeneralSettings" element={<GeneralSettings />} />
                <Route path="/register" element={<Register />} />
                <Route path="/update" element={<Update />} />
                <Route path="/delete" element={<Delete />} />
            </Routes>
        </BrowserRouter>
    );
};

export default Router;