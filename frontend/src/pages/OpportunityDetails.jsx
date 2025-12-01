import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import useLocalStorage from "../hooks/useLocalStorage";
import { getSupabaseUser } from "../lib/apiHelpers";
import { clearCached } from "../lib/apiCache";
import NewNav from "../components/newNav";
import Footer from "../components/Footer";
import { useAuth0 } from "@auth0/auth0-react";
import { Star } from 'lucide-react';
import { MessageSquarePlus } from 'lucide-react';


export default function OpportunityDetails() {
  const { id } = useParams();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const { user, getAccessTokenSilently, isAuthenticated, loginWithRedirect } = useAuth0();
  
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cachedSupaUser, setCachedSupaUser] = useLocalStorage("supaUser", null);
  const [savedOppIds, setSavedOppIds] = useLocalStorage("savedOppIds", []);
  const [isSaving, setIsSaving] = useState(false);
  const [addReview, setAddReview] = useState(false);
  const [hover, setHover] = useState(0);
  const [userId, setUserId] = useState(null);
  const [reviews, setReviews] = useState([])
  const [form, setForm] = useState({
    title: "",
    review: "",
    rating: 0,
  });


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

  const fetchReviews = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/reviews/${id}`
      );
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.log("no good", err)
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id])

 


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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) {
      alert("Please select a star rating before submitting.");
      return;
    }
    try{
      const token = await getAccessTokenSilently();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
        title: form.title,
        review: form.review,
        rating: form.rating,
        student_id: userId,        
      }),
      });

      if (!res.ok) throw new Error("Failed to create review");
      

      setForm({
      title: "",
      description: "",
      review: 0,
      });
      setAddReview(false);
      fetchReviews();
    } catch (err) {
      console.log("error", err);
    }
    
  }

  return (

    <div className="min-h-screen bg-cream pt-20">
      <NewNav />
      <div className="max-w-6xl mx-auto px-6 pb-20">
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
              <span className="font-semibold text-purple-dark">
                GPA Requirement:
              </span>{" "}
              {opportunity.gpa_requirement || "N/A"}
            </p>
            {opportunity.majors?.length > 0 && (
              <p>
                <span className="font-semibold text-purple-dark">
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
              <span className="font-semibold text-purple-dark">
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

        {/*review section */}
        <div>
          {addReview ? (
            <div className="mb-5">

              <form onSubmit={handleSubmit} className="space-y-6 mt-6 bg-white p-6 rounded-xl shadow-md border border-purple-100 ">
                
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-purple-dark mb-1">Title</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-4 py-2 rounded-lg border border-purple-200 focus:ring-2 focus:ring-gold focus:outline-none text-slate-700" required/>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-purple-dark mb-1">Review</label>
                  <textarea name="" id="" value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} className="px-4 py-2 rounded-lg border border-purple-200 focus:ring-2 focus:ring-gold focus:outline-none text-slate-700 h-28 resize-none" required/>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-purple-dark mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = star <= (hover || form.rating);
                      return (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setForm({ ...form, rating: star })}
                          onMouseEnter={() => setHover(star)}
                          onMouseLeave={() => setHover(0)}
                        >
                          <Star
                            size={22}
                            className={`transition-colors ${
                              isFilled ? "text-yellow-400" : "text-gray-300"
                            }`}
                            fill={isFilled ? "currentColor" : "none"}   // ⭐ fill logic
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="w-1/2 bg-purple-primary text-white py-3 rounded-lg font-semibold hover:bg-green-100 hover:text-purple-dark transition-all shadow-md">Submit</button>
                  <button type="button" onClick={() => setAddReview(false)} className="w-1/2 bg-purple-primary text-white py-3 rounded-lg font-semibold hover:bg-red-100 hover:text-purple-dark transition-all shadow-md">Cancel</button>
                </div>

              </form>
            </div>
          ) : (
            <div className="flex gap-2 p-5">
              <p>Would you like to add a review? </p>
              <button type="button" onClick={() => setAddReview(true)} className=" px-2  rounded-lg  hover:text-green-700 transition"> <MessageSquarePlus  size={20}/> </button>
            </div>
            )}
            <div>

          </div>
        </div>

        <div className=" bg-white rounded-2xl shadow-lg p-6">
          <div className="text-2xl font-bold text-purple-dark pb-3">
            Reviews
          </div>
          <div className="grid grid-cols-3 gap-4">
            {reviews.map((review) => (
              <div key={review.id} className="group relative bg-gradient-to-br from-purple-50 to-white p-5 rounded-xl border-2 border-purple-100 hover:border-gold hover:shadow-xl transition-all duration-300 cursor-pointer">

                <div className="flex justify-between items-center">
                  <div className="font-bold text-purple-dark mb-1 group-hover:text-gold transition-colors">{review.title}</div>
                  <div className="flex gap-1">
                    <Star size={22} className="text-amber-400"/>
                    <div>{review.rating}</div>
                  </div>
                </div>

                {review.review.length > 200 ? (
                  <div className="pt-2">{review.review.slice(0,200)}...</div>
                ) : (
                  <div className="pt-2">{review.review}</div>
                )}
              </div>
          ))}

          </div>
        </div>
      </div>

      <Footer />
    </div>

  );
}