import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Bookmark,
  BookmarkCheck,
  Calendar,
  MapPin,
  GraduationCap,
  Building2,
} from "lucide-react";
import useDebounce from "../hooks/useDebounce";
import { useNavigate } from "react-router-dom";

const OpportunitiesFeed = ({ searchTerm }) => {
  const [opportunities, setOpportunities] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const debouncedSearch = useDebounce(searchTerm, 300);

  const navigate = useNavigate();

  // ✅ Sync user ONCE after login
  useEffect(() => {
    const syncUser = async () => {
      if (!isAuthenticated) return;
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/sync`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        const id = data.data?.[0]?.id;
        if (id) setUserId(id);
      } catch (err) {
        console.error("Error syncing user:", err);
      }
    };
    syncUser();
  }, [isAuthenticated, getAccessTokenSilently]);

  // ✅ Fetch all opportunities
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/opportunities`
        );
        if (!res.ok) throw new Error("Failed to fetch opportunities");
        const data = await res.json();
        setOpportunities(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOpportunities();
  }, []);

  // ✅ Fetch saved opportunities for user
  useEffect(() => {
    const fetchSaved = async () => {
      if (!isAuthenticated || !userId) return;
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/saved/${userId}`
        );
        const data = await res.json();
        const savedIds = data.map((s) => s.opportunity_id);
        setSaved(savedIds);
      } catch (err) {
        console.error("Error fetching saved:", err);
      }
    };
    fetchSaved();
  }, [isAuthenticated, userId]);

  // ✅ Handle save/unsave without resyncing user
  const handleSave = async (opportunityId) => {
    if (!isAuthenticated) {
      alert("Please log in to save opportunities.");
      return;
    }
    if (!userId) {
      console.error("No user ID found in state");
      return;
    }

    const isAlreadySaved = saved.includes(opportunityId);

    try {
      if (isAlreadySaved) {
        await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/saved/${opportunityId}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          }
        );
        setSaved(saved.filter((id) => id !== opportunityId));
      } else {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/saved`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            opportunity_id: opportunityId,
          }),
        });
        setSaved([...saved, opportunityId]);
      }
    } catch (err) {
      console.error("Error saving/unsaving:", err);
    }
  };

  // ✅ Filter opportunities
  const filtered = opportunities.filter((opp) => {
    const term = debouncedSearch?.toLowerCase() || "";
    return (
      opp.title?.toLowerCase().includes(term) ||
      opp.description?.toLowerCase().includes(term) ||
      opp.gpa_requirement?.toString().includes(term) ||
      opp.majors?.some((m) => m.toLowerCase().includes(term))
    );
  });

  if (loading)
    return (
      <div className="text-center py-20">
        <div className="inline-block w-12 h-12 border-4 border-purple-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-purple-dark mt-4">Loading opportunities...</p>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-20">
        <p className="text-red-500 text-lg">Error: {error}</p>
      </div>
    );

  if (filtered.length === 0)
    return (
      <div className="text-center py-20">
        <GraduationCap className="w-16 h-16 text-purple-300 mx-auto mb-4" />
        <p className="text-purple-dark text-lg">
          No opportunities match your search.
        </p>
        <p className="text-slate-500 mt-2">Try adjusting your search terms</p>
      </div>
    );

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filtered.map((opp) => (
        <div
          key={opp.id}
          className="relative group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-primary overflow-hidden"
        >
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-primary to-gold"></div>

          <div className="p-6">
            {/* Bookmark Button */}
            <button
              onClick={() => handleSave(opp.id)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-purple-primary hover:text-gold transition-colors duration-300 shadow-md z-10"
            >
              {saved.includes(opp.id) ? (
                <BookmarkCheck className="w-5 h-5" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>

            {/* Organization Badge */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-primary to-gold rounded-full flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-gold font-semibold text-sm">
                {opp.organization || "Organization"}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-purple-dark mb-3 pr-8">
              {opp.title}
            </h3>

            {/* Description */}
            <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed">
              {opp.description}
            </p>

            {/* Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-slate-500 text-sm">
                <GraduationCap className="w-4 h-4 mr-2" />
                <span>
                  <span className="font-medium text-purple-primary">GPA:</span>{" "}
                  {opp.gpa_requirement || "N/A"}
                </span>
              </div>

              {opp.majors?.length > 0 && (
                <div className="flex items-start text-slate-500 text-sm">
                  <Calendar className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    <span className="font-medium text-purple-primary">
                      Majors:
                    </span>{" "}
                    {opp.majors.join(", ")}
                  </span>
                </div>
              )}

              {opp.location && (
                <div className="flex items-center text-slate-500 text-sm">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{opp.location}</span>
                </div>
              )}
            </div>

            {/* View Details Button */}
            <button
              onClick={() => navigate(`/opportunity/${opp.id}`)}
              className="w-full mt-4 bg-purple-primary text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-gold hover:shadow-lg hover:shadow-gold/50 transition-all duration-300"
            >
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OpportunitiesFeed;