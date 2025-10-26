import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function OpportunityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/opportunities/${id}`);
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
    return <p className="text-center mt-20 text-gray-500">Loading...</p>;

  if (!opportunity)
    return <p className="text-center mt-20 text-gray-500">Opportunity not found.</p>;

  return (
    <div className="max-w-4xl mx-auto mt-24 px-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-white rounded-2xl shadow-sm border p-8">
        <h1 className="text-3xl font-bold text-indigo-600 mb-3">
          {opportunity.title}
        </h1>
        <p className="text-gray-700 text-lg mb-6">{opportunity.description}</p>

        <div className="space-y-3 text-sm text-gray-600">
          <p>
            <span className="font-semibold text-indigo-600">GPA Requirement:</span>{" "}
            {opportunity.gpa_requirement || "N/A"}
          </p>
          {opportunity.majors?.length > 0 && (
            <p>
              <span className="font-semibold text-indigo-600">Majors:</span>{" "}
              {opportunity.majors.join(", ")}
            </p>
          )}
          <p>
            <span className="font-semibold text-indigo-600">Posted On:</span>{" "}
            {new Date(opportunity.created_at).toLocaleDateString()}
          </p>
        </div>

        <a
          href={opportunity.apply_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-8 bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-600 transition"
        >
          Apply Now
        </a>
      </div>
    </div>
  );
}
