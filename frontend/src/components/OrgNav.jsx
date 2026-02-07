import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Telescope, User, CirclePlus, LogOut} from "lucide-react";
import { getSupabaseUser } from "../lib/apiHelpers";

export default function OrgNav() {
  const { logout, user, getAccessTokenSilently } = useAuth0();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [error, setError] = useState(null);
  const [organization, setOrganization] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

    useEffect(() => {
      if (user) {
        fetchOrgData();
      }
    }, [user]);
  
    const fetchOrgData = async () => {
      setError(null);
      try {
        const supaUser = await getSupabaseUser(getAccessTokenSilently);
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
        } else {
          throw new Error("No organization data returned");
        }
  
      } catch (error) {
        console.error("Error fetching org data:", error);
        setError(error.message);
      }
    };
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-cream/95 backdrop-blur-sm shadow-md" : "bg-cream"
      }`}
    >
      <nav className="container mx-auto px-8 py-5 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center space-x-2 cursor-pointer group"
          onClick={() => navigate("/discover")}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-yellow-500 rounded-lg flex items-center justify-center transform rotate-12 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-110">
            <GraduationCap className="text-white text-xl transform -rotate-12 group-hover:rotate-0 transition-transform duration-300" />
          </div>
          <div className="text-2xl font-bold">
            <span className="text-purple-700">Student</span>
            <span className="text-yellow-500">Starter</span>
            <span className="text-purple-700 text-3xl">+</span>
          </div>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-8">

          <Link
            to="/discover"
            className="text-purple-900 font-medium hover:text-yellow-500 transition-colors duration-300 relative group"
          >
            Discover
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300"></span>
          </Link>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu((prev) => !prev)}
                className="profile-button flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-purple-primary"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-primary to-gold flex items-center justify-center text-white font-bold text-lg">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                )}
              </button>

              {showProfileMenu && (
                <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-200">
                    <p className="font-bold text-purple-dark text-base break-words whitespace-normal">{organization?.name || error}</p>
                    <p className="text-purple-dark text-base break-words whitespace-normal">{organization?.email}</p>
                  </div>

                  <Link
                    to="/org/dashboard"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors"
                  >
                    <User className="w-5 h-5 text-purple-primary" />
                    <span className="text-sm font-medium text-purple-dark">
                      Dashboard
                    </span>
                  </Link>

                  <Link
                    to="/org/create-opportunity"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors"
                  >
                    <CirclePlus className="w-5 h-5 text-purple-primary" />
                    <span className="text-sm font-medium text-purple-dark">
                      Create Opportunity
                    </span>
                  </Link>

                  <div className="border-t border-slate-200 my-2" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-medium text-red-500">
                      Log Out
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-purple-900 hover:text-yellow-500 focus:outline-none text-2xl"
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-cream/95 backdrop-blur-sm border-t border-purple-200">
          <Link
            to="/org/dashboard"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-6 py-3 text-purple-900 hover:bg-purple-100 hover:text-yellow-500 transition-colors"
          >
            <User className="w-5 h-5 text-purple-primary" />
            Dashboard
          </Link>

          <Link
            to="/org/create-opportunity"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-6 py-3 text-purple-900 hover:bg-purple-100 hover:text-yellow-500 transition-colors"
          >
            <CirclePlus className="w-5 h-5 text-purple-primary" />
            Create Opportunity
          </Link>

          <Link
            to="/discover"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-6 py-3 text-purple-900 hover:bg-purple-100 hover:text-yellow-500 transition-colors"
          >
            <Telescope className="w-5 h-5 text-purple-primary" />
            Discover
          </Link>

          <button
            onClick={() => {
              handleLogout();
              setMenuOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-3 text-purple-900 hover:bg-purple-100 hover:text-yellow-500 transition-colors"
          >
            <LogOut className="w-5 h-5 text-red-500" />
            Logout
          </button>
        </div>
      )}
    </header>
  );
}