import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && user) {
      const role = user["https://studentstarter.com/role"];
      
      console.log("Auth.jsx: Redirecting user with role:", role);
      
      // Redirect based on role
      if (role === "org") {
        navigate("/org/dashboard");
      } else if (role === "student") {
        navigate("/discover");
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } else if (!isAuthenticated && !isLoading) {
      // Not authenticated, go to home
      navigate("/");
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-purple-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-purple-dark text-lg">Signing you in...</p>
      </div>
    </div>
  );
};

export default Auth;