import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export default function OrgNav() {
  const { logout, user } = useAuth0();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

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

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            to="/org/dashboard"
            className="text-purple-900 font-medium hover:text-yellow-500 transition-colors duration-300 relative group"
          >
            Dashboard
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300"></span>
          </Link>

          <Link
            to="/discover"
            className="text-purple-900 font-medium hover:text-yellow-500 transition-colors duration-300 relative group"
          >
            Discover
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300"></span>
          </Link>

          <div className="flex items-center space-x-3">
            <img
              src={user?.picture}
              alt="Organization avatar"
              className="w-10 h-10 rounded-full border-2 border-purple-600 hover:scale-110 transition-transform duration-300 cursor-pointer"
            />
            <button
              onClick={handleLogout}
              className="bg-purple-600 text-cream px-6 py-2.5 rounded-full font-semibold hover:shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Logout
            </button>
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
            className="block px-6 py-3 text-purple-900 hover:bg-purple-100 hover:text-yellow-500 transition-colors"
          >
            Dashboard
          </Link>

          <Link
            to="/discover"
            onClick={() => setMenuOpen(false)}
            className="block px-6 py-3 text-purple-900 hover:bg-purple-100 hover:text-yellow-500 transition-colors"
          >
            Discover
          </Link>

          <button
            onClick={() => {
              handleLogout();
              setMenuOpen(false);
            }}
            className="w-full text-left px-6 py-3 text-purple-900 hover:bg-purple-100 hover:text-yellow-500 transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}