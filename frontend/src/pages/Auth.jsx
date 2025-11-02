import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function Auth() {
  const { loginWithRedirect } = useAuth0();

  useEffect(() => {
    const role = localStorage.getItem("signupRole") || "student";

    loginWithRedirect({
      screen_hint: "signup",
      authorizationParams: {
        // 👇 Send it as a query param Auth0 Actions can read easily
        role,
      },
      appState: { role },
    });
  }, [loginWithRedirect]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-gray-600">
      <p className="text-lg">Redirecting you to sign up...</p>
      <div className="mt-4 animate-spin rounded-full h-10 w-10 border-t-4 border-indigo-500 border-solid"></div>
    </div>
  );
}