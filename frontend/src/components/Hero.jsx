import { Search } from "lucide-react"; // lightweight icon library (optional)
                                          
const Hero = ({ searchTerm, setSearchTerm }) => {
  return (
    <section className="bg-gray-50 py-20 ">
      <div className="max-w-5xl mx-auto text-center px-4 pt-20">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          Find Your Next{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
            Opportunity
          </span>
        </h1>

        <p className="text-lg text-gray-600 mb-10">
          Discover internships, mentorships, and scholarships tailored for students like you.
        </p>

        {/* Search bar */}
        <div className="flex justify-center mb-12">
          <div className="relative w-full max-w-lg">
            <input
              type="text"
              placeholder="Search for opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
