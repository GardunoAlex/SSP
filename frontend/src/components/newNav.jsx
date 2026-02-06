import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";
import StudentNav from "./StudentNav";
import PublicNav from "./PublicNav";
import { NavSkeleton } from "./Skeletons";
import OrgNav from "./OrgNav";

const NewNav = () => {
  const { isAuthenticated, isLoading: authLoading, user, getAccessTokenSilently } = useAuth0();
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (authLoading) return;
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
  }, [isAuthenticated, authLoading, user, getAccessTokenSilently]);

  if (authLoading || (loading && isAuthenticated)) {
    return <NavSkeleton />;
  }

  // Render appropriate nav based on role
  if (isAuthenticated && role === "student") {
    return <StudentNav />;
  } else if (isAuthenticated && role == "org") {
    return <OrgNav />;
  } else if (isAuthenticated && role == "admin"){
    return <StudentNav />;  // TODO: Add the nav for admin. 
  }{
    <StudentNav />;
  }

  // Default is public nav
  return <PublicNav />;
};

export default NewNav;