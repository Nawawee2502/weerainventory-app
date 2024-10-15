// React
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";

//Redux Set up
import { Provider, useDispatch, useSelector } from "react-redux";
import { store, persistor } from "./store";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
// Router
import Routes from "./router";

// CSS
import "./index.css";
import "@fontsource/prompt"; // Defaults to weight 400
import "@fontsource/prompt/400.css"; // Specify weight
import "@fontsource/prompt/400-italic.css"; // Specify weight and style
import { createTheme, ThemeProvider } from "@mui/material/styles";

//LoadingPage
import { LoadingPage } from "./components/loading-pages";
import { PersistGate } from "redux-persist/integration/react";

import Layout from "./layouts/Layout";

const theme = createTheme({
  typography: {
    fontFamily: ['"Prompt"'].join(","),
  },
});

let token = "";
let isAuthentication = "";
export const Init = () => {
  const token = useSelector((state) => state.authentication.token);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('----------isAuth----- Dashboard');
    console.log(token);
    if (token) {
      isAuthentication = true;
      console.log('----------isAuthentication-----' + isAuthentication);
    }

  }, [token]);
};

// document.title = "Weera Inventory";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <Init></Init>
      <Suspense fallback={<LoadingPage />}>
        <ThemeProvider theme={theme}>
          {/* {isAuthentication ? (
                <Routes />
          ) : (
           <Layout/>
          )} */}
          <Routes />
        </ThemeProvider>
      </Suspense>
    </PersistGate>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();