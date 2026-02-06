// pages/Discover.jsx
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, ChevronDown, ArrowLeft, ArrowRight } from "lucide-react";
import NewNav from "../components/newNav";
import apiCache, { fetchWithCache, clearCached } from "../lib/apiCache";
import useLocalStorage from "../hooks/useLocalStorage";
import { getSupabaseUser } from "../lib/apiHelpers";
import { useAuth0 } from "@auth0/auth0-react";
import Footer from "../components/Footer";
import OrganizationModal from "../components/OrganizationModal";
import { DiscoverSkeleton } from "../components/Skeletons";

const CARDS_PER_PAGE = 12;
const MAX_VISIBLE_PAGES = 5;
const MIN_LOAD_MS = 300;
const Discover = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [activeTab, setActiveTab] = useState("opportunities"); // opportunities, events, organizations
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const { user, getAccessTokenSilently, isAuthenticated, loginWithRedirect } = useAuth0();
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [cachedSupaUser, setCachedSupaUser] = useLocalStorage("supaUser", null);
  const [savedOrgIds, setSavedOrgIds] = useLocalStorage("savedOrgIds", []);
  const [savingOrgIds, setSavingOrgIds] = useState([]);
  const [orgOpportunities, setOrgOpportunities] = useState([]);
  const [loadingOrgDetails, setLoadingOrgDetails] = useState(false);
  const [savedOppIds, setSavedOppIds] = useLocalStorage("savedOppIds", []);
  const [savingOppIds, setSavingOppIds] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  // Filter states (existing)
  const [filters, setFilters] = useState({
    classYear: [],
    gpa: "",
    inclusionFocus: [],
    industry: [],
    opportunityType: [],
    location: "all",
    compensation: "",
  });

  // Reset page whenever activeTab, filters, or searchQuery changes
  useEffect(() => {
    setCurrentPage(1);
    fetchOpportunities();
  }, [activeTab, filters, searchQuery]);

  // Fetch saved organizations IDs for the current user when auth changes
  useEffect(() => {
    const fetchSavedIds = async () => {
      if (!user) return;
      try {
        const supaUser = cachedSupaUser || await getSupabaseUser(getAccessTokenSilently);
        if (!cachedSupaUser && supaUser?.id) setCachedSupaUser(supaUser);
        const userId = supaUser?.id;
        if (!userId) return setSavedOrgIds([]);
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/savedOrgs/${userId}`);
        const data = await res.json();
        setSavedOrgIds(data.map((o) => String(o.id)));
      } catch (err) {
        console.error("Discover: failed to fetch saved org ids", err);
      }
    };
    fetchSavedIds();
  }, [user]);

  // Fetch saved opportunities IDs for the current user when auth changes
  useEffect(() => {
    const fetchSavedOppIds = async () => {
      if (!user) return;
      try{
        const supaUser = cachedSupaUser || await getSupabaseUser(getAccessTokenSilently);
        if (!cachedSupaUser && supaUser?.id) setCachedSupaUser(supaUser);
        const userId = supaUser?.id;
        if (!userId) return setSavedOppIds([]);

        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/saved/${userId}`);
        const data = await res.json();
        console.log("Fetched saved opps data:", data);
        setSavedOppIds(data.map((opportunity) => String(opportunity.id)));
      } catch (err) {
        console.error("Discover: failed to fetch saved opportunity ids", err);
      }
    };
    fetchSavedOppIds();
  }, [user]);

  // Listen for changes from other parts of the app (e.g., modal saves)
  useEffect(() => {
    const listener = (e) => {
      console.debug("Discover: savedOrgChanged", e?.detail);
      // re-fetch saved ids so cards reflect changes
      if (user) {
        (async () => {
          try {
            const supaUser = cachedSupaUser || await getSupabaseUser(getAccessTokenSilently);
            if (!cachedSupaUser && supaUser?.id) setCachedSupaUser(supaUser);
            const userId = supaUser?.id;
            if (!userId) return setSavedOrgIds([]);
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/savedOrgs/${userId}`);
            const data = await res.json();
            setSavedOrgIds(data.map((o) => String(o.id)));
          } catch (err) {
            console.error("Discover: failed to refresh saved org ids", err);
          }
        })();
      }
    };
    window.addEventListener("savedOrgChanged", listener);
    return () => window.removeEventListener("savedOrgChanged", listener);
  }, [user]);

  const fetchOpportunities = async () => {
    setLoading(true);
    const minDelay = new Promise(r => setTimeout(r, MIN_LOAD_MS));
    try {
      let data = [];
      if (activeTab === "organizations") {
        const key = `organizations`;
        try {
          data = await fetchWithCache(key, `${import.meta.env.VITE_API_BASE_URL}/api/organizations`);
        } catch (err) {
          console.error('Discover: failed to fetch organizations', err);
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/organizations`);
          if (response.ok) {
            data = await response.json();
          }
        }
      } else if (activeTab === "opportunities") {
        const key = `opportunities:${JSON.stringify(filters)}`;
        try {
          data = await fetchWithCache(key, `${import.meta.env.VITE_API_BASE_URL}/api/opportunities`);
        } catch (err) {
          console.error('Discover: failed to fetch opportunities', err);
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/opportunities`);
          if (response.ok) {
            data = await response.json();
          }
        }
      }
      setOpportunities(data);
      await minDelay;
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      await minDelay;
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgOpportunities = async (orgId) => {
    setLoadingOrgDetails(true);
    try {
      const key = `orgOpp:${orgId}`;
      let data;
      try {
        data = await fetchWithCache(key, `${import.meta.env.VITE_API_BASE_URL}/api/opportunities/org/${orgId}`);
      } catch (err) {
        console.error('Discover: fetch org opps cache failed', err);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/opportunities/org/${orgId}`);
        if (response.ok) {
          data = await response.json();
        }
      }
      setOrgOpportunities(data);
      setLoadingOrgDetails(false);
    } catch (error) {
      console.error("Error fetching organization opportunities:", error);
      setOrgOpportunities([]);
      setLoadingOrgDetails(false);
    }
  };

  const handleOrgClick = (org) => {
    setSelectedOrg(org);
    fetchOrgOpportunities(org.id);
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery });
    } else {
      setSearchParams({});
    }
    // Re-trigger useEffect to fetch and reset page
  };

  const handleToggleSaveOpp = async (e, opp) => {
    e.stopPropagation();
    try {
      if (!isAuthenticated) {
        loginWithRedirect();
        return;
      }

      // avoid double-saving or unsaving
      if (savingOppIds.includes(String(opp.id))) return;  
      setSavingOppIds(prev => [...prev, String(opp.id)]);

      const supaUser = cachedSupaUser || await getSupabaseUser(getAccessTokenSilently);
      if (!cachedSupaUser && supaUser?.id) setCachedSupaUser(supaUser);
      const userId = supaUser?.id;
      if (!userId) throw new Error('Unable to get user id');
      const alreadySaved = savedOppIds.includes(String(opp.id));
      if (!alreadySaved) {
        //Save
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/saved`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, opportunity_id: opp.id }),
        });
        if (!res.ok) throw new Error('Failed to save opportunity');
        setSavedOppIds(prev => Array.from(new Set([...prev, String(opp.id)])));
        clearCached(`savedOps:${userId}`);
      } else {
        //Unsave
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/saved`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, opportunity_id: opp.id }),
        });
        if (!res.ok) throw new Error('Failed to unsave opportunity');
        setSavedOppIds(prev => prev.filter(id => id !== String(opp.id)));
        clearCached(`savedOps:${userId}`);
      }
    } catch (err) {
      console.error('Discover: toggle saved opportunity failed', err);
      alert('Failed to update saved opportunity. Please try again.');
    } finally {
      setSavingOppIds(prev => prev.filter(id => id !== String(opp.id)));
    }
  };
  const handleToggleSaveOrg = async (org) => {
    try {
      if (!isAuthenticated) {
        loginWithRedirect();
        return;
      }

      // avoid double-saving or unsaving
      if (savingOrgIds.includes(String(org.id))) return;
      setSavingOrgIds(prev => [...prev, String(org.id)]);

      const supaUser = cachedSupaUser || await getSupabaseUser(getAccessTokenSilently);
      if (!cachedSupaUser && supaUser?.id) setCachedSupaUser(supaUser);
      const userId = supaUser?.id;
      if (!userId) throw new Error('Unable to get user id');
      if (!userId) throw new Error('Unable to get user id');

      const alreadySaved = savedOrgIds.includes(String(org.id));
      if (!alreadySaved) {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/savedOrgs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, org_id: org.id }),
        });
        if (!res.ok) throw new Error('Failed to save org');
        setSavedOrgIds(prev => Array.from(new Set([...prev, String(org.id)])));
        clearCached(`savedOrgs:${userId}`);
        window.dispatchEvent(new CustomEvent('savedOrgChanged', { detail: { orgId: org.id, saved: true } }));
      } else {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/savedOrgs`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, org_id: org.id }),
        });
        if (!res.ok) throw new Error('Failed to unsave org');
        setSavedOrgIds(prev => prev.filter(id => id !== String(org.id)));
        clearCached(`savedOrgs:${userId}`);
        window.dispatchEvent(new CustomEvent('savedOrgChanged', { detail: { orgId: org.id, saved: false } }));
      }
    } catch (err) {
      console.error('Discover: toggle saved org failed', err);
    } finally {
      setSavingOrgIds(prev => prev.filter(id => id !== String(org.id)));
    }
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

  const totalPages = Math.ceil(opportunities.length / CARDS_PER_PAGE);

  const currentCards = useMemo(() => {
    const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
    const endIndex = startIndex + CARDS_PER_PAGE;
    return opportunities.slice(startIndex, endIndex);
  }, [opportunities, currentPage]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      document.getElementById('content-start')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getVisiblePages = () => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    const startPage = Math.max(2, currentPage - Math.floor(MAX_VISIBLE_PAGES / 2) + 1);
    const endPage = Math.min(totalPages - 1, startPage + MAX_VISIBLE_PAGES - 3);

    pages.push(1); // Always show first page

    if (startPage > 2) {
      pages.push('...'); 
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      pages.push('...'); // Right ellipsis
    }

    if (!pages.includes(totalPages)) {
      pages.push(totalPages); // Always show last page
    }

    // Filter out duplicate ellipses and adjacent page numbers/ellipses
    return pages.filter((page, index, array) => {
        if (page === '...' && (array[index - 1] === '...' || array[index + 1] === '...')) {
            return false;
        }
        return true;
    });
  };
  
  const visiblePages = getVisiblePages();

  const PageButton = ({ pageNumber, isActive, onClick, isEllipsis }) => {
    if (isEllipsis) {
      return <span className="px-2 py-2 text-slate-400">...</span>;
    }
    return (
      <button
        onClick={onClick}
        className={`px-4 py-2 border rounded-lg font-semibold transition-colors min-w-[40px] ${
          isActive
            ? "bg-purple-primary text-white border-purple-primary"
            : "bg-white text-purple-dark border-slate-300 hover:bg-purple-50"
        }`}
      >
        {pageNumber}
      </button>
    );
  };


  return (
    <div className="min-h-screen bg-cream">
      <NewNav/>
      <section className="relative pt-32 pb-20 px-8 bg-gradient-to-br from-purple-50 to-cream overflow-hidden">
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
                placeholder="Search for opportunities, organizations, or a specific major..."
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
          {/* Sidebar Filters (UNCHANGED) */}
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

          {/* Mobile Filter Button (UNCHANGED) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden fixed bottom-6 right-6 z-40 bg-purple-primary text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
          >
            <Filter size={20} />
            Filters
          </button>

          {/* Content Grid */}
          <section id="content-start" className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-purple-dark">
                  {activeTab === "opportunities" && "Featured Opportunities"}
                  {activeTab === "organizations" && "Partner Organizations"}
                </h3>
                <p className="text-slate-600 mt-1">
                  {loading
                    ? "Loading..."
                    : `Showing ${Math.min((currentPage - 1) * CARDS_PER_PAGE + 1, opportunities.length)}–${Math.min(currentPage * CARDS_PER_PAGE, opportunities.length)} of ${opportunities.length} results`
                  }
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
              <DiscoverSkeleton />
            ) : opportunities.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl">
                <p className="text-xl text-slate-600 mb-4">No results found</p>
                <p className="text-slate-500">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {activeTab === "organizations" ? (
                  // Organization Cards
                  currentCards.map((org) => (
                    <div
                      key={org.id}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-primary overflow-hidden cursor-pointer"
                      onClick={() => handleOrgClick(org)}
                    >
                      {/* Org Logo/Image Placeholder */}
                      <div className="h-48 bg-gradient-to-br from-purple-200 to-gold/30 flex items-center justify-center">
                        <span className="text-6xl font-bold text-white">{org.name?.charAt(0) || "?"}</span>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-purple-dark mb-2">{org.name}</h3>
                        <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                          {org.org_description || "No description available"}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            {org.verified ? "✓ Verified" : "Pending"}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSaveOrg(org);
                            }}
                            disabled={savingOrgIds.includes(String(org.id))}
                            className={`px-4 py-2 text-sm rounded-full font-semibold transition-colors ${
                              savedOrgIds.includes(String(org.id))
                                ? "bg-gold text-white hover:bg-gold/80"
                                : "bg-purple-primary text-white hover:bg-gold"
                            } ${savingOrgIds.includes(String(org.id)) ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {savingOrgIds.includes(String(org.id)) 
                              ? "Saving..." 
                              : savedOrgIds.includes(String(org.id)) 
                                ? "Saved ✓" 
                                : "Save"
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Opportunity Cards
                  currentCards.map((opp) => (
                    <div
                      key={opp.id}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-primary overflow-hidden"
                    >
                      <div className="h-48 bg-gradient-to-br from-purple-200 to-gold/30"></div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-purple-dark mb-2">{opp.title}</h3>
                        <p className="text-slate-600 text-sm mb-4 line-clamp-3">{opp.description}</p>
                        
                        {opp.majors?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {opp.majors.slice(0, 2).map((major, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                              >
                                {major}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          {opp.apply_link && (
                            <a
                              href={opp.apply_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-center px-4 py-2 bg-purple-primary text-white rounded-lg hover:bg-gold transition-colors font-semibold text-sm"
                            >
                              Apply Now
                            </a>
                          )}
                          <button
                            onClick={(e) => handleToggleSaveOpp(e, opp)}
                            disabled={savingOppIds.includes(String(opp.id))}
                            className={`px-4 py-2 text-sm rounded-lg font-semibold transition-colors ${
                              savedOppIds.includes(String(opp.id))
                                ? "bg-gold text-white hover:bg-gold/80"
                                : "bg-slate-200 text-slate-700 hover:bg-purple-100"
                            } ${savingOppIds.includes(String(opp.id)) ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {savingOppIds.includes(String(opp.id)) 
                              ? "..." 
                              : savedOppIds.includes(String(opp.id)) 
                                ? "Saved ✓" 
                                : "Save"
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* --- NEW: Dynamic Pagination Controls --- */}
            {totalPages > 1 && !loading && (
              <div className="mt-12 flex justify-center items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  Previous
                </button>

                {/* Page Buttons (Dynamic) */}
                {visiblePages.map((page, index) => (
                  <PageButton
                    key={index}
                    pageNumber={page}
                    isActive={page === currentPage}
                    onClick={() => page !== '...' && goToPage(page)}
                    isEllipsis={page === '...'}
                  />
                ))}

                {/* Next Button */}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight size={16} className="ml-1" />
                </button>
              </div>
            )}
            {/* --- END NEW: Dynamic Pagination Controls --- */}
          </section>
          
        </div>
        <OrganizationModal
          selectedOrg={selectedOrg}
          setSelectedOrg={setSelectedOrg}
          orgOpportunities={orgOpportunities}
          loadingOrgDetails={loadingOrgDetails}
          onToggleSave={handleToggleSaveOrg}
          isSaved={selectedOrg ? savedOrgIds.includes(String(selectedOrg.id)) : false}
          isSaving={selectedOrg ? savingOrgIds.includes(String(selectedOrg.id)) : false}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Discover;