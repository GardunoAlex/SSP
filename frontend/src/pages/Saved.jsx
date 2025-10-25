import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { BookmarkX } from "lucide-react";
import Navbar from "../components/navbar";

export default function Saved() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [saved, setSaved] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Sync user ONCE and store userId
  useEffect(() => {
    const syncUser = async () => {
      if (!isAuthenticated) return;
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch("http://localhost:3000/api/auth/sync", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const id = data.data?.[0]?.id;
        if (id) setUserId(id);
      } catch (err) {
        console.error("Error syncing user:", err);
      }
    };
    syncUser();
  }, [isAuthenticated, getAccessTokenSilently]);

  // ✅ Fetch saved opportunities for logged-in user
  useEffect(() => {
    const fetchSaved = async () => {
      if (!isAuthenticated || !userId) return;
      try {
        const res = await fetch(`http://localhost:3000/api/saved/${userId}`);
        const data = await res.json();
        setSaved(data);
      } catch (err) {
        console.error("Error fetching saved:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, [isAuthenticated, userId]);

  // ✅ Unsave opportunity
  const handleUnsave = async (oppId) => {
    try {
      await fetch(`http://localhost:3000/api/saved/${oppId}`, {
        method: "DELETE",
      });
      setSaved((prev) => prev.filter((o) => o.id !== oppId));
    } catch (err) {
      console.error("Error unsaving opportunity:", err);
    }
  };

  if (!isAuthenticated)
    return (
      <p className="text-center mt-16 text-gray-500">
        Please log in to view your saved opportunities.
      </p>
    );

  if (loading)
    return (
      <p className="text-center mt-16 text-gray-500 animate-pulse">
        Loading your saved opportunities...
      </p>
    );

  if (saved.length === 0)
    return (
      <p className="text-center mt-16 text-gray-500">
        You haven’t saved any opportunities yet 📭
      </p>
    );

  return (
    <div>
         <Navbar />
        <div className="max-w-6xl mx-auto p-6 mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {saved.map((opp) => (
            <div
            key={opp.id}
            className="relative bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition"
            >
            <button
                onClick={() => handleUnsave(opp.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
            >
                <BookmarkX className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
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
                href={opp.apply_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-600 transition"
            >
                View Details
            </a>
            </div>
        ))}
        </div>
    </div>
  );
}
