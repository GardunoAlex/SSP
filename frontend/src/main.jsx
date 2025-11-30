import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Discover from "./pages/Discover.jsx";
import Saved from "./pages/Saved.jsx";
import OpportunityDetails from "./pages/OpportunityDetails.jsx";
import OrgDashboard from "./pages/OrgDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Signup from "./pages/SignUp.jsx";
import Auth from "./pages/Auth.jsx";
import "./index.css";
import ScrollToTop from "./components/ScrollToTop.jsx";

// TODO: Create these placeholder pages
import StudentDashboard from "./pages/StudentDashboard.jsx";
// import Stories from "./pages/Stories.jsx";
// import Organizations from "./pages/Organizations.jsx";
// import Profile from "./pages/Profile.jsx";
// import Settings from "./pages/Settings.jsx";
// import Resume from "./pages/Resume.jsx";

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
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/opportunity/:id" element={<OpportunityDetails />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth" element={<Auth />} />

          {/* Student Routes */}
          <Route path="/saved" element={<Saved />} />
          <Route path="/organizations" element={<div>Organizations Page - Coming Soon</div>} />
          <Route path="/profile" element={<div>Profile Page - Coming Soon</div>} />
          <Route path="/settings" element={<div>Settings Page - Coming Soon</div>} />

          {/* Organization Routes */}
          <Route path="/org/dashboard" element={<OrgDashboard />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </Auth0Provider>
  </React.StrictMode>
);