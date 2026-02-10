import { useState, useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { OrgModalSkeleton } from "./Skeletons";
import defaultBanner from "../assets/PurpleSSP_WP.png";
import { Star } from "lucide-react";

const getBannerStyle = (url) => ({
  backgroundImage: `url(${url})`,
  backgroundSize: url.includes("Wallpaper") ? "contain" : "cover",
  backgroundPosition: "center",
  backgroundRepeat: url.includes("Wallpaper") ? "repeat" : "no-repeat",
});

const OrganizationModal = ({
  selectedOrg,
  setSelectedOrg,
  orgOpportunities,
  loadingOrgDetails,
  onToggleSave,
  isSaved,
  isSaving,
}) => {
  const [cachedSupaUser] = useLocalStorage("supaUser", null);
  const [orgReviews, setOrgReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const validSupaUser = cachedSupaUser && typeof cachedSupaUser === "object" && cachedSupaUser.id
    ? cachedSupaUser : null;
  const isOrgRole = validSupaUser?.role === "org";

  // Verified check: works with both boolean (pre-migration) and string (post-migration)
  const isVerified = selectedOrg?.verified === true || selectedOrg?.verified === "verified";

  // Fetch org reviews when modal opens
  useEffect(() => {
    if (!selectedOrg?.id) return;
    setLoadingReviews(true);
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews/org/${selectedOrg.id}`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setOrgReviews(Array.isArray(data) ? data : []))
      .catch(() => setOrgReviews([]))
      .finally(() => setLoadingReviews(false));
  }, [selectedOrg?.id]);

  if (!selectedOrg) return null;

  // Average rating with divide-by-zero guard
  const avgRating = orgReviews.length > 0
    ? (orgReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / orgReviews.length).toFixed(1)
    : null;

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
        <div
          className="relative h-64 overflow-hidden flex items-center justify-center"
          style={getBannerStyle(selectedOrg.banner_url || defaultBanner)}
        >
          <div className="absolute inset-0 bg-black/30" />

          <button
            onClick={() => setSelectedOrg(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-colors z-10"
          >
            <span className="text-white text-2xl">×</span>
          </button>

          {!selectedOrg.banner_url && (
            <span className="relative text-9xl font-bold text-white/90 z-0">
              {selectedOrg.name?.charAt(0) || "?"}
            </span>
          )}
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto custom-scrollbar max-h-[calc(90vh-16rem)] p-8">
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-4xl font-bold text-purple-dark mb-2">
                  {selectedOrg.name}
                </h2>

                {isVerified && (
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    ✓ Verified Organization
                  </span>
                )}
              </div>

              {/* Hide Save button for org users */}
              {!isOrgRole && (
                <button
                  onClick={() => onToggleSave && onToggleSave(selectedOrg)}
                  disabled={isSaving}
                  className={`px-6 py-3 rounded-full font-semibold transition-colors ${
                    isSaved
                      ? "bg-gold text-white hover:bg-gold/80"
                      : "bg-purple-primary text-white hover:bg-gold"
                  } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isSaving ? "Saving..." : isSaved ? "Saved ✓" : "Save Organization"}
                </button>
              )}
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
              <OrgModalSkeleton />
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

          {/* Reviews Section */}
          <div className="border-t border-slate-200 pt-8 mt-8">
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-2xl font-bold text-purple-dark">Reviews</h3>
              {avgRating && (
                <div className="flex items-center gap-1 px-3 py-1 bg-amber-50 rounded-full">
                  <Star size={18} className="text-amber-400" fill="currentColor" />
                  <span className="font-semibold text-amber-700">{avgRating}</span>
                  <span className="text-sm text-slate-500">({orgReviews.length})</span>
                </div>
              )}
            </div>

            {loadingReviews ? (
              <OrgModalSkeleton />
            ) : orgReviews.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl">
                <p className="text-slate-600">No reviews for this organization yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orgReviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border border-purple-100"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-purple-dark text-sm">{review.title}</span>
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-amber-400" fill="currentColor" />
                        <span className="text-sm font-medium">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-3">{review.review}</p>
                    {review.opportunities?.title && (
                      <p className="text-xs text-slate-400 mt-2">on: {review.opportunities.title}</p>
                    )}
                    {review.org_reply && (
                      <div className="mt-2 pt-2 border-t border-purple-100">
                        <p className="text-xs font-semibold text-purple-primary mb-1">Organization Response</p>
                        <p className="text-xs text-slate-600">{review.org_reply}</p>
                      </div>
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
