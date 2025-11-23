// components/StudentNav.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GraduationCap, Bell, Bookmark, User, LogOut, Settings, FileText } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";

const StudentNav = () => {
  const { logout, user } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Placeholder data - API CALL: Fetch real notification and saved counts
  const [notificationCount, setNotificationCount] = useState(3);
  const [savedCount, setSavedCount] = useState(7);
  const [notifications, setNotifications] = useState([
    { id: 1, type: "deadline", text: "Google STEP Internship deadline in 3 days", time: "2h ago" },
    { id: 2, type: "match", text: "New opportunity matches your profile", time: "1d ago" },
    { id: 3, type: "update", text: "McKinsey Fellowship application opened", time: "2d ago" },
  ]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.notification-dropdown') && !e.target.closest('.notification-button')) {
        setShowNotifications(false);
      }
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
      <nav className="container mx-auto px-8 py-4 flex items-center justify-between">
        {/* Left: Logo */}
        <Link
          to="/dashboard"
          className="flex items-center space-x-2 group cursor-pointer"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-yellow-500 rounded-lg flex items-center justify-center transform rotate-12 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-110">
            <GraduationCap className="w-6 h-6 text-white transform -rotate-12 group-hover:rotate-0 transition-transform duration-300" />
          </div>
          <div className="text-2xl font-bold">
            <span className="text-purple-700">Student</span>
            <span className="text-yellow-500">starter</span>
            <span className="text-purple-700 text-3xl">+</span>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/dashboard"
            className={`font-medium transition-colors duration-300 relative group ${
              isActive("/dashboard")
                ? "text-purple-primary"
                : "text-purple-dark hover:text-yellow-500"
            }`}
          >
            Dashboard
            <span className={`absolute bottom-0 left-0 h-0.5 bg-yellow-500 transition-all duration-300 ${
              isActive("/dashboard") ? "w-full" : "w-0 group-hover:w-full"
            }`}></span>
          </Link>

          <Link
            to="/opportunities"
            className={`font-medium transition-colors duration-300 relative group ${
              isActive("/opportunities")
                ? "text-purple-primary"
                : "text-purple-dark hover:text-yellow-500"
            }`}
          >
            Discover
            <span className={`absolute bottom-0 left-0 h-0.5 bg-yellow-500 transition-all duration-300 ${
              isActive("/opportunities") ? "w-full" : "w-0 group-hover:w-full"
            }`}></span>
          </Link>

          <Link
            to="/stories"
            className={`font-medium transition-colors duration-300 relative group ${
              isActive("/stories")
                ? "text-purple-primary"
                : "text-purple-dark hover:text-yellow-500"
            }`}
          >
            Stories
            <span className={`absolute bottom-0 left-0 h-0.5 bg-yellow-500 transition-all duration-300 ${
              isActive("/stories") ? "w-full" : "w-0 group-hover:w-full"
            }`}></span>
          </Link>

          <Link
            to="/organizations"
            className={`font-medium transition-colors duration-300 relative group ${
              isActive("/organizations")
                ? "text-purple-primary"
                : "text-purple-dark hover:text-yellow-500"
            }`}
          >
            Organizations
            <span className={`absolute bottom-0 left-0 h-0.5 bg-yellow-500 transition-all duration-300 ${
              isActive("/organizations") ? "w-full" : "w-0 group-hover:w-full"
            }`}></span>
          </Link>
        </div>

        {/* Right: Utility Icons */}
        <div className="flex items-center space-x-4">
          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="notification-button relative p-2 text-purple-dark hover:text-purple-primary transition-colors"
            >
              <Bell className="w-6 h-6" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="notification-dropdown absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-200">
                  <h3 className="font-bold text-purple-dark">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors"
                    >
                      <p className="text-sm text-purple-dark font-medium">{notif.text}</p>
                      <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-slate-200">
                  <Link
                    to="/notifications"
                    className="text-sm text-purple-primary hover:text-gold font-semibold"
                  >
                    View All Notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Saved Items */}
          <Link
            to="/saved"
            className="relative p-2 text-purple-dark hover:text-purple-primary transition-colors"
          >
            <Bookmark className="w-6 h-6" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </Link>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="profile-button flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt="Profile"
                  className="w-9 h-9 rounded-full border-2 border-purple-primary"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-primary to-gold flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0) || "U"}
                </div>
              )}
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="profile-dropdown absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-200">
                  <p className="font-semibold text-purple-dark">{user?.name}</p>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                </div>
                
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-purple-50 transition-colors"
                >
                  <User className="w-4 h-4 text-purple-primary" />
                  <span className="text-sm text-purple-dark">Edit Profile</span>
                </Link>

                <Link
                  to="/resume"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-purple-50 transition-colors"
                >
                  <FileText className="w-4 h-4 text-purple-primary" />
                  <span className="text-sm text-purple-dark">My Resume</span>
                </Link>

                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-purple-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-purple-primary" />
                  <span className="text-sm text-purple-dark">Settings</span>
                </Link>

                <div className="border-t border-slate-200 my-2"></div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition-colors w-full text-left"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-500">Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default StudentNav;