import { useNavigate } from "react-router-dom";
import { GraduationCap, Search, BookmarkCheck, Building2 } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-t from-indigo-300 to-stone-50 min-h-screen">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-6 py-16">
        <div className="flex justify-center items-center mb-4 gap-2">
          <GraduationCap className="text-indigo-600 w-10 h-10" />
          <h1 className="text-4xl sm:text-5xl font-bold text-sky-400">
            Student<span className="text-yellow-400">Starter</span>
            <span className="text-indigo-600">+</span>
          </h1>
        </div>
        <p className="text-gray-600 mt-4 text-lg">
          Connecting students to verified opportunities that help them grow.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => navigate("/opportunities")}
            className="bg-blue-500 hover:bg-indigo-600 text-white font-medium px-6 py-3 rounded-lg shadow-md transition"
          >
            Explore Opportunities
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-12 grid gap-8 md:grid-cols-3">
        <div className="bg-white shadow-sm rounded-2xl p-6 border hover:shadow-md transition">
          <Search className="text-indigo-600 w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Discover Opportunities
          </h3>
          <p className="text-gray-600 text-sm">
            Browse verified events, mentorships, and programs tailored to your interests.
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-2xl p-6 border hover:shadow-md transition">
          <BookmarkCheck className="text-indigo-600 w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Save and Track
          </h3>
          <p className="text-gray-600 text-sm">
            Bookmark your favorite opportunities and keep them all in one place.
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-2xl p-6 border hover:shadow-md transition">
          <Building2 className="text-indigo-600 w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            For Organizations
          </h3>
          <p className="text-gray-600 text-sm">
            Share verified opportunities with students across campuses — simple, transparent, and free.
          </p>
        </div>
      </section>
    </div>
  );
}
