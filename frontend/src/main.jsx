import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import Saved from "./pages/Saved.jsx";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import Opportunities from "./pages/Opportunities.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/saved" element={<Saved />} />

        </Routes>
      </BrowserRouter>
    </Auth0Provider>
  </React.StrictMode>
);

