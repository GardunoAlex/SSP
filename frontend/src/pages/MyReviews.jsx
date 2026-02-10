import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import NewNav from "../components/newNav.jsx";
import Footer from "../components/Footer";
import ConfirmModal from "../components/ConfirmModal";
import { Star, Pencil, Trash2, MessageSquare, ExternalLink, Building2 } from "lucide-react";

const MyReviews = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, getAccessTokenSilently } = useAuth0();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("opportunities");

  // Edit state
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", review: "", rating: 0 });
  const [editHover, setEditHover] = useState(0);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (user) fetchMyReviews();
  }, [user]);

  const fetchMyReviews = async () => {
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/reviews/mine`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching my reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  // Group reviews by organization for the Organizations tab
  const orgGroups = useMemo(() => {
    const groups = {};
    reviews.forEach((review) => {
      const orgId = review.opportunities?.org_id;
      if (!orgId) return;
      if (!groups[orgId]) {
        groups[orgId] = {
          name: review.opportunities?.org?.name || "Unknown Organization",
          banner_url: review.opportunities?.org?.banner_url || null,
          reviews: [],
        };
      }
      groups[orgId].reviews.push(review);
    });
    return Object.entries(groups);
  }, [reviews]);

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
    if (editForm.rating === 0) return;
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
      fetchMyReviews();
    } catch (err) {
      console.error("Error editing review:", err);
    }
  };

  const handleDeleteReview = async () => {
    if (!deleteTarget) return;
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/reviews/${deleteTarget}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete review");
      setDeleteTarget(null);
      fetchMyReviews();
    } catch (err) {
      console.error("Error deleting review:", err);
    }
  };

  // Shared review card renderer
  const renderReviewCard = (review, showOppTitle = true) => (
    <div
      key={review.id}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border-2 border-transparent hover:border-purple-primary cursor-pointer"
      onClick={() => {
        if (editingReviewId === review.id) return;
        navigate(`/opportunity/${review.opportunity_id}`, { state: { scrollToReviews: true } });
      }}
    >
      {editingReviewId === review.id ? (
        /* Inline edit form */
        <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
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
          {/* Header: opportunity title + action icons */}
          <div className="flex justify-between items-start mb-3">
            {showOppTitle && (
              <h3 className="text-lg font-bold text-purple-dark leading-tight">
                {review.opportunities?.title || "Unknown Opportunity"}
              </h3>
            )}
            {!showOppTitle && (
              <h3 className="text-lg font-bold text-purple-dark leading-tight">
                {review.opportunities?.title || "Unknown Opportunity"}
              </h3>
            )}
            <div className="flex items-center gap-2 ml-2 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); startEditReview(review); }}
                title="Edit review"
              >
                <Pencil size={14} className="text-purple-primary hover:text-gold transition-colors" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteTarget(review.id); }}
                title="Delete review"
              >
                <Trash2 size={14} className="text-slate-400 hover:text-red-500 transition-colors" />
              </button>
            </div>
          </div>

          {/* Star rating */}
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                className={star <= review.rating ? "text-amber-400" : "text-gray-300"}
                fill={star <= review.rating ? "currentColor" : "none"}
              />
            ))}
          </div>

          {/* Review name (title field) */}
          <p className="text-sm font-semibold text-purple-dark mb-1">{review.title}</p>

          {/* Review text */}
          <p className="text-sm text-slate-600 line-clamp-4">{review.review}</p>

          {/* Click hint */}
          <div className="flex items-center gap-1 mt-3 text-xs text-purple-primary/60">
            <ExternalLink size={12} />
            <span>Click to view opportunity</span>
          </div>

          {/* Org reply */}
          {review.org_reply && (
            <div className="mt-3 pt-3 border-t border-purple-100">
              <p className="text-xs font-semibold text-purple-primary mb-1">Organization Response</p>
              <p className="text-xs text-slate-600">{review.org_reply}</p>
            </div>
          )}
        </>
      )}
    </div>
  );

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <NewNav />
        <div className="text-center py-20 pt-28">
          <div className="inline-block w-12 h-12 border-4 border-purple-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <NewNav />

      <main className="max-w-7xl mx-auto px-6 py-12 pt-28">
        {/* Beta Banner */}
        <div className="mb-6 bg-gradient-to-r from-purple-primary to-purple-dark text-white text-center text-sm py-2 px-4 rounded-full font-medium max-w-2xl mx-auto">
          You're using the Beta version of StudentStarter+ — your feedback helps us improve!
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageSquare className="text-purple-primary" size={40} />
            <h1 className="text-5xl font-bold text-purple-dark">My Reviews</h1>
          </div>
          <p className="text-xl text-slate-600">
            See and manage all the reviews you've shared
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-10">
          <button
            onClick={() => setActiveTab("opportunities")}
            className={`px-8 py-3 rounded-full font-semibold text-base transition-all ${
              activeTab === "opportunities"
                ? "bg-purple-primary text-white shadow-lg"
                : "bg-white text-purple-dark hover:bg-purple-50"
            }`}
          >
            Opportunities ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab("organizations")}
            className={`px-8 py-3 rounded-full font-semibold text-base transition-all ${
              activeTab === "organizations"
                ? "bg-purple-primary text-white shadow-lg"
                : "bg-white text-purple-dark hover:bg-purple-50"
            }`}
          >
            Organizations ({orgGroups.length})
          </button>
        </div>

        {/* Content */}
        {reviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <MessageSquare className="mx-auto text-slate-300 mb-4" size={64} />
            <p className="text-xl text-slate-600 mb-2">
              You haven't shared your experiences yet!
            </p>
            <p className="text-slate-500 mb-6">
              Explore opportunities and let others know about your experience.
            </p>
            <Link
              to="/discover"
              className="inline-block px-8 py-3 bg-purple-primary text-white rounded-full font-semibold hover:bg-gold transition-colors"
            >
              Explore Opportunities
            </Link>
          </div>
        ) : activeTab === "opportunities" ? (
          /* Opportunities Tab — individual review cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => renderReviewCard(review, true))}
          </div>
        ) : (
          /* Organizations Tab — reviews grouped by organization, horizontal layout */
          <div className="space-y-6">
            {orgGroups.map(([orgId, group]) => (
              <div key={orgId} className="bg-white rounded-2xl shadow-lg p-6">
                {/* Org header row */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-primary to-gold/60 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-purple-dark">{group.name}</h2>
                    <p className="text-xs text-slate-500">
                      {group.reviews.length} review{group.reviews.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Horizontal scrollable review cards */}
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {group.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="min-w-[280px] max-w-[320px] shrink-0 bg-slate-50 rounded-xl p-4 border border-transparent hover:border-purple-primary transition-all cursor-pointer"
                      onClick={() => {
                        if (editingReviewId === review.id) return;
                        navigate(`/opportunity/${review.opportunity_id}`, { state: { scrollToReviews: true } });
                      }}
                    >
                      {editingReviewId === review.id ? (
                        <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                          <div>
                            <label className="text-xs font-semibold text-purple-dark mb-1 block">Name</label>
                            <input
                              value={editForm.title}
                              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-purple-200 focus:ring-2 focus:ring-gold focus:outline-none text-sm text-slate-700"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-purple-dark mb-1 block">Review</label>
                            <textarea
                              value={editForm.review}
                              onChange={(e) => setEditForm({ ...editForm, review: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-purple-200 focus:ring-2 focus:ring-gold focus:outline-none text-sm text-slate-700 h-16 resize-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-purple-dark mb-1 block">Rating</label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => {
                                const isFilled = star <= (editHover || editForm.rating);
                                return (
                                  <button type="button" key={star}
                                    onClick={() => setEditForm({ ...editForm, rating: star })}
                                    onMouseEnter={() => setEditHover(star)}
                                    onMouseLeave={() => setEditHover(0)}
                                  >
                                    <Star size={14} className={`transition-colors ${isFilled ? "text-yellow-400" : "text-gray-300"}`} fill={isFilled ? "currentColor" : "none"} />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleEditReview(review.id)} className="flex-1 px-3 py-1.5 text-xs bg-purple-primary text-white rounded-lg hover:bg-gold transition-colors font-semibold">Save</button>
                            <button onClick={cancelEditReview} className="flex-1 px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors font-semibold">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-semibold text-purple-dark leading-tight line-clamp-1">
                              {review.opportunities?.title || "Unknown Opportunity"}
                            </p>
                            <div className="flex items-center gap-2 ml-2 shrink-0">
                              <button onClick={(e) => { e.stopPropagation(); startEditReview(review); }} title="Edit review">
                                <Pencil size={12} className="text-purple-primary hover:text-gold transition-colors" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(review.id); }} title="Delete review">
                                <Trash2 size={12} className="text-slate-400 hover:text-red-500 transition-colors" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} size={12} className={star <= review.rating ? "text-amber-400" : "text-gray-300"} fill={star <= review.rating ? "currentColor" : "none"} />
                            ))}
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-3 mb-2">{review.review}</p>
                          <div className="flex items-center gap-1 text-[10px] text-purple-primary/50">
                            <ExternalLink size={10} />
                            <span>View opportunity</span>
                          </div>
                          {review.org_reply && (
                            <div className="mt-2 pt-2 border-t border-purple-100">
                              <p className="text-[10px] font-semibold text-purple-primary mb-0.5">Org Response</p>
                              <p className="text-[10px] text-slate-600 line-clamp-2">{review.org_reply}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onConfirm={handleDeleteReview}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText="Delete"
        confirmColor="red"
      />

      <Footer />
    </div>
  );
};

export default MyReviews;
