import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect} from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import Modal from "./Modal";

export default function NewNav() {
  const { isAuthenticated, loginWithRedirect, logout, user, getAccessTokenSilently } = useAuth0();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [role, setRole] =useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  function userProfile(){
    console.log("I got clicked ma boi");
    setIsOpen(true);
  }

  useEffect(() => {
    const fetchUserStatus = async () => {
      if (!isAuthenticated) return;

      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/sync`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        const supaUser = data?.data?.[0];

        // ✅ Pull role from Auth0 claim OR Supabase
        const roleFromAuth0 = user?.["https://studentstarter.com/role"];
        const roleFromSupabase = supaUser?.role;
        setRole(roleFromAuth0 || roleFromSupabase);

        // ✅ Track verification status from Supabase
        setIsVerified(supaUser?.verified === true);
      } catch (err) {
        console.error("Error fetching user verification:", err);
      }
    };

    fetchUserStatus();
  }, [isAuthenticated, getAccessTokenSilently, user]);

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 z-50 border-b border-gray-200 ">
      <div className="max-w mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center cursor-pointer gap-1 transition-transform duration-200 hover:scale-105"
            onClick={() => navigate("/")}>
            <GraduationCap className="text-indigo-600 w-7 h-7" />
            <h1 className="text-2xl sm:text-2xl font-bold text-sky-400">
              Student<span className="text-yellow-400">Starter</span>
              <span className="text-indigo-600 text-2xl">+</span>
            </h1>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Dynamic role-based links */}
            {isAuthenticated && role === "student" && (
              <Link
                to="/saved"
                className="text-gray-700 hover:text-indigo-600 font-medium transition-transform duration-200 hover:scale-105"
              >
                Saved
              </Link>
            )}

            {isAuthenticated && role === "org" && isVerified &&(
              <Link
                to="/org/dashboard"
                className="text-gray-700 hover:text-indigo-600 font-medium transition-transform duration-200 hover:scale-105"
              >
                Dashboard
              </Link>
            )}

            {isAuthenticated && role === "admin" &&(
              <Link
                to="/admin/dashboard"
                className="text-gray-700 hover:text-indigo-600 font-medium transition-transform duration-200 hover:scale-105"
              >
                Dashboard
              </Link>
            )}

            <Link
              to="/discover"
              className="text-gray-700 hover:text-indigo-600 font-medium transition-transform duration-200 hover:scale-105"
            >
              Discover
            </Link>


            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <img
                  src={user?.picture}
                  alt="User avatar"
                  className="w-8 h-8 rounded-full border-4 border-indigo-700 hover:scale-125 transition-transform duration-200"
                  onClick={userProfile}
                />
                <button
                  onClick={handleLogout}
                  className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
              <button
                onClick={() => loginWithRedirect()}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition"
              >
                Login
              </button>

              <Link
                to="/signup"
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition font-medium"
              >
                Sign Up
              </Link>
              </>
            )}

            
          </div>

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

      {menuOpen && (
        <div className="md:hidden bg-white shadow-md border-t border-gray-200">
          {isAuthenticated && role === "student" && (
            <Link
              to="/saved"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Saved
            </Link>
          )}

          {isAuthenticated && role === "org" && (
            <Link
              to="/org/dashboard"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Dashboard
            </Link>
          )}

          <Link
            to="/discover"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Discover
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

      <Modal isOpen={isOpen} setIsOpen={setIsOpen} />
    </nav>
  );
}
