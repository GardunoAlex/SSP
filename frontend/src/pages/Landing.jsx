import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Hero from "../components/Hero.jsx";
import NewNav from "../components/newNav.jsx";
import WhatWeDo from "../components/WhatWeDo.jsx";
import Footer from "../components/Footer.jsx";
import Features from "../components/Features.jsx";
import FeaturedOpportunities from "../components/FeaturedOpportunities.jsx";

const Landing = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Whenever searchTerm changes, update the URL

  return (
    <div className="bg-cream min-h-screen">
      <NewNav />
      <Hero searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <FeaturedOpportunities />
      <Features />
      <WhatWeDo />
      <Footer />
    </div>
  );
};

export default Landing;