import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Hero from "../components/Hero.jsx";
import NewNav from "../components/newNav.jsx";
import WhatWeDo from "../components/WhatWeDo.jsx";
import Footer from "../components/Footer.jsx";
import Features from "../components/Features.jsx";
import FeaturedOpportunities from "../components/FeaturedOpportunities.jsx";
import { useAuth0 } from "@auth0/auth0-react";
import LoadingScreen from "../components/LoadingScreen";

const Landing = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const { user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const role = user["https://studentstarter.com/role"];
      
      if (role === "org") {
        navigate("/org/dashboard");
      } else if (role === "student") {
        navigate("/discover");
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="bg-cream min-h-screen">
      <NewNav />
      <Hero />
      <Features />
      <WhatWeDo />
      <Footer />
    </div>
  );
};

export default Landing;