
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import OpportunitiesFeed from "../components/OpportunitiesFeed";


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
    <div>
      <Navbar />
      <Hero searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <section id="feed" className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Available Opportunities
        </h2>
        <OpportunitiesFeed searchTerm={searchTerm} />
      </section>
    </div>
  );
};

export default Opportunities;
