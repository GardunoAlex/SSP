import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { fetchWithCache, clearCached } from "../lib/apiCache";
import useLocalStorage from "../hooks/useLocalStorage";
import { getSupabaseUser } from "../lib/apiHelpers";
import StudentNav from "../components/StudentNav";
import Footer from "../components/Footer";
import OrganizationModal from "../components/OrganizationModal";
import { Bookmark } from "lucide-react";

const Saved = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const [cachedSupaUser, setCachedSupaUser] = useLocalStorage("supaUser", null);
  const [activeTab, setActiveTab] = useState("opportunities");
  const [savedOpportunities, setSavedOpportunities] = useState([]);
  const [savedOrganizations, setSavedOrganizations] = useLocalStorage("savedOrganizations", []);
  const [savedOrgIds, setSavedOrgIds] = useLocalStorage("savedOrgIds", []);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [orgOpportunities, setOrgOpportunities] = useState([]);
  const [loadingOrgDetails, setLoadingOrgDetails] = useState(false);
  const [savingOrgIds, setSavingOrgIds] = useState([]);

  // Fetch BOTH on initial load
  useEffect(() => {
    if (user) {
      fetchAllSavedItems();
    }
  }, [user]); // Only run when user changes

  // Listen for changes from other parts of the app (e.g., modal saves)
  useEffect(() => {
    const listener = (e) => {
      console.debug("Saved.jsx: received savedOrgChanged event", e?.detail);
      if (user) fetchAllSavedItems(true);
    };
    window.addEventListener("savedOrgChanged", listener);
    return () => window.removeEventListener("savedOrgChanged", listener);
  }, [user]);

  const fetchAllSavedItems = async (forceRefresh = false) => {
    setLoading(true);
    try {
      // Get user's Supabase ID
      const supaUser = cachedSupaUser || await getSupabaseUser(getAccessTokenSilently);
      if (!cachedSupaUser && supaUser?.id) setCachedSupaUser(supaUser);
      const userId = supaUser?.id;
      if (!userId) throw new Error('Could not resolve user id');
      console.debug("Saved.jsx: fetched userId", userId);

      // Fetch BOTH opportunities AND organizations in parallel
      const [oppsData, orgsData] = await Promise.all([
        fetchSavedOpportunities(userId, forceRefresh),
        fetchSavedOrganizations(userId, forceRefresh)
      ]);

      setSavedOpportunities(oppsData);
      setSavedOrganizations(orgsData);
      setSavedOrgIds(orgsData.map(o => String(o.id)));

      setLoading(false);
    } catch (error) {
      console.error("Error fetching saved items:", error);
      setLoading(false);
    }
  };

  const fetchOrgOpportunities = async (orgId) => {
    setLoadingOrgDetails(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/opportunities/org/${orgId}`);
      const data = await response.json();
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
  };

  const handleToggleSaveOrg = async (org) => {
    try {
      // Avoid double-saving
      if (savingOrgIds.includes(String(org.id))) return;
      setSavingOrgIds(prev => [...prev, String(org.id)]);

      const supaUser = cachedSupaUser || await getSupabaseUser(getAccessTokenSilently);
      if (!cachedSupaUser && supaUser?.id) setCachedSupaUser(supaUser);
      const userId = supaUser?.id;
      if (!userId) throw new Error('Unable to get user id');

      const alreadySaved = savedOrgIds.includes(String(org.id));
      
      if (!alreadySaved) {
        // Save
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/savedOrgs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, org_id: org.id }),
        });
        if (!res.ok) throw new Error('Failed to save org');
        
        setSavedOrgIds(prev => Array.from(new Set([...prev, String(org.id)])));
        clearCached(`savedOrgs:${userId}`);
        
        // Also update the saved organizations list
        const newOrg = { id: org.id, name: org.name, org_description: org.org_description, website: org.website };
        setSavedOrganizations(prev => [...prev, newOrg]);
        
        window.dispatchEvent(new CustomEvent('savedOrgChanged', { detail: { orgId: org.id, saved: true } }));
      } else {
        // Unsave
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/savedOrgs`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, org_id: org.id }),
        });
        if (!res.ok) throw new Error('Failed to unsave org');
        
        setSavedOrgIds(prev => prev.filter(id => id !== String(org.id)));
        setSavedOrganizations(prev => prev.filter(o => o.id !== org.id));
        clearCached(`savedOrgs:${userId}`);
        
        window.dispatchEvent(new CustomEvent('savedOrgChanged', { detail: { orgId: org.id, saved: false } }));
      }
    } catch (err) {
      console.error('Saved: toggle saved org failed', err);
      alert('Failed to update saved organization');
    } finally {
      setSavingOrgIds(prev => prev.filter(id => id !== String(org.id)));
    }
  };

  const fetchSavedOpportunities = async (userId, forceRefresh = false) => {
    const key = `savedOps:${userId}`;
    try {
      const data = await fetchWithCache(
        key, 
        `${import.meta.env.VITE_API_BASE_URL}/api/saved/${userId}`, 
        {}, 
        120000, 
        forceRefresh
      );
      console.debug("Saved.jsx: fetched saved opportunities count", data.length);
      return data;
    } catch (err) {
      console.error('Saved.jsx: fetch saved ops failed cache, retrying', err);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/saved/${userId}`);
      const data = await response.json();
      console.debug("Saved.jsx: fetched saved opportunities count (no cache)", data.length);
      return data;
    }
  };

  const fetchSavedOrganizations = async (userId, forceRefresh = false) => {
    const key = `savedOrgs:${userId}`;
    try {
      const data = await fetchWithCache(
        key, 
        `${import.meta.env.VITE_API_BASE_URL}/api/savedOrgs/${userId}`, 
        {}, 
        120000, 
        forceRefresh
      );
      console.debug("Saved.jsx: fetched saved organizations count", data.length);
      return data;
    } catch (err) {
      console.error('Saved.jsx: fetch saved orgs failed cache, retrying', err);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/savedOrgs/${userId}`);
      const data = await response.json();
      console.debug("Saved.jsx: fetched saved organizations count (no cache)", data.length);
      return data;
    }
  };

  const handleUnsaveOpportunity = async (oppId) => {
    try {
      const supaUser = cachedSupaUser || await getSupabaseUser(getAccessTokenSilently);
      if (!cachedSupaUser && supaUser?.id) setCachedSupaUser(supaUser);
      const userId = supaUser?.id;
      if (!userId) throw new Error('Unable to get user id');

      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/saved`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, opportunity_id: oppId }),
      });
      
      // Clear cache and update state immediately
      clearCached(`savedOps:${userId}`);
      setSavedOpportunities(prev => prev.filter(opp => opp.id !== oppId));
    } catch (error) {
      console.error("Error unsaving opportunity:", error);
    }
  };

  const handleUnsaveOrganization = async (orgId) => {
    try {
      const supaUser = cachedSupaUser || await getSupabaseUser(getAccessTokenSilently);
      if (!cachedSupaUser && supaUser?.id) setCachedSupaUser(supaUser);
      const userId = supaUser?.id;
      if (!userId) throw new Error('Unable to get user id');

      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/savedOrgs`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, org_id: orgId }),
      });
      
      // Clear cache and update state immediately
      clearCached(`savedOrgs:${userId}`);
      const newList = savedOrganizations.filter(org => org.id !== orgId);
      setSavedOrganizations(newList);
      setSavedOrgIds(newList.map(o => String(o.id)));
    } catch (error) {
      console.error("Error unsaving organization:", error);
      alert(`Error unsaving organization: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <StudentNav />

      <main className="max-w-7xl mx-auto px-6 py-12 pt-28">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bookmark className="text-purple-primary" size={40} />
            <h1 className="text-5xl font-bold text-purple-dark">My Saved Items</h1>
          </div>
          <p className="text-xl text-slate-600">
            Keep track of opportunities and organizations you're interested in
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab("opportunities")}
            className={`px-8 py-4 rounded-full font-semibold text-lg transition-all ${
              activeTab === "opportunities"
                ? "bg-purple-primary text-white shadow-lg"
                : "bg-white text-purple-dark hover:bg-purple-50"
            }`}
          >
            Saved Opportunities ({savedOpportunities.length})
          </button>
          <button
            onClick={() => setActiveTab("organizations")}
            className={`px-8 py-4 rounded-full font-semibold text-lg transition-all ${
              activeTab === "organizations"
                ? "bg-purple-primary text-white shadow-lg"
                : "bg-white text-purple-dark hover:bg-purple-50"
            }`}
          >
            Saved Organizations ({savedOrganizations.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-purple-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-purple-dark mt-4">Loading saved items...</p>
          </div>
        ) : (
          <div>
            {activeTab === "opportunities" ? (
              savedOpportunities.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl">
                  <Bookmark className="mx-auto text-slate-300 mb-4" size={64} />
                  <p className="text-xl text-slate-600 mb-2">No saved opportunities yet</p>
                  <p className="text-slate-500">
                    Browse the{" "}
                    <a href="/discover" className="text-purple-primary hover:underline">
                      Discover page
                    </a>{" "}
                    to find opportunities
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedOpportunities.map((opp) => (
                    <div
                      key={opp.id}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border-2 border-transparent hover:border-purple-primary"
                    >
                      <h3 className="text-xl font-bold text-purple-dark mb-2">
                        {opp.title}
                      </h3>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                        {opp.description}
                      </p>

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
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 text-center px-4 py-2 bg-purple-primary text-white rounded-lg hover:bg-gold transition-colors font-semibold text-sm"
                          >
                            Apply Now
                          </a>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnsaveOpportunity(opp.id)
                          }}
                          className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors font-semibold text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : savedOrganizations.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl">
                <Bookmark className="mx-auto text-slate-300 mb-4" size={64} />
                <p className="text-xl text-slate-600 mb-2">No saved organizations yet</p>
                <p className="text-slate-500">
                  Browse the{" "}
                  <a href="/discover?tab=organizations" className="text-purple-primary hover:underline">
                    Organizations
                  </a>{" "}
                  to find ones to follow
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedOrganizations.map((org) => (
                  <div
                    key={org.id}
                    onClick={() => handleOrgClick(org)}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden border-2 border-transparent hover:border-purple-primary cursor-pointer"
                  >
                    <div className="h-48 bg-gradient-to-br from-purple-200 to-gold/30 flex items-center justify-center">
                      <span className="text-6xl font-bold text-white">
                        {org.name?.charAt(0) || "?"}
                      </span>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-purple-dark mb-2">
                        {org.name}
                      </h3>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                        {org.org_description || "No description available"}
                      </p>

                      <div className="flex gap-2">
                        {org.website && (
                          <a
                            href={org.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center px-4 py-2 bg-purple-primary text-white rounded-lg hover:bg-gold transition-colors font-semibold text-sm"
                          >
                            Visit Website
                          </a>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnsaveOrganization(org.id)
                          }}
                          className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors font-semibold text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <OrganizationModal
        selectedOrg={selectedOrg}
        setSelectedOrg={setSelectedOrg}
        orgOpportunities={orgOpportunities}
        loadingOrgDetails={loadingOrgDetails}
        onToggleSave={handleToggleSaveOrg}
        isSaved={selectedOrg ? savedOrgIds.includes(String(selectedOrg.id)) : false}
        isSaving={selectedOrg ? savingOrgIds.includes(String(selectedOrg.id)) : false}
      />


      <Footer />
    </div>
  );
};

export default Saved;