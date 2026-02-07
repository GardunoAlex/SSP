import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Building2, Plus, Edit, Trash2, Eye } from "lucide-react";
import useLocalStorage from "../hooks/useLocalStorage";
import { getSupabaseUser } from "../lib/apiHelpers";
import Footer from "../components/Footer";
import { OrgDashboardSkeleton } from "../components/Skeletons";

const MIN_LOAD_MS = 300;
import NewNav from "../components/newNav.jsx";

const OrgDashboard = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const [cachedSupaUser, setCachedSupaUser] = useLocalStorage("supaUser", null);
  const [organization, setOrganization] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    org_description: "",
    website: "",
    email: "",
  });

  useEffect(() => {
    if (user) {
      fetchOrgData();
    }
  }, [user]);

  const fetchOrgData = async () => {
    setLoading(true);
    const minDelay = new Promise(r => setTimeout(r, MIN_LOAD_MS));
    try {
      const supaUser = await getSupabaseUser(getAccessTokenSilently);
      if (!cachedSupaUser && supaUser?.id) setCachedSupaUser(supaUser);
      const userId = supaUser?.id;
      if (!userId) throw new Error('Could not resolve user id');

      // Fetch organization profile from Supabase
      const orgRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/organizations/${userId}`);
      
      if (!orgRes.ok) {
        throw new Error(`Failed to fetch organization: ${orgRes.status}`);
      }
      
      const orgData = await orgRes.json();

      if (orgData) {
        setOrganization(orgData);
        setProfileForm({
          name: orgData.name || "",
          org_description: orgData.org_description || "",
          website: orgData.website || "",
          email: orgData.email || "",
        });

        // Fetch organization's opportunities
        const oppsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/opportunities/org/${userId}`);
        if (oppsRes.ok) {
          const oppsData = await oppsRes.json();
          setOpportunities(oppsData);
        }
      } else {
        throw new Error("No organization data returned");
      }

      await minDelay;
    } catch (error) {
      console.error("Error fetching org data:", error);
      await minDelay;
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const token = await getAccessTokenSilently();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/organizations/${organization.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
         },
        body: JSON.stringify(profileForm),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const updated = await res.json();
      setOrganization(updated);
      setEditingProfile(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  const handleDeleteOpportunity = async (oppId) => {
    if (!confirm("Are you sure you want to delete this opportunity?")) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/opportunities/${oppId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete opportunity");

      setOpportunities(prev => prev.filter(opp => opp.id !== oppId));
      alert("Opportunity deleted successfully!");
    } catch (error) {
      console.error("Error deleting opportunity:", error);
      alert("Failed to delete opportunity");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <NewNav />
        <main className="max-w-7xl mx-auto px-6 py-12 pt-28">
          <OrgDashboardSkeleton />
        </main>
      </div>
    );
  }

  // Error state
  if (error || !organization) {
    return (
      <div className="min-h-screen bg-cream">
        <NewNav />
        <div className="max-w-4xl mx-auto px-6 py-20 pt-32 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <h1 className="text-3xl font-bold text-purple-dark mb-4">
              Unable to Load Organization
            </h1>
            <p className="text-slate-600 mb-6">
              {error || "Could not load organization data. Please try again."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-purple-primary text-white rounded-lg hover:bg-gold transition-colors font-semibold"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Onboarding state - check for empty name (first time setup)
  if (organization.name == "N/A" || organization.email == "N/A") {
    return (
      <div className="min-h-screen bg-cream">
        <NewNav />
        <div className="max-w-6xl mx-auto px-6 py-20 pt-32">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-purple-dark mb-4">
              Welcome to Your Dashboard! 👋
            </h1>
            <p className="text-xl text-slate-600">
              Let's get your organization set up so you can start posting opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center border-2 border-transparent hover:border-purple-primary transition-all">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">1️⃣</span>
              </div>
              <h3 className="text-xl font-bold text-purple-dark mb-2">Set Up Profile</h3>
              <p className="text-slate-600 text-sm">
                Add your organization's name, description, and contact info
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 text-center border-2 border-transparent hover:border-purple-primary transition-all">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">2️⃣</span>
              </div>
              <h3 className="text-xl font-bold text-purple-dark mb-2">Post Opportunities</h3>
              <p className="text-slate-600 text-sm">
                Create internships, jobs, and other opportunities for students
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 text-center border-2 border-transparent hover:border-purple-primary transition-all">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">3️⃣</span>
              </div>
              <h3 className="text-xl font-bold text-purple-dark mb-2">Connect with Students</h3>
              <p className="text-slate-600 text-sm">
                Reach thousands of talented students looking for opportunities
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-purple-dark mb-6">Complete Your Profile</h2>
            
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-purple-dark mb-2">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-primary"
                  placeholder="Organization name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-purple-dark mb-2">
                  Description *
                </label>
                <textarea
                  value={profileForm.org_description}
                  onChange={(e) => setProfileForm({ ...profileForm, org_description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-primary"
                  placeholder="Tell students about your organization..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-purple-dark mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={profileForm.website}
                    onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-primary"
                    placeholder="https://yourorganization.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-purple-dark mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-primary"
                    placeholder="contact@organization.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-purple-primary text-white rounded-lg hover:bg-gold transition-colors font-semibold text-lg"
              >
                Complete Setup & Go to Dashboard
              </button>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Main dashboard (org profile is complete)
  return (
    <div className="min-h-screen bg-cream">
      <NewNav />
      <main className="max-w-7xl mx-auto px-6 py-12 pt-28 min-h-[75vh]">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === "profile"
                ? "text-purple-primary border-b-2 border-purple-primary"
                : "text-slate-600 hover:text-purple-primary"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("opportunities")}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === "opportunities"
                ? "text-purple-primary border-b-2 border-purple-primary"
                : "text-slate-600 hover:text-purple-primary"
            }`}
          >
            Opportunities ({opportunities.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === "profile" ? (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-purple-dark">Organization Profile</h2>
              {!editingProfile && (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-primary text-white rounded-lg hover:bg-gold transition-colors"
                >
                  <Edit size={16} />
                  Edit Profile
                </button>
              )}
            </div>

            {editingProfile ? (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-purple-dark mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-purple-dark mb-2">
                    Description
                  </label>
                  <textarea
                    value={profileForm.org_description}
                    onChange={(e) => setProfileForm({ ...profileForm, org_description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-purple-dark mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={profileForm.website}
                    onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-purple-dark mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-primary"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-purple-primary text-white rounded-lg hover:bg-gold transition-colors font-semibold"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProfile(false);
                      setProfileForm({
                        name: organization.name || "",
                        org_description: organization.org_description || "",
                        website: organization.website || "",
                        email: organization.email || "",
                      });
                    }}
                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 mb-1">Description</h3>
                  <p className="text-slate-700">{organization.org_description || "No description"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-500 mb-1">Website</h3>
                  {organization.website ? (
                    <a
                      href={organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-primary hover:underline"
                    >
                      {organization.website}
                    </a>
                  ) : (
                    <p className="text-slate-400">No website</p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-500 mb-1">Contact Email</h3>
                  <p className="text-slate-700">{organization.email || "No email"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-500 mb-1">Status</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    organization.verified 
                      ? "bg-green-100 text-green-700" 
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {organization.verified ? "✓ Verified" : "Pending Verification"}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-purple-dark">Your Opportunities</h2>
              <button
                onClick={() => window.location.href = "/org/create-opportunity"}
                className="flex items-center gap-2 px-4 py-2 bg-purple-primary text-white rounded-lg hover:bg-gold transition-colors font-semibold"
              >
                <Plus size={16} />
                Create New Opportunity
              </button>
            </div>

            {opportunities.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <Building2 size={64} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-600 mb-2">No Opportunities Yet</h3>
                <p className="text-slate-500 mb-6">Create your first opportunity to get started</p>
                <button
                  onClick={() => window.location.href = "/org/create-opportunity"}
                  className="px-6 py-3 bg-purple-primary text-white rounded-lg hover:bg-gold transition-colors font-semibold"
                >
                  Create Opportunity
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {opportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-purple-primary transition-all"
                  >
                    <h3 className="text-xl font-bold text-purple-dark mb-2">{opp.title}</h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">{opp.description}</p>

                    {opp.majors?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {opp.majors.slice(0, 3).map((major, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                          >
                            {major}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => window.location.href = `/org/edit-opportunity/${opp.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-primary text-white rounded-lg hover:bg-gold transition-colors font-semibold text-sm"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteOpportunity(opp.id)}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-semibold text-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default OrgDashboard;