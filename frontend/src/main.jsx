import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import Saved from "./pages/Saved.jsx";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import Opportunities from "./pages/Opportunities.jsx";
import OrgDashboard from "./pages/OrgDashboard.jsx";
import Home from "./pages/Home.jsx";
import OpportunityDetails from "./pages/OpportunityDetails.jsx";
import "./index.css";

// <Route path="/" element={<App />} />
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
         
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/org/dashboard" element={<OrgDashboard />} />
          <Route path="/" element={<Home />} />
          <Route path="/opportunity/:id" element={<OpportunityDetails />} />


        </Routes>
      </BrowserRouter>
    </Auth0Provider>
  </React.StrictMode>
);

