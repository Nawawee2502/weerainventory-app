// import { useEffect } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
//Layouts

//Core Pages

import { useEffect, useState } from "react";
import LoginPage from "./pages/LoginTest";
// import SignUpPage from "./pages/SignUp";
// import DashboardPage from "./pages/Dashboard";


const Router = () => {
    const isAuthentication = useSelector((state) => state.authentication.token);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                {/* <Route path="/SignUp" element={<SignUpPage />} /> */}
                {/* <Route path="/Dashboard" element={<DashboardPage />} /> */}
            </Routes>
        </BrowserRouter>
    );
};

export default Router;