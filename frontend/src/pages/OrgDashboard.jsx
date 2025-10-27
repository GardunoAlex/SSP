import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "../components/Navbar";

export default function OrgDashboard() {
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();
  const [opportunities, setOpportunities] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    gpa_requirement: "",
    link: "",
    majors: "",
  });

  console.log("Auth0 user object:", user);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchOpportunities = async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/org/opportunities`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        // ✅ Only keep active opportunities
        const activeOpportunities = data.filter((opp) => opp.status === "active");
        setOpportunities(activeOpportunities);
      } catch (err) {
        console.error("Error fetching org opportunities:", err);
      }
    };

    fetchOpportunities();
  }, [isAuthenticated, getAccessTokenSilently]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/org/opportunities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setOpportunities([...opportunities, data[0]]);
      setForm({ title: "", description: "", gpa_requirement: "", link: "", majors: "" });
    } catch (err) {
      console.error("Error creating opportunity:", err);
    }
  };

  // ✅ Role & Auth checks happen before render
  if (!isAuthenticated) {
    return <p className="text-center mt-20 text-gray-600">Please log in.</p>;
  }

  if (user && user["https://studentstarter.com/role"] !== "org") {
    return <p className="text-center mt-20 text-gray-600">Access denied. Organization accounts only.</p>;
  }

  // ✅ Main render
  return (
    <>
        <Navbar />
        <div className="max-w-5xl mx-auto mt-20 p-6">
            <h1 className="text-3xl font-bold text-indigo-600 mb-6">Organization Dashboard</h1>

            {/* Opportunity form */}
            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-sm">
                <input
                type="text"
                placeholder="Opportunity Title"
                className="w-full border p-2 rounded"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                />
                <textarea
                placeholder="Description"
                className="w-full border p-2 rounded"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                />
                <input
                type="number"
                placeholder="GPA Requirement"
                className="w-full border p-2 rounded"
                value={form.gpa_requirement}
                onChange={(e) => setForm({ ...form, gpa_requirement: e.target.value })}
                />
                <input
                type="text"
                placeholder="Majors (comma separated)"
                className="w-full border p-2 rounded"
                value={form.majors}
                onChange={(e) => setForm({ ...form, majors: e.target.value })}
                />
                <input
                type="url"
                placeholder="Application Link"
                className="w-full border p-2 rounded"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                />

                <button className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition">
                Create Opportunity
                </button>
            </form>

            {/* Opportunities list */}
            <div className="mt-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Your Opportunities</h2>
                {opportunities.length === 0 ? (
                <p className="text-gray-500">You haven’t posted any opportunities yet.</p>
                ) : (
                <ul className="space-y-3">
                    {opportunities.map((opp) => (
                    <li
                        key={opp.id}
                        className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center border"
                    >
                        <div>
                        <h3 className="text-lg font-semibold">{opp.title}</h3>
                        <p className="text-gray-600 text-sm">{opp.description}</p>
                        </div>
                        <button
                        className="text-red-500 hover:text-red-700"
                        onClick={async () => {
                            try {
                            const token = await getAccessTokenSilently();
                            await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/org/opportunities/${opp.id}`, {
                                method: "DELETE", // backend updates status
                                headers: { Authorization: `Bearer ${token}` },
                            });

                            // instantly update UI
                            setOpportunities((prev) => prev.filter((o) => o.id !== opp.id));
                            } catch (err) {
                            console.error("Error closing opportunity:", err);
                            }
                        }}
                        >
                        Close
                        </button>
                    </li>
                    ))}
                </ul>
                )}
            </div>
            </div>  
    
    </>
    
  );
}
