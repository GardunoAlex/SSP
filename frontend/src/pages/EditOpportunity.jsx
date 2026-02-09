import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { ArrowLeft } from "lucide-react";
import useLocalStorage from "../hooks/useLocalStorage";
import { getSupabaseUser } from "../lib/apiHelpers";
import NewNav from "../components/newNav.jsx";
import Footer from "../components/Footer";
import ImageUpload from "../components/ImageUpload.jsx";

const EditOpportunity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getAccessTokenSilently } = useAuth0();
  const [, setCachedSupaUser] = useLocalStorage("supaUser", null);
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
    banner_url: "",
  });

  const [majorInput, setMajorInput] = useState("");

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, id]);

  const fetchData = async () => {
    try {
      // Always fetch fresh to avoid stale cache from a different account/role
      const supaUser = await getSupabaseUser(getAccessTokenSilently);
      if (supaUser?.id) setCachedSupaUser(supaUser);
      const userId = supaUser?.id;
      if (!userId) throw new Error("Could not resolve user id");

      // Fetch organization
      const orgRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/organizations/${userId}`);
      if (!orgRes.ok) throw new Error(`Failed to fetch organization: ${orgRes.status}`);
      const orgData = await orgRes.json();

      if (orgData) {
        setOrganization(orgData);
      }

      // Fetch opportunity
      const oppRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/opportunities/${id}`);
      const oppData = await oppRes.json();
      
      setFormData({
        title: oppData.title || "",
        description: oppData.description || "",
        gpa_requirement: oppData.gpa_requirement || "",
        majors: oppData.majors || [],
        location: oppData.location || "",
        apply_link: oppData.apply_link || "",
        deadline: oppData.deadline ? oppData.deadline.split('T')[0] : "",
        compensation: oppData.compensation || "",
        banner_url: oppData.banner_url || "",
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
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

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/opportunities/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update opportunity");

      alert("Opportunity updated successfully!");
      navigate("/org/dashboard");
    } catch (error) {
      console.error("Error updating opportunity:", error);
      alert("Failed to update opportunity. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <NewNav />
        <div className="text-center py-20">
          <div className="inline-block w-12 h-12 border-4 border-purple-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <NewNav />

      <main className="max-w-4xl mx-auto px-6 py-12 pt-28">
        <button
          onClick={() => navigate("/org/dashboard")}
          className="flex items-center gap-2 text-purple-dark hover:text-gold mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-purple-dark mb-2">Edit Opportunity</h1>
          <p className="text-slate-600 mb-8">Update the details of your opportunity</p>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="mb-8">
              <ImageUpload 
                currentUrl={formData.banner_url} 
                onUpload={(newUrl) => setFormData({...formData, banner_url: newUrl})}
                entityType="opportunity"
                entityId={id} 
                getToken={getAccessTokenSilently}
                entityName={formData.title}
              />
            </div>
            {/* Same form fields as CreateOpportunity */}
            <div>
              <label className="block text-sm font-semibold text-purple-dark mb-2">
                Opportunity Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-purple-dark mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-primary"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-purple-dark mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-purple-dark mb-2">
                Relevant Majors
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={majorInput}
                  onChange={(e) => setMajorInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddMajor())}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-primary"
                />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-purple-dark mb-2">
                  Application Link *
                </label>
                <input
                  type="url"
                  value={formData.apply_link}
                  onChange={(e) => setFormData({ ...formData, apply_link: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-primary"
                  required
                />
              </div>

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

            <div>
              <label className="block text-sm font-semibold text-purple-dark mb-2">
                Compensation
              </label>
              <input
                type="text"
                value={formData.compensation}
                onChange={(e) => setFormData({ ...formData, compensation: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-primary"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 px-6 py-3 bg-purple-primary text-white rounded-lg font-semibold transition-colors ${
                  submitting ? "opacity-50 cursor-not-allowed" : "hover:bg-gold"
                }`}
              >
                {submitting ? "Saving..." : "Save Changes"}
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

export default EditOpportunity;