import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  TrendingUp,
  BookmarkCheck,
  Award,
  Sparkles,
  ChevronRight,
  Calendar,
  Target,
  Star,
  Zap,
  Heart,
  CheckCircle2,
} from "lucide-react";
import StudentNav from "../components/StudentNav";
import Footer from "../components/Footer";

const StudentDashboard = () => {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const [profileCompletion, setProfileCompletion] = useState(75);
  const [stats, setStats] = useState({
    deadlinesSoon: 3,
    applicationsDrafted: 1,
    newMatches: 4,
  });

  // API CALL: Fetch user dashboard data
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([
    {
      id: 1,
      title: "Google STEP Internship",
      organization: "Google",
      daysLeft: 3,
      status: "saved",
      matchScore: 95,
    },
    {
      id: 2,
      title: "McKinsey Forward Program",
      organization: "McKinsey",
      daysLeft: 7,
      status: "draft",
      matchScore: 88,
    },
    {
      id: 3,
      title: "Tech Career Fair 2025",
      organization: "University Hub",
      daysLeft: 14,
      status: "saved",
      matchScore: 92,
    },
  ]);

  const [topMatches, setTopMatches] = useState([
    {
      id: 1,
      title: "Software Engineering Fellowship",
      organization: "Meta",
      type: "Fellowship",
      matchScore: 98,
      deadline: "Jan 30",
    },
    {
      id: 2,
      title: "Data Science Mentorship",
      organization: "IBM",
      type: "Mentorship",
      matchScore: 95,
      deadline: "Feb 15",
    },
    {
      id: 3,
      title: "Product Design Internship",
      organization: "Figma",
      type: "Internship",
      matchScore: 91,
      deadline: "Feb 28",
    },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case "saved":
        return "bg-blue-100 text-blue-700";
      case "draft":
        return "bg-yellow-100 text-yellow-700";
      case "applied":
        return "bg-green-100 text-green-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "saved":
        return "Saved";
      case "draft":
        return "In Progress";
      case "applied":
        return "Applied";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <StudentNav />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-yellow-200/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl animate-float"></div>
      </div>

      {/* Animated Background */}
      <main className="relative pt-28 pb-20 px-6 max-w-7xl mx-auto">
        <div className="relative mb-8 bg-gradient-to-br from-purple-600 via-purple-500 to-gold rounded-3xl p-8 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Welcome back, {user?.given_name || user?.name || "Student"}!
                </h1>
              </div>
              <p className="text-white/90 text-lg mb-4">
                Ready to discover your next opportunity?
              </p>

              {/*Stat placeholders for now */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Clock className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold">
                    {stats.deadlinesSoon} Deadlines Soon
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <BookmarkCheck className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold">
                    {stats.applicationsDrafted} Application Started
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Zap className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold">
                    {stats.newMatches} New Matches
                  </span>
                </div>
              </div>
            </div>

            {/* Demo profile completion card*/}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl min-w-[280px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-purple-dark">Profile Strength</h3>
                <Target className="w-5 h-5 text-purple-primary" />
              </div>
              
              <div className="relative mb-4">
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-primary to-gold transition-all duration-1000 ease-out"
                    style={{ width: `${profileCompletion}%` }}
                  ></div>
                </div>
                <span className="absolute -top-1 right-0 text-2xl font-bold text-purple-primary">
                  {profileCompletion}%
                </span>
              </div>

              <button
                onClick={() => navigate("/profile")}
                className="w-full bg-gradient-to-r from-purple-primary to-gold text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Complete Profile
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Demo Deadlines & Alerts */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-red-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-purple-dark">
                      Deadlines in Focus
                    </h2>
                    <p className="text-slate-600 text-sm">
                      Don't miss these upcoming opportunities
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/saved")}
                  className="text-purple-primary hover:text-gold font-semibold flex items-center gap-1 transition-colors"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {upcomingDeadlines.map((item, index) => (
                  <div
                    key={item.id}
                    className="group relative bg-gradient-to-r from-slate-50 to-white p-5 rounded-xl border-2 border-slate-100 hover:border-purple-primary transition-all duration-300 hover:shadow-lg cursor-pointer"
                    onClick={() => navigate(`/opportunity/${item.id}`)}
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: "fadeInUp 0.5s ease-out forwards",
                      opacity: 0,
                    }}
                  >
                    {/* Demo countdown (Might not implement */}
                    <div className="absolute -top-3 -right-3 bg-gradient-to-br from-red-500 to-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg animate-pulse">
                      {item.daysLeft} DAYS LEFT!
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-primary to-gold rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-white" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-purple-dark text-lg mb-1 group-hover:text-purple-primary transition-colors">
                              {item.title}
                            </h3>
                            <p className="text-slate-600 text-sm">
                              {item.organization}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                item.status
                              )}`}
                            >
                              {getStatusText(item.status)}
                            </span>
                            <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                              <Star className="w-3 h-3 text-green-600 fill-green-600" />
                              <span className="text-xs font-bold text-green-700">
                                {item.matchScore}% Match
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar (Testing only might remove for deployment*/}
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-3">
                          <div
                            className="h-full bg-gradient-to-r from-purple-primary to-gold"
                            style={{
                              width: `${
                                item.status === "saved"
                                  ? 25
                                  : item.status === "draft"
                                  ? 60
                                  : 100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate("/saved")}
                className="w-full mt-4 py-3 border-2 border-purple-primary text-purple-primary font-semibold rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
              >
                Manage My Saved Items
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Top Matches Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-primary to-gold rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-purple-dark">
                      Top Matches for You
                    </h2>
                    <p className="text-slate-600 text-sm">
                      Personalized based on your profile
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/discover")}
                  className="text-purple-primary hover:text-gold font-semibold flex items-center gap-1 transition-colors"
                >
                  Explore All
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {topMatches.map((match, index) => (
                  <div
                    key={match.id}
                    className="group relative bg-gradient-to-br from-purple-50 to-white p-5 rounded-xl border-2 border-purple-100 hover:border-gold hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/opportunity/${match.id}`)}
                    style={{
                      animationDelay: `${index * 150}ms`,
                      animation: "fadeInUp 0.5s ease-out forwards",
                      opacity: 0,
                    }}
                  >
                    {/* Match Score Badge */}
                    <div className="absolute -top-3 -right-3 bg-gradient-to-br from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full font-bold text-xs shadow-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {match.matchScore}% Match
                    </div>

                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full mb-2">
                        {match.type}
                      </span>
                      <h3 className="font-bold text-purple-dark mb-1 group-hover:text-gold transition-colors">
                        {match.title}
                      </h3>
                      <p className="text-slate-600 text-sm">{match.organization}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-slate-600 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>Due {match.deadline}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-purple-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Engagement & Progress */}
          <div className="space-y-6">
            {/* My Organizations */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-purple-dark text-lg mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                My Organizations
              </h3>
              <div className="space-y-3">
                {[
                  { name: "Google", logo: "G", opportunities: 5 },
                  { name: "Meta", logo: "M", opportunities: 3 },
                  { name: "Microsoft", logo: "M", opportunities: 7 },
                ].map((org, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-primary to-gold rounded-lg flex items-center justify-center text-white font-bold">
                        {org.logo}
                      </div>
                      <div>
                        <p className="font-semibold text-purple-dark">{org.name}</p>
                        <p className="text-xs text-slate-600">
                          {org.opportunities} opportunities
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Review & Feedback Section */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-6 border-2 border-yellow-200">
              <h3 className="font-bold text-purple-dark text-lg mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Help Future Students
              </h3>
              <p className="text-slate-700 text-sm mb-4">
                Share your experience with programs you've completed!
              </p>
              <div className="bg-white p-4 rounded-lg mb-4">
                <p className="text-sm font-semibold text-purple-dark mb-1">
                  Digital Skills Workshop
                </p>
                <p className="text-xs text-slate-600 mb-3">Completed October 2024</p>
                <button className="w-full bg-gradient-to-r from-purple-primary to-gold text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                  <Star className="w-4 h-4" />
                  Leave Review
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;