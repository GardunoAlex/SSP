import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Hero from "../components/Hero";
import NewNav from "../components/newNav.jsx";
import OpportunitiesFeed from "../components/OpportunitiesFeed";
import WhatWeDo from "../components/WhatWeDo.jsx";
import Footer from "../components/Footer.jsx";

const Opportunities = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Whenever searchTerm changes, update the URL
  useEffect(() => {
    if (searchTerm) {
      setSearchParams({ search: searchTerm });
    } else {
      setSearchParams({});
    }
  }, [searchTerm, setSearchParams]);

  return (
    <div className="bg-cream min-h-screen">
      <NewNav />
      <Hero searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      <section id="feed" className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-purple-primary mb-2 inline-block relative">
            Available Opportunities
            <div className="absolute -bottom-1 left-0 w-24 h-1 bg-gold rounded-full"></div>
          </h2>
          <p className="text-lg text-purple-dark mt-6">
            {searchTerm
              ? `Showing results for "${searchTerm}"`
              : "Discover opportunities tailored for you"}
          </p>
        </div>
        <OpportunitiesFeed searchTerm={searchTerm} />
      </section>
      <WhatWeDo />
      <Footer />
    </div>
  );
};

export default Opportunities;