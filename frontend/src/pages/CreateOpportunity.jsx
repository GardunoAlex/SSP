import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { ArrowLeft } from "lucide-react";
import useLocalStorage from "../hooks/useLocalStorage";
import { getSupabaseUser } from "../lib/apiHelpers";
import OrgNav from "../components/OrgNav";
import Footer from "../components/Footer";

const CreateOpportunity = () => {
  const navigate = useNavigate();
  const { user, getAccessTokenSilently } = useAuth0();
  const [cachedSupaUser, setCachedSupaUser] = useLocalStorage("supaUser", null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    gpa_requirement: "",
    majors: [],
    location: "",
    apply_link: "",
    deadline: "",
    compensation: "",
  });

  const [majorInput, setMajorInput] = useState("");

  const MAJORS = [
    "Technology",
    "Engineering",
    "Business",
    "Healthcare",
    "Marketing",
  ];

  useEffect(() => {
    if (user) {
      fetchOrgData();
    }
  }, [user]);

  const fetchOrgData = async () => {
    try {
      const supaUser = cachedSupaUser || await getSupabaseUser(getAccessTokenSilently);
      if (!cachedSupaUser && supaUser?.id) setCachedSupaUser(supaUser);
      const userId = supaUser?.id;

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/organizations/user/${userId}`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        setOrganization(data[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching org data:", error);
      setLoading(false);
    }
  };

  const handleAddMajor = () => {
    if (majorInput.trim() && !formData.majors.includes(majorInput.trim())) {
      setFormData({ ...formData, majors: [...formData.majors, majorInput.trim()] });
      setMajorInput("");
    }
  };

  const handleRemoveMajor = (major) => {
    setFormData({ ...formData, majors: formData.majors.filter(m => m !== major) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        gpa_requirement: formData.gpa_requirement || null,
      };

      const token = await getAccessTokenSilently();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/opportunities`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
         },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create opportunity");

      alert("Opportunity created successfully!");
      navigate("/org/dashboard");
    } catch (error) {
      console.error("Error creating opportunity:", error);
      alert("Failed to create opportunity. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <OrgNav />
        <div className="text-center py-20">
          <div className="inline-block w-12 h-12 border-4 border-purple-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-cream">
        <OrgNav />
        <div className="max-w-4xl mx-auto px-6 py-20 pt-32 text-center">
          <h1 className="text-3xl font-bold text-purple-dark mb-4">No Organization Found</h1>
          <p className="text-slate-600">Please contact support to set up your organization.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <OrgNav />

      <main className="max-w-4xl mx-auto px-6 py-12 pt-28">
        <button
          onClick={() => navigate("/org/dashboard")}
          className="flex items-center gap-2 text-purple-dark hover:text-gold mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-purple-dark mb-2">Create New Opportunity</h1>
          <p className="text-slate-600 mb-8">Fill out the details below to post a new opportunity</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-purple-dark mb-2">
                Opportunity Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-primary"
                placeholder="e.g., Summer Software Engineering Internship"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-purple-dark mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-primary"
                placeholder="Describe the opportunity, responsibilities, and requirements..."
                required
              />
            </div>

            {/* Two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GPA Requirement */}
              <div>
                <label className="block text-sm font-semibold text-purple-dark mb-2">
                  Minimum GPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={formData.gpa_requirement}
                  onChange={(e) => setFormData({ ...formData, gpa_requirement: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-primary"
                  placeholder="e.g., 3.0"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-purple-dark mb-2">
                  Location
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="
                    w-full px-4 py-2 rounded-lg border border-slate-300 bg-white
                    text-slate-700 shadow-sm
                    focus:outline-none focus:ring-2 focus:ring-purple-primary/40
                    focus:border-purple-primary
                    hover:border-purple-primary transition
                  "
                >
                  <option value="">Select Location</option>
                  {["Remote", "On-Site", "Hybrid"].map((location) => (
                      <option key={location} value={location}>{location}</option>
                  ))}
                  
                </select>
              </div>
            </div>

            {/* Majors */}
            <div>
              <label className="block text-sm font-semibold text-purple-dark mb-2">
                Relevant Majors
              </label>
              <div className="flex gap-2 mb-2">
                <select
                  value={majorInput}
                  onChange={(e) => setMajorInput(e.target.value)}
                  className="
                    w-full px-4 py-2 rounded-lg border border-slate-300 bg-white
                    text-slate-700 shadow-sm
                    focus:outline-none focus:ring-2 focus:ring-purple-primary/40
                    focus:border-purple-primary
                    hover:border-purple-primary transition
                  "
                >
                  <option value="">Select Industry</option>
                  {MAJORS.map((major) => (
                      <option key={major} value={major}>{major}</option>
                  ))}
                  
                </select>
                <button
                  type="button"
                  onClick={handleAddMajor}
                  className="px-4 py-2 bg-purple-primary text-white rounded-lg hover:bg-gold transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.majors.map((major, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    {major}
                    <button
                      type="button"
                      onClick={() => handleRemoveMajor(major)}
                      className="text-purple-700 hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Application Link */}
              <div>
                <label className="block text-sm font-semibold text-purple-dark mb-2">
                  Application Link *
                </label>
                <input
                  type="url"
                  value={formData.apply_link}
                  onChange={(e) => setFormData({ ...formData, apply_link: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-primary"
                  placeholder="https://..."
                  required
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-semibold text-purple-dark mb-2">
                  Application Deadline
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-primary"
                />
              </div>
            </div>

            {/* Compensation */}
            <div>
              <label className="block text-sm font-semibold text-purple-dark mb-2">
                Compensation
              </label>
              <select
                value={formData.compensation}
                onChange={(e) => setFormData({ ...formData, compensation: e.target.value })}
                className="
                  w-full px-4 py-2 rounded-lg border border-slate-300 bg-white
                  text-slate-700 shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-purple-primary/40
                  focus:border-purple-primary
                  hover:border-purple-primary transition
                "
              >
                <option value="">Select compensation</option>
                {["Paid", "Unpaid", "Stipend"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                ))}
                
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 px-6 py-3 bg-purple-primary text-white rounded-lg font-semibold transition-colors ${
                  submitting ? "opacity-50 cursor-not-allowed" : "hover:bg-gold"
                }`}
              >
                {submitting ? "Creating..." : "Create Opportunity"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/org/dashboard")}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateOpportunity;