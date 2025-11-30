import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import useLocalStorage from "../hooks/useLocalStorage";
import { clearCached, fetchWithCache } from "../lib/apiCache";
import { getSupabaseUser } from "../lib/apiHelpers";

const OrganizationModal = ({
  selectedOrg,
  setSelectedOrg,
  orgOpportunities,
  loadingOrgDetails,
}) => {
  if (!selectedOrg) return null;

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { isAuthenticated, user, loginWithRedirect, getAccessTokenSilently } = useAuth0();

  const [savedOrgIds, setSavedOrgIds] = useLocalStorage("savedOrgIds", []);
  const [cachedSupaUser, setCachedSupaUser] = useLocalStorage("supaUser", null);

  useEffect(() => {
    // If modal is open and user is authenticated, check saved status
    const checkSaved = async () => {
      if (!selectedOrg) return;
      // quick check from localStorage first
      if (savedOrgIds?.length > 0 && selectedOrg?.id) {
        const local = savedOrgIds.some(id => String(id) === String(selectedOrg.id));
        setIsSaved(Boolean(local));
        if (local) return; // if local storage shows saved, skip network check
      }
      if (!user) return;
      try {
        const supaUser = cachedSupaUser || await getSupabaseUser(getAccessTokenSilently);
        if (!cachedSupaUser && supaUser?.id) setCachedSupaUser(supaUser);
        const userId = supaUser?.id;
        if (!userId) return;
        if (!userId) return;

        const key = `savedOrgs:${userId}`;
        const savedOrgs = await fetchWithCache(key, `${import.meta.env.VITE_API_BASE_URL}/api/savedOrgs/${userId}`, {}, 120000);
        const found = savedOrgs.some((o) => String(o.id) === String(selectedOrg.id));
        setIsSaved(Boolean(found));
        // update local storage cache
        if (found) setSavedOrgIds(prev => Array.from(new Set([...prev, String(selectedOrg.id)])));
        console.debug("OrganizationModal: initial saved check for", selectedOrg.id, "->", found);
      } catch (err) {
        console.error("Failed to check saved status", err);
      }
    };
    checkSaved();
  }, [user, selectedOrg]);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setSelectedOrg(null)}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative h-64 bg-gradient-to-br from-purple-500 to-gold/60 flex items-center justify-center">
          <button
            onClick={() => setSelectedOrg(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <span className="text-white text-2xl">×</span>
          </button>

          <span className="text-9xl font-bold text-white/90">
            {selectedOrg.name?.charAt(0) || "?"}
          </span>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[calc(90vh-16rem)] p-8">
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-4xl font-bold text-purple-dark mb-2">
                  {selectedOrg.name}
                </h2>

                {selectedOrg.verified && (
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    ✓ Verified Organization
                  </span>
                )}
              </div>

              <button
                onClick={async () => {
                  if (!isAuthenticated) {
                    loginWithRedirect();
                    return;
                  }

                  if (isSaving) return;
                  setIsSaving(true);

                  try {
                    const supaUser = cachedSupaUser || await getSupabaseUser(getAccessTokenSilently);
                    if (!cachedSupaUser && supaUser?.id) setCachedSupaUser(supaUser);
                    const userId = supaUser?.id;
                    if (!userId) throw new Error("Unable to get user id");

                    if (!isSaved) {
                      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/savedOrgs`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ user_id: userId, org_id: selectedOrg.id }),
                      });
                      if (!res.ok) {
                        const text = await res.text();
                        throw new Error(text || "Failed to save org");
                      }
                      setIsSaved(true);
                      setSavedOrgIds(prev => Array.from(new Set([...prev, String(selectedOrg.id)])));
                      // clear savedOrgs cache to force re-fetch elsewhere
                      clearCached(`savedOrgs:${userId}`);
                      console.debug("OrganizationModal: saved org:", selectedOrg.id);
                      // Notify other parts of the app to refresh saved orgs (e.g., Saved page)
                      window.dispatchEvent(new CustomEvent("savedOrgChanged", { detail: { orgId: selectedOrg.id, saved: true } }));
                    } else {
                      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/savedOrgs`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ user_id: userId, org_id: selectedOrg.id }),
                      });
                      if (!res.ok) {
                        const text = await res.text();
                        throw new Error(text || "Failed to unsave org");
                      }
                      setIsSaved(false);
                      setSavedOrgIds(prev => prev.filter(id => id !== String(selectedOrg.id)));
                      clearCached(`savedOrgs:${userId}`);
                      console.debug("OrganizationModal: unsaved org:", selectedOrg.id);
                      window.dispatchEvent(new CustomEvent("savedOrgChanged", { detail: { orgId: selectedOrg.id, saved: false } }));
                    }
                  } catch (err) {
                    console.error("Save/Unsave org failed:", err);
                  } finally {
                    setIsSaving(false);
                  }
                }}
                className={`px-6 py-3 rounded-full transition-colors font-semibold ${isSaved ? "bg-slate-200 text-slate-700 hover:bg-red-100 hover:text-red-600" : "bg-purple-primary text-white hover:bg-gold"}`}
              >
                {isSaved ? "Saved" : isSaving ? "Saving..." : "Save Organization"}
              </button>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                Technology
              </span>
              <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                Engineering
              </span>
              <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                Computer Science
              </span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-purple-dark mb-3">About</h3>
              <p className="text-slate-700 leading-relaxed">
                {selectedOrg.org_description || "No description available."}
              </p>
            </div>

            {/* Contact Info */}
            <div className="mb-6 flex flex-wrap gap-4">
              {selectedOrg.email && (
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="font-semibold">Email:</span>
                  <a
                    href={`mailto:${selectedOrg.email}`}
                    className="text-purple-primary hover:underline"
                  >
                    {selectedOrg.email}
                  </a>
                </div>
              )}

              {selectedOrg.website && (
                <a
                  href={selectedOrg.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-gold text-white rounded-full hover:bg-gold/80 transition-colors font-semibold inline-flex items-center gap-2"
                >
                  Visit Website →
                </a>
              )}
            </div>
          </div>

          {/* Opportunities */}
          <div className="border-t border-slate-200 pt-8">
            <h3 className="text-2xl font-bold text-purple-dark mb-6">
              Opportunities from {selectedOrg.name}
            </h3>

            {loadingOrgDetails ? (
              <div className="text-center py-12">
                <div className="inline-block w-10 h-10 border-4 border-purple-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-600 mt-4">Loading opportunities...</p>
              </div>
            ) : orgOpportunities.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl">
                <p className="text-slate-600">
                  No opportunities available at this time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {orgOpportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="bg-slate-50 rounded-xl p-6 hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    <h4 className="text-lg font-bold text-purple-dark mb-2">
                      {opp.title}
                    </h4>

                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                      {opp.description}
                    </p>

                    {opp.majors?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {opp.majors.slice(0, 3).map((major, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-white text-purple-700 rounded-full text-xs font-medium"
                          >
                            {major}
                          </span>
                        ))}

                        {opp.majors.length > 3 && (
                          <span className="px-3 py-1 bg-white text-slate-500 rounded-full text-xs">
                            +{opp.majors.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                      {opp.gpa_requirement && (
                        <span>Min GPA: {opp.gpa_requirement}</span>
                      )}
                      {opp.location && <span>📍 {opp.location}</span>}
                    </div>

                    {opp.apply_link && (
                      <a
                        href={opp.apply_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block w-full text-center px-4 py-2 bg-purple-primary text-white rounded-lg hover:bg-gold transition-colors font-semibold text-sm"
                      >
                        Apply Now
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationModal;
