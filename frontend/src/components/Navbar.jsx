import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { GraduationCap } from "lucide-react";


const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 z-50 border-b border-gray-200">
      <div className=" max-w mx-auto px-4 sm:px-6 lg:px-8">
        <div className=" flex items-center justify-between h-20">
          {/* Left section: Logo */}
          <div
            className="flex items-center cursor-pointer gap-1 transition-transform duration-200 hover:scale-105"
            onClick={() => navigate("/")}
          >
            <GraduationCap className="text-indigo-600 w-7 h-7" />
            <span className="text-2xl font-bold text-indigo-600">Student</span>
            <span className="text-2xl font-bold text-yellow-400">Starter</span>
            <span className="text-2xl font-bold text-indigo-600">+</span>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => navigate("/saved")}
              className={({ isActive }) =>
                `text-gray-700 font-medium transition-transform duration-200 hover:scale-105 ${
                  isActive ? "text-indigo-600 border-b-2 border-indigo-600 pb-1" : ""
                }`
              }
            >
              Saved
            </button>
            <NavLink to="/" className={({ isActive }) =>
              `text-gray-700 font-medium transition-transform duration-200 hover:scale-105 ${
                isActive ? "text-indigo-600 border-b-2 border-indigo-600 pb-1" : ""
              }`
            }>
              Home
            </NavLink>
            <NavLink to="/opportunities" className={({ isActive }) =>
                `text-gray-700 font-medium transition-transform duration-200 hover:scale-105 ${
                  isActive ? "text-indigo-600 border-b-2 border-indigo-600 pb-1" : ""
                }`
              }>
              Opportunities
            </NavLink>
            <NavLink to="/about" className={({ isActive }) =>
                `text-gray-700 font-medium transition-transform duration-200 hover:scale-105 ${
                  isActive ? "text-indigo-600 border-b-2 border-indigo-600 pb-1" : ""
                }`
              }>
              About
            </NavLink>

            {/* Auth buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 ">
                <img
                  src={user?.picture}
                  alt="User avatar"
                  className="w-8 h-8 rounded-full border border-gray-300"
                />
                <button
                  onClick={handleLogout}
                  className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => loginWithRedirect()}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition"
              >
                Login
              </button>
            )}
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

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md border-t border-gray-200">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Home
          </Link>
          <Link
            to="/opportunities"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Opportunities
          </Link>
          <Link
            to="/about"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            About
          </Link>

          {isAuthenticated ? (
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => {
                loginWithRedirect();
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Login
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
