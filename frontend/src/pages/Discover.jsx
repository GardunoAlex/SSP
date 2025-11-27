// pages/Discover.jsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, ChevronDown } from "lucide-react";
import NewNav from "../components/newNav";
import Footer from "../components/Footer";

const Discover = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [activeTab, setActiveTab] = useState("opportunities"); // opportunities, events, organizations
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    classYear: [],
    gpa: "",
    inclusionFocus: [],
    industry: [],
    opportunityType: [],
    location: "all",
    compensation: "",
  });

  // Fetch opportunities on mount and when filters change
  useEffect(() => {
    fetchOpportunities();
  }, [activeTab, filters, searchQuery]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      // API CALL: Fetch opportunities with filters
      // const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/opportunities?search=${searchQuery}&tab=${activeTab}&filters=${JSON.stringify(filters)}`);
      // const data = await response.json();
      // setOpportunities(data);
      
      // Placeholder data
      setOpportunities([]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery });
    } else {
      setSearchParams({});
    }
    fetchOpportunities();
  };

  const handleFilterChange = (category, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes?.(value)
        ? prev[category].filter(item => item !== value)
        : [...(prev[category] || []), value]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      classYear: [],
      gpa: "",
      inclusionFocus: [],
      industry: [],
      opportunityType: [],
      location: "all",
      compensation: "",
    });
  };

  return (
    <div className="min-h-screen bg-cream">
      <NewNav/>

      {/* Hero/Search Section */}
      <section className="relative  py-20 px-8 bg-gradient-to-br from-purple-50 to-cream overflow-hidden">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-conic-gradient(from 0deg at 50% 50%, #F5A623 0deg 90deg, transparent 90deg 180deg)",
            backgroundSize: "100px 100px",
          }}
        ></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 pt-12">
          <h1 className="text-5xl font-bold text-purple-primary mb-4">
            Discover
            <span className="inline-block w-24 h-1 bg-gold ml-4 align-middle rounded-full"></span>
          </h1>
          <p className="text-xl text-purple-dark mb-10">
            Search, Filter, and Connect with the Resources You Need
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative max-w-3xl mx-auto">
              <input
                type="text"
                placeholder="Search for internships, fellowships, organizations, or a specific major..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pr-14 text-lg border-2 border-transparent focus:border-purple-primary bg-white rounded-full shadow-lg focus:shadow-xl transition-all outline-none"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-purple-primary text-white rounded-full flex items-center justify-center hover:bg-gold transition-colors"
              >
                <Search size={20} />
              </button>
            </div>
          </form>

          {/* Quick Filter Tabs */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto">
            <button
              onClick={() => setActiveTab("opportunities")}
              className={`flex-1 px-6 py-3 rounded-full font-semibold text-base transition-all ${
                activeTab === "opportunities"
                  ? "bg-purple-primary text-white shadow-lg"
                  : "bg-white text-purple-dark hover:bg-purple-50"
              }`}
            >
              Opportunities
            </button>
            <button
              onClick={() => setActiveTab("events")}
              className={`flex-1 px-6 py-3 rounded-full font-semibold text-base transition-all ${
                activeTab === "events"
                  ? "bg-purple-primary text-white shadow-lg"
                  : "bg-white text-purple-dark hover:bg-purple-50"
              }`}
            >
              Events
            </button>
            <button
              onClick={() => setActiveTab("organizations")}
              className={`flex-1 px-6 py-3 rounded-full font-semibold text-base transition-all ${
                activeTab === "organizations"
                  ? "bg-purple-primary text-white shadow-lg"
                  : "bg-white text-purple-dark hover:bg-purple-50"
              }`}
            >
              Organizations
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="w-1/4 hidden lg:block">
            <div className="sticky top-32">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-purple-dark flex items-center gap-2">
                    <Filter size={20} className="text-purple-primary" />
                    Filters
                  </h2>
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-purple-primary font-semibold hover:text-gold transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                {/* Filter: Class Year */}
                <details className="mb-4 border-b border-slate-200 pb-4" open>
                  <summary className="flex items-center justify-between font-semibold text-purple-dark mb-3 cursor-pointer">
                    <span>Class Year</span>
                    <ChevronDown size={16} />
                  </summary>
                  <div className="pl-2 space-y-2">
                    {["Freshman", "Sophomore", "Junior", "Senior"].map((year) => (
                      <label key={year} className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.classYear.includes(year)}
                          onChange={() => handleFilterChange("classYear", year)}
                          className="w-4 h-4 text-purple-primary border-slate-300 rounded focus:ring-purple-primary"
                        />
                        <span className="ml-3 text-sm text-slate-700 group-hover:text-purple-primary">
                          {year}
                        </span>
                      </label>
                    ))}
                  </div>
                </details>

                {/* Filter: GPA Requirement */}
                <details className="mb-4 border-b border-slate-200 pb-4">
                  <summary className="flex items-center justify-between font-semibold text-purple-dark mb-3 cursor-pointer">
                    <span>GPA Requirement</span>
                    <ChevronDown size={16} />
                  </summary>
                  <div className="pl-2 space-y-2">
                    {[
                      { label: "Min GPA 3.5+", value: "3.5" },
                      { label: "Min GPA 3.0+", value: "3.0" },
                      { label: "Not Required", value: "none" },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                          name="gpa"
                          checked={filters.gpa === option.value}
                          onChange={() => setFilters(prev => ({ ...prev, gpa: option.value }))}
                          className="w-4 h-4 text-purple-primary border-slate-300 focus:ring-purple-primary"
                        />
                        <span className="ml-3 text-sm text-slate-700 group-hover:text-purple-primary">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </details>

                {/* Filter: Industry/Field */}
                <details className="mb-4 border-b border-slate-200 pb-4">
                  <summary className="flex items-center justify-between font-semibold text-purple-dark mb-3 cursor-pointer">
                    <span>Industry</span>
                    <ChevronDown size={16} />
                  </summary>
                  <div className="pl-2 space-y-2">
                    {["Tech", "Business", "Healthcare", "Arts/Media", "Finance"].map((industry) => (
                      <label key={industry} className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.industry.includes(industry)}
                          onChange={() => handleFilterChange("industry", industry)}
                          className="w-4 h-4 text-purple-primary border-slate-300 rounded focus:ring-purple-primary"
                        />
                        <span className="ml-3 text-sm text-slate-700 group-hover:text-purple-primary">
                          {industry}
                        </span>
                      </label>
                    ))}
                  </div>
                </details>

                {/* Filter: Opportunity Type */}
                <details className="mb-4 border-b border-slate-200 pb-4">
                  <summary className="flex items-center justify-between font-semibold text-purple-dark mb-3 cursor-pointer">
                    <span>Opportunity Type</span>
                    <ChevronDown size={16} />
                  </summary>
                  <div className="pl-2 space-y-2">
                    {["Mentorships", "Fellowships", "Internships", "Full-Time Roles"].map((type) => (
                      <label key={type} className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.opportunityType.includes(type)}
                          onChange={() => handleFilterChange("opportunityType", type)}
                          className="w-4 h-4 text-purple-primary border-slate-300 rounded focus:ring-purple-primary"
                        />
                        <span className="ml-3 text-sm text-slate-700 group-hover:text-purple-primary">
                          {type}
                        </span>
                      </label>
                    ))}
                  </div>
                </details>

                {/* Filter: Location */}
                <details className="mb-4 border-b border-slate-200 pb-4">
                  <summary className="flex items-center justify-between font-semibold text-purple-dark mb-3 cursor-pointer">
                    <span>Location</span>
                    <ChevronDown size={16} />
                  </summary>
                  <div className="pl-2">
                    <select
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-purple-primary"
                    >
                      <option value="all">All Locations</option>
                      <option value="remote">Remote</option>
                      <option value="local">Local</option>
                      <option value="national">National</option>
                      <option value="international">International</option>
                    </select>
                  </div>
                </details>

                {/* Filter: Compensation */}
                <details className="mb-2">
                  <summary className="flex items-center justify-between font-semibold text-purple-dark mb-3 cursor-pointer">
                    <span>Compensation</span>
                    <ChevronDown size={16} />
                  </summary>
                  <div className="pl-2 space-y-2">
                    {[
                      { label: "Paid", value: "paid" },
                      { label: "Stipend", value: "stipend" },
                      { label: "Unpaid", value: "unpaid" },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                          name="compensation"
                          checked={filters.compensation === option.value}
                          onChange={() => setFilters(prev => ({ ...prev, compensation: option.value }))}
                          className="w-4 h-4 text-purple-primary border-slate-300 focus:ring-purple-primary"
                        />
                        <span className="ml-3 text-sm text-slate-700 group-hover:text-purple-primary">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </details>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden fixed bottom-6 right-6 z-40 bg-purple-primary text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
          >
            <Filter size={20} />
            Filters
          </button>

          {/* Content Grid */}
          <section className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-purple-dark">
                  {activeTab === "opportunities" && "Featured Opportunities"}
                  {activeTab === "events" && "Upcoming Events"}
                  {activeTab === "organizations" && "Partner Organizations"}
                </h3>
                <p className="text-slate-600 mt-1">
                  {loading ? "Loading..." : `${opportunities.length} results found`}
                </p>
              </div>
              <select className="px-4 py-2 border border-slate-300 rounded-full text-sm font-medium focus:outline-none focus:border-purple-primary">
                <option>Most Relevant</option>
                <option>Deadline Soon</option>
                <option>Recently Added</option>
                <option>Highest Paid</option>
              </select>
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block w-12 h-12 border-4 border-purple-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-purple-dark mt-4">Loading opportunities...</p>
              </div>
            ) : opportunities.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl">
                <p className="text-xl text-slate-600 mb-4">No results found</p>
                <p className="text-slate-500">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Placeholder cards - API CALL: Map through opportunities data here */}
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-primary overflow-hidden"
                  >
                    {/* Placeholder image */}
                    <div className="h-48 bg-gradient-to-br from-purple-200 to-gold/30"></div>
                    <div className="p-6">
                      <div className="h-6 bg-slate-200 rounded mb-3"></div>
                      <div className="h-4 bg-slate-100 rounded mb-2"></div>
                      <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && opportunities.length > 0 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                  Previous
                </button>
                <button className="px-4 py-2 bg-purple-primary text-white rounded-lg font-semibold">
                  1
                </button>
                <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                  2
                </button>
                <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                  3
                </button>
                <span className="px-2 text-slate-400">...</span>
                <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                  Next
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Discover;