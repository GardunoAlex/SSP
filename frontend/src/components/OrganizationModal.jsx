import { useState, useEffect, useMemo } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { OrgModalSkeleton } from "./Skeletons";
import defaultBanner from "../assets/PurpleSSP_WP.png";
import { Star, Pencil, MessageSquarePlus } from "lucide-react";
import { isOrgVerified } from "../lib/verificationUtils";

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
  getAccessTokenSilently,
}) => {
  const [cachedSupaUser] = useLocalStorage("supaUser", null);
  const [orgReviews, setOrgReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", review: "", rating: 0 });
  const [editHover, setEditHover] = useState(0);
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReviewForm, setNewReviewForm] = useState({ title: "", review: "", rating: 0, selectedOpportunityId: "" });
  const [newReviewHover, setNewReviewHover] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);

  const validSupaUser = cachedSupaUser && typeof cachedSupaUser === "object" && cachedSupaUser.id
    ? cachedSupaUser : null;
  const isOrgRole = validSupaUser?.role === "org";

  const isVerified = isOrgVerified(selectedOrg?.verified);

  const fetchOrgReviews = () => {
    if (!selectedOrg?.id) return;
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews/org/${selectedOrg.id}`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setOrgReviews(Array.isArray(data) ? data : []))
      .catch(() => setOrgReviews([]));
  };

  // Fetch org reviews when modal opens
  useEffect(() => {
    if (!selectedOrg?.id) return;
    setShowAddReview(false);
    setNewReviewForm({ title: "", review: "", rating: 0, selectedOpportunityId: "" });
    setNewReviewHover(0);
    setLoadingReviews(true);
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews/org/${selectedOrg.id}`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setOrgReviews(Array.isArray(data) ? data : []))
      .catch(() => setOrgReviews([]))
      .finally(() => setLoadingReviews(false));
  }, [selectedOrg?.id]);

  const startEditReview = (review) => {
    setEditingReviewId(review.id);
    setEditForm({ title: review.title, review: review.review, rating: review.rating });
  };

  const cancelEditReview = () => {
    setEditingReviewId(null);
    setEditForm({ title: "", review: "", rating: 0 });
    setEditHover(0);
  };

  const handleEditReview = async (reviewId) => {
    if (!getAccessTokenSilently || editForm.rating === 0) return;
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editForm.title,
          review: editForm.review,
          rating: editForm.rating,
        }),
      });
      if (!res.ok) throw new Error("Failed to update review");
      cancelEditReview();
      fetchOrgReviews();
    } catch (err) {
      console.error("Error editing review:", err);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newReviewForm.selectedOpportunityId || newReviewForm.rating === 0) return;
    if (!getAccessTokenSilently) return;
    setSubmittingReview(true);
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/reviews/${newReviewForm.selectedOpportunityId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: newReviewForm.title,
            review: newReviewForm.review,
            rating: newReviewForm.rating,
          }),
        }
      );
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create review");
      }
      setNewReviewForm({ title: "", review: "", rating: 0, selectedOpportunityId: "" });
      setNewReviewHover(0);
      setShowAddReview(false);
      fetchOrgReviews();
    } catch (err) {
      console.error("Error adding review:", err);
      alert(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Average rating with divide-by-zero guard
  const avgRating = orgReviews.length > 0
    ? (orgReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / orgReviews.length).toFixed(1)
    : null;

  // Derive unique tags from all opportunity majors
  const orgTags = useMemo(() => {
    const allMajors = (orgOpportunities || []).flatMap((opp) => opp.majors || []);
    return [...new Set(allMajors)];
  }, [orgOpportunities]);

  if (!selectedOrg) return null;

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

                <div className="flex items-center gap-3 flex-wrap">
                  {isVerified && (
                    <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                      ✓ Verified Organization
                    </span>
                  )}
                  {avgRating && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-amber-50 rounded-full">
                      <Star size={16} className="text-amber-400" fill="currentColor" />
                      <span className="font-semibold text-amber-700 text-sm">{avgRating}</span>
                      <span className="text-xs text-slate-500">({orgReviews.length} {orgReviews.length === 1 ? "review" : "reviews"})</span>
                    </div>
                  )}
                </div>
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

            {/* Dynamic Tags from opportunity majors */}
            {orgTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {orgTags.slice(0, 5).map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
                {orgTags.length > 5 && (
                  <span className="px-4 py-2 bg-slate-100 text-slate-500 rounded-full text-sm font-medium">
                    +{orgTags.length - 5} more
                  </span>
                )}
              </div>
            )}

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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-purple-dark">Reviews</h3>
              {!isOrgRole && validSupaUser && !showAddReview && (
                <button
                  onClick={() => setShowAddReview(true)}
                  className="flex items-center gap-2 text-purple-primary hover:text-gold transition-colors font-medium text-sm"
                >
                  <MessageSquarePlus size={18} />
                  Share your experience
                </button>
              )}
            </div>

            {showAddReview && (
              <form onSubmit={handleAddReview} className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-purple-dark mb-1 block">Which opportunity are you reviewing?</label>
                  <select
                    value={newReviewForm.selectedOpportunityId}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, selectedOpportunityId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-purple-200 focus:ring-2 focus:ring-gold focus:outline-none text-sm text-slate-700"
                    required
                  >
                    <option value="">Select an opportunity...</option>
                    {(orgOpportunities || []).map((opp) => (
                      <option key={opp.id} value={opp.id}>{opp.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-purple-dark mb-1 block">Name</label>
                  <input
                    value={newReviewForm.title}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-purple-200 focus:ring-2 focus:ring-gold focus:outline-none text-sm text-slate-700"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-purple-dark mb-1 block">Review</label>
                  <textarea
                    value={newReviewForm.review}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, review: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-purple-200 focus:ring-2 focus:ring-gold focus:outline-none text-sm text-slate-700 h-20 resize-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-purple-dark mb-1 block">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = star <= (newReviewHover || newReviewForm.rating);
                      return (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewReviewForm({ ...newReviewForm, rating: star })}
                          onMouseEnter={() => setNewReviewHover(star)}
                          onMouseLeave={() => setNewReviewHover(0)}
                        >
                          <Star
                            size={18}
                            className={`transition-colors ${isFilled ? "text-yellow-400" : "text-gray-300"}`}
                            fill={isFilled ? "currentColor" : "none"}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="flex-1 px-3 py-1.5 text-xs bg-purple-primary text-white rounded-lg hover:bg-gold transition-colors font-semibold disabled:opacity-50"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddReview(false);
                      setNewReviewForm({ title: "", review: "", rating: 0, selectedOpportunityId: "" });
                      setNewReviewHover(0);
                    }}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

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
                    {editingReviewId === review.id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-purple-dark mb-1 block">Name</label>
                          <input
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-purple-200 focus:ring-2 focus:ring-gold focus:outline-none text-sm text-slate-700"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-purple-dark mb-1 block">Review</label>
                          <textarea
                            value={editForm.review}
                            onChange={(e) => setEditForm({ ...editForm, review: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-purple-200 focus:ring-2 focus:ring-gold focus:outline-none text-sm text-slate-700 h-20 resize-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-purple-dark mb-1 block">Rating</label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const isFilled = star <= (editHover || editForm.rating);
                              return (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => setEditForm({ ...editForm, rating: star })}
                                  onMouseEnter={() => setEditHover(star)}
                                  onMouseLeave={() => setEditHover(0)}
                                >
                                  <Star
                                    size={16}
                                    className={`transition-colors ${isFilled ? "text-yellow-400" : "text-gray-300"}`}
                                    fill={isFilled ? "currentColor" : "none"}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditReview(review.id)}
                            className="flex-1 px-3 py-1.5 text-xs bg-purple-primary text-white rounded-lg hover:bg-gold transition-colors font-semibold"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditReview}
                            className="flex-1 px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-purple-dark text-sm">{review.title}</span>
                          <div className="flex items-center gap-2">
                            {review.student_id === validSupaUser?.id && validSupaUser?.role !== "org" && (
                              <button
                                onClick={() => startEditReview(review)}
                                className="text-purple-primary hover:text-gold transition-colors"
                                title="Edit your review"
                              >
                                <Pencil size={12} />
                              </button>
                            )}
                            <div className="flex items-center gap-1">
                              <Star size={14} className="text-amber-400" fill="currentColor" />
                              <span className="text-sm font-medium">{review.rating}</span>
                            </div>
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
                      </>
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
