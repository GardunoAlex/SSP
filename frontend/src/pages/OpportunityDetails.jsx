import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import NewNav from "../components/newNav";
import Footer from "../components/Footer";

export default function OpportunityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-cream">

      <div className="max-w-4xl mx-auto mt-32 px-6 pb-20">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-purple-dark hover:text-gold mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-8">
          <h1 className="text-3xl font-bold text-purple-primary mb-3">
            {opportunity.title}
          </h1>
          <p className="text-slate-700 text-lg mb-6">
            {opportunity.description}
          </p>

          <div className="space-y-3 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-purple-primary">
                GPA Requirement:
              </span>{" "}
              {opportunity.gpa_requirement || "N/A"}
            </p>
            {opportunity.majors?.length > 0 && (
              <p>
                <span className="font-semibold text-purple-primary">
                  Majors:
                </span>{" "}
                {opportunity.majors.join(", ")}
              </p>
            )}
            <p>
              <span className="font-semibold text-purple-primary">
                Posted On:
              </span>{" "}
              {new Date(opportunity.created_at).toLocaleDateString()}
            </p>
          </div>

          <a
            href={opportunity.apply_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-8 bg-purple-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-gold transition"
          >
            Apply Now
          </a>
        </div>
      </div>

    </div>
  );
}