import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import useDebounce from "../hooks/useDebounce";

const OpportunitiesFeed = ({ searchTerm }) => {
  const [opportunities, setOpportunities] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

  const debouncedSearch = useDebounce(searchTerm, 300);

  // ✅ Fetch all opportunities
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/opportunities");
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

  // ✅ Fetch saved opportunities (for logged-in user)
    useEffect(() => {
    const fetchSaved = async () => {
        if (!isAuthenticated || !user) return;
        try {
        const token = await getAccessTokenSilently();
        const syncRes = await fetch("http://localhost:3000/api/auth/sync", {
            method: "POST",
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });
        const syncData = await syncRes.json();
        const userId = syncData.data?.[0]?.id;
        if (!userId) return;

        const savedRes = await fetch(
            `http://localhost:3000/api/saved/${userId}`
        );
        const savedData = await savedRes.json();
        const savedIds = savedData.map((s) => s.opportunity_id);
        setSaved(savedIds);
        } catch (err) {
        console.error("Error fetching saved:", err);
        }
    };

    fetchSaved();
    }, [isAuthenticated, user, getAccessTokenSilently]);


  // ✅ Handle save/unsave
  const handleSave = async (opportunityId) => {
    if (!isAuthenticated) {
      alert("Please log in to save opportunities.");
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const syncRes = await fetch("http://localhost:3000/api/auth/sync", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const syncData = await syncRes.json();
      const userId = syncData.data?.[0]?.id;
      if (!userId) return;

      const isAlreadySaved = saved.includes(opportunityId);

      if (isAlreadySaved) {
        // Remove from saved
        await fetch("http://localhost:3000/api/saved", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            opportunity_id: opportunityId,
          }),
        });
        setSaved(saved.filter((id) => id !== opportunityId));
      } else {
        // Add to saved
        await fetch("http://localhost:3000/api/saved", {
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

  // ✅ Filter by search term
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
      <p className="text-center text-gray-500 mt-10">
        Loading opportunities...
      </p>
    );

  if (error)
    return (
      <p className="text-center text-red-500 mt-10">
        Error: {error}
      </p>
    );

  if (filtered.length === 0)
    return (
      <p className="text-center text-gray-500 mt-10">
        No opportunities match your search.
      </p>
    );

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filtered.map((opp) => (
        <div
          key={opp.id}
          className="relative bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition"
        >
          <button
            onClick={() => handleSave(opp.id)}
            className="absolute top-4 right-4 text-gray-400 hover:text-indigo-600"
          >
            {saved.includes(opp.id) ? (
              <BookmarkCheck className="w-5 h-5" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>

          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {opp.title}
          </h3>

          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {opp.description}
          </p>

          <div className="text-sm text-gray-500 mb-2">
            <span className="font-medium text-indigo-600">GPA:</span>{" "}
            {opp.gpa_requirement || "N/A"}
          </div>

          {opp.majors?.length > 0 && (
            <div className="text-sm text-gray-500 mb-4">
              <span className="font-medium text-indigo-600">Majors:</span>{" "}
              {opp.majors.join(", ")}
            </div>
          )}

          <a
            href={opp.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-600 transition"
          >
            View Details
          </a>
        </div>
      ))}
    </div>
  );
};

export default OpportunitiesFeed;
