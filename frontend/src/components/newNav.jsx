import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";
import StudentNav from "./StudentNav";
import PublicNav from "./PublicNav";

const NewNav = () => {
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/sync`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const supaUser = data?.data?.[0];

        const roleFromAuth0 = user?.["https://studentstarter.com/role"];
        const roleFromSupabase = supaUser?.role;
        setRole(roleFromAuth0 || roleFromSupabase);
      } catch (err) {
        console.error("Error fetching user role:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  // Show loading state
  if (loading && isAuthenticated) {
    return (
      <nav className="bg-cream shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-5 flex justify-center">
          <div className="w-8 h-8 border-4 border-purple-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </nav>
    );
  }

  // Render appropriate nav based on role
  if (isAuthenticated && role === "student") {
    return <StudentNav />;
  } else if (isAuthenticated && role == "org") {
    return <StudentNav />;
  } else if (isAuthenticated && role == "admin"){
    return <StudentNav />
  }

  // TODO: Add OrgNav for organizations
  // if (isAuthenticated && role === "org") {
  //   return <OrgNav />;
  // }

  // Default is public nav
  return <PublicNav />;
};

export default NewNav;