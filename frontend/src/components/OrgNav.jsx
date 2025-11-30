import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export default function OrgNav() {
  const { logout, user } = useAuth0();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer gap-1 transition-transform duration-200 hover:scale-105"
            onClick={() => navigate("/")}
          >
            <GraduationCap className="text-indigo-600 w-7 h-7" />
            <h1 className="text-2xl font-bold text-sky-400">
              Student<span className="text-yellow-400">Starter</span>
              <span className="text-indigo-600 text-2xl">+</span>
            </h1>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/org/dashboard"
              className="text-gray-700 hover:text-indigo-600 font-medium transition-transform duration-200 hover:scale-105"
            >
              Dashboard
            </Link>

            <Link
              to="/discover"
              className="text-gray-700 hover:text-indigo-600 font-medium transition-transform duration-200 hover:scale-105"
            >
              Discover
            </Link>

            <div className="flex items-center space-x-3">
              <img
                src={user?.picture}
                alt="Organization avatar"
                className="w-8 h-8 rounded-full border-4 border-indigo-700 hover:scale-125 transition-transform duration-200 cursor-pointer"
              />
              <button
                onClick={handleLogout}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-700 hover:text-indigo-600 focus:outline-none"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md border-t border-gray-200">
          <Link
            to="/org/dashboard"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Dashboard
          </Link>

          <Link
            to="/discover"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Discover
          </Link>

          <button
            onClick={() => {
              handleLogout();
              setMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}