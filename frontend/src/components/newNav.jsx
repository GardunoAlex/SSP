import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Menu, X } from "lucide-react";
import Modal from "./Modal";


export default function NewNav() {
  const { isAuthenticated, loginWithRedirect, logout, user, getAccessTokenSilently } = useAuth0();
  const [menuOpen, setMenuOpen] = useState(false);
  const {scrolled, setScrolled } = useState(false);
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isOpen, setIsOpen] = useState(false);


  function userProfile(){
    console.log("I got clicked ma boi");
    setIsOpen(true);
  }

  useEffect(() => {
    const handleScroll = () => {
        if (window.scrollY > 20) {
            setScrolled(true);
        } else {
            setScrolled(false);
        }   
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const fetchUserStatus = async () => {
            if(!isAuthenticated) return;
            try{
                const token = await getAccessTokenSilently();
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/sync`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });


                const data = await res.json();
                const supaUser = data?.data?.[0];

                const roleFromAuth0 = user?.["https://studentstarter.com/role"];
                const roleFromSupabase = supaUser?.role;
                setRole( roleFromAuth0 || roleFromSupabase );

                setIsVerified( supaUser?.verified === true );
            }catch (err) {
                console.error("Error fetching user verification:", err);
            }   
        };

        fetchUserStatus();
    }, [isAuthenticated, getAccessTokenSilently, user]);

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };



  return(
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b-2 ${
        scrolled
          ? "bg-cream/95 backdrop-blur-sm shadow-md border-sage"
          : "bg-cream/80 backdrop-blur-sm border-cream/50"
      }`}
      >
      <nav className="container mx-auto px-8 py-5 flex items-center justify-between">
        <div
          className="flex items-center space-x-2 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-yellow-500 rounded-lg flex items-center justify-center transform rotate-12 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-110">
            <GraduationCap className="text-white text-xl transform -rotate-12 group-hover:rotate-0 transition-transform duration-300" />
          </div>
          <div className="text-2xl font-bold">
            <span className="text-purple-700">Student</span>
            <span className="text-yellow-500">starter</span>
            <span className="text-purple-700 text-3xl">+</span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          {isAuthenticated && role === "student" && (
            <Link
              to="/saved"
              className="text-purple-900 font-medium hover:text-yellow-500 transition-colors duration-300 relative group"
            >
              Saved
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          )}

          {isAuthenticated && role === "org" && isVerified && (
            <Link
              to="/org/dashboard"
              className="text-purple-900 font-medium hover:text-yellow-500 transition-colors duration-300 relative group"
            >
              Dashboard
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          )}

          {isAuthenticated && role === "admin" && (
            <Link
              to="/admin/dashboard"
              className="text-purple-900 font-medium hover:text-yellow-500 transition-colors duration-300 relative group"
            >
              Dashboard
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          )}

          <Link
            to="/opportunities"
            className="text-purple-900 font-medium hover:text-yellow-500 transition-colors duration-300 relative group"
          >
            Opportunities
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300"></span>
          </Link>

          <Link
            to="/about"
            className="text-purple-900 font-medium hover:text-yellow-500 transition-colors duration-300 relative group"
          >
            About
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300"></span>
          </Link>

          {/* Auth Buttons */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <img
                src={user?.picture}
                alt="User avatar"
                className="w-9 h-9 rounded-full border-2 border-purple-600 hover:border-yellow-500 hover:scale-110 transition-all duration-300 cursor-pointer"
                onClick={userProfile}
              />
              <button
                onClick={handleLogout}
                className="bg-purple-600 text-cream px-6 py-2.5 rounded-full font-semibold hover:shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => loginWithRedirect()}
                className="bg-purple-600 text-cream px-6 py-2.5 rounded-full font-semibold hover:shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-purple-900 hover:text-yellow-500 focus:outline-none transition-colors duration-300"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="md:hidden bg-cream/95 backdrop-blur-sm shadow-lg border-t border-purple-200">
          {isAuthenticated && role === "student" && (
            <Link
              to="/saved"
              onClick={() => setMenuOpen(false)}
              className="block px-6 py-3 text-purple-900 hover:bg-purple-100 hover:text-yellow-500 transition-colors duration-200 font-medium"
            >
              Saved
            </Link>
          )}

          {isAuthenticated && role === "org" && isVerified && (
            <Link
              to="/org/dashboard"
              onClick={() => setMenuOpen(false)}
              className="block px-6 py-3 text-purple-900 hover:bg-purple-100 hover:text-yellow-500 transition-colors duration-200 font-medium"
            >
              Dashboard
            </Link>
          )}

          {isAuthenticated && role === "admin" && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMenuOpen(false)}
              className="block px-6 py-3 text-purple-900 hover:bg-purple-100 hover:text-yellow-500 transition-colors duration-200 font-medium"
            >
              Dashboard
            </Link>
          )}

          <Link
            to="/opportunities"
            onClick={() => setMenuOpen(false)}
            className="block px-6 py-3 text-purple-900 hover:bg-purple-100 hover:text-yellow-500 transition-colors duration-200 font-medium"
          >
            Opportunities
          </Link>

          <Link
            to="/about"
            onClick={() => setMenuOpen(false)}
            className="block px-6 py-3 text-purple-900 hover:bg-purple-100 hover:text-yellow-500 transition-colors duration-200 font-medium"
          >
            About
          </Link>

          {isAuthenticated ? (
            <div className="px-6 py-3 space-y-2">
              <button
                onClick={userProfile}
                className="w-full text-left px-4 py-2 text-purple-900 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors duration-200 font-medium"
              >
                Profile
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="w-full px-4 py-2 bg-purple-600 text-cream rounded-lg hover:bg-purple-700 transition-colors duration-200 font-semibold"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="px-6 py-3 space-y-2">
              <button
                onClick={() => {
                  loginWithRedirect();
                  setMenuOpen(false);
                }}
                className="w-full px-4 py-2 bg-purple-600 text-cream rounded-lg hover:bg-purple-700 transition-colors duration-200 font-semibold"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isOpen} setIsOpen={setIsOpen} />
    </header>
  );
    
}
