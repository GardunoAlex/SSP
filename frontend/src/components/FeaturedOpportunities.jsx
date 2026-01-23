// components/FeaturedOpportunities.jsx
import { Link } from "react-router-dom";
import OpportunitiesFeed from "./OpportunitiesFeed";

const FeaturedOpportunities = () => {
  return (
    <section className="relative py-20 px-8 bg-cream overflow-hidden">
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-conic-gradient(from 0deg at 50% 50%, #F5A623 0deg 90deg, transparent 90deg 180deg)",
          backgroundSize: "100px 100px",
        }}
      ></div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-purple-primary mb-4 inline-block relative">
            Featured Opportunities
            <div className="absolute -bottom-1 left-0 w-32 h-1 bg-gold rounded-full"></div>
          </h2>
          <p className="text-xl text-purple-dark mt-6">
            Discover mentorships and programs - sign in to save and apply
          </p>
        </div>
        <OpportunitiesFeed />
      </div>
    </section>
  );
};

export default FeaturedOpportunities;