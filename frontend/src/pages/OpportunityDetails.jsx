import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import useLocalStorage from "../hooks/useLocalStorage";
import { getSupabaseUser } from "../lib/apiHelpers";
import { clearCached } from "../lib/apiCache";
import NewNav from "../components/newNav";
import Footer from "../components/Footer";

export default function OpportunityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getAccessTokenSilently, isAuthenticated, loginWithRedirect } = useAuth0();
  
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cachedSupaUser, setCachedSupaUser] = useLocalStorage("supaUser", null);
  const [savedOppIds, setSavedOppIds] = useLocalStorage("savedOppIds", []);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/opportunities/${id}`
        );
        if (!res.ok) throw new Error("Failed to fetch opportunity");
        const data = await res.json();
        setOpportunity(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunity();
  }, [id]);

  // Fetch saved opp IDs if user is logged in
  useEffect(() => {
    const fetchSavedOppIds = async () => {
      if (!user) return;
      try {
        const supaUser = cachedSupaUser || await getSupabaseUser(getAccessTokenSilently);
        if (!cachedSupaUser && supaUser?.id) setCachedSupaUser(supaUser);
        const userId = supaUser?.id;
        if (!userId) return;
        
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/saved/${userId}`);
        const data = await res.json();
        setSavedOppIds(data.map((o) => String(o.id)));
      } catch (err) {
        console.error("Failed to fetch saved opp ids", err);
      }
    };
    fetchSavedOppIds();
  }, [user]);

  const handleToggleSave = async () => {
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
      if (!userId) throw new Error('Unable to get user id');

      const alreadySaved = savedOppIds.includes(String(id));
      
      if (!alreadySaved) {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/saved`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, opportunity_id: id }),
        });
        if (!res.ok) throw new Error('Failed to save opportunity');
        setSavedOppIds(prev => Array.from(new Set([...prev, String(id)])));
        clearCached(`savedOps:${userId}`);
      } else {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/saved`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, opportunity_id: id }),
        });
        if (!res.ok) throw new Error('Failed to unsave opportunity');
        setSavedOppIds(prev => prev.filter(oppId => oppId !== String(id)));
        clearCached(`savedOps:${userId}`);
      }
    } catch (err) {
      console.error('Toggle save failed', err);
      alert('Failed to update saved opportunity');
    } finally {
      setIsSaving(false);
    }
  };

  const isSaved = savedOppIds.includes(String(id));

  if (loading)
    return (
      <div className="min-h-screen bg-cream">
        <NewNav />
        <p className="text-center mt-32 text-purple-dark">Loading...</p>
      </div>
    );

  if (!opportunity)
    return (
      <div className="min-h-screen bg-cream">
        <NewNav />
        <p className="text-center mt-32 text-purple-dark">
          Opportunity not found.
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-cream">
      <NewNav />

      <div className="max-w-4xl mx-auto mt-32 px-6 pb-20">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-purple-dark hover:text-gold mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-purple-primary mb-3">
                {opportunity.title}
              </h1>
              <p className="text-slate-700 text-lg">
                {opportunity.description}
              </p>
            </div>
            
            <button
              onClick={handleToggleSave}
              disabled={isSaving}
              className={`px-6 py-3 rounded-full font-semibold transition-colors whitespace-nowrap ${
                isSaved
                  ? "bg-gold text-white hover:bg-gold/80"
                  : "bg-purple-primary text-white hover:bg-gold"
              } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isSaving ? "Saving..." : isSaved ? "Saved ✓" : "Save"}
            </button>
          </div>

          <div className="space-y-3 text-sm text-slate-600 mb-6">
            <p>
              <span className="font-semibold text-purple-primary">
                GPA Requirement:
              </span>{" "}
              {opportunity.gpa_requirement || "N/A"}
            </p>
            {opportunity.majors?.length > 0 && (
              <p>
                <span className="font-semibold text-purple-primary">
                  Majors:
                </span>{" "}
                {opportunity.majors.join(", ")}
              </p>
            )}
            {opportunity.location && (
              <p>
                <span className="font-semibold text-purple-primary">
                  Location:
                </span>{" "}
                {opportunity.location}
              </p>
            )}
            <p>
              <span className="font-semibold text-purple-primary">
                Posted On:
              </span>{" "}
              {new Date(opportunity.created_at).toLocaleDateString()}
            </p>
          </div>

          <a
            href={opportunity.apply_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-purple-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-gold transition"
          >
            Apply Now
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}