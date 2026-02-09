import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { GraduationCap, LogOut } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";

const AdminNav = () => {
  const { logout, user } = useAuth0();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-dropdown') && !e.target.closest('.profile-button')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-cream/95 backdrop-blur-sm shadow-md" : "bg-cream"
      }`}
    >
      <nav className="container mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center space-x-2 group cursor-pointer"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-yellow-500 rounded-lg flex items-center justify-center transform rotate-12 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-110">
              <GraduationCap className="w-6 h-6 text-white transform -rotate-12 group-hover:rotate-0 transition-transform duration-300" />
            </div>
            <div className="text-2xl font-bold flex items-baseline">
              <span className="text-purple-700">Student</span>
              <span className="text-yellow-500">Starter</span>
              <span className="text-purple-700 text-3xl leading-none">+</span>
            </div>
          </Link>

          <div className="flex items-center space-x-8">
            <Link
              to="/admin/dashboard"
              className={`hidden md:block font-semibold text-lg transition-colors duration-300 relative group ${
                isActive("/admin/dashboard")
                  ? "text-purple-primary"
                  : "text-purple-dark hover:text-yellow-500"
              }`}
            >
              Dashboard
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-yellow-500 transition-all duration-300 ${
                isActive("/admin/dashboard") ? "w-full" : "w-0 group-hover:w-full"
              }`}></span>
            </Link>

            <Link
              to="/discover"
              className={`hidden md:block font-semibold text-lg transition-colors duration-300 relative group ${
                isActive("/discover")
                  ? "text-purple-primary"
                  : "text-purple-dark hover:text-yellow-500"
              }`}
            >
              Discover
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-yellow-500 transition-all duration-300 ${
                isActive("/discover") ? "w-full" : "w-0 group-hover:w-full"
              }`}></span>
            </Link>

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
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
                    {user?.name?.charAt(0) || "A"}
                  </div>
                )}
                <span className="hidden lg:block text-purple-dark font-semibold">
                  {user?.email || "Admin"}
                </span>
              </button>

              {showProfileMenu && (
                <div className="profile-dropdown absolute right-0 left-auto mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-200">
                    <p className="font-bold text-purple-dark text-base">{user?.name || "Admin"}</p>
                    <p className="text-sm text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-medium text-red-500">Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default AdminNav;
