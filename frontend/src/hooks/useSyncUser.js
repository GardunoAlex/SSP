import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function useSyncUser() {
  const { isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0();

  useEffect(() => {
    // ✅ Only run after Auth0 has finished loading
    if (isLoading || !isAuthenticated) return;

    const syncUser = async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch("http://localhost:3000/api/auth/sync", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText);
        }

        console.log("✅ User synced with backend");
      } catch (err) {
        console.error("❌ Failed to sync user", err);
      }
    };

    // slight delay to avoid calling too early
    const timeout = setTimeout(syncUser, 300);
    return () => clearTimeout(timeout);
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);
}
