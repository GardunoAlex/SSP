import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const handleSignup = (role) => {
    // temporarily store selected role before redirecting
    localStorage.setItem("signupRole", role);
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-50 to-white px-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-extrabold text-indigo-600 mb-4">
          Join StudentStarter+
        </h1>
        <p className="text-gray-600 mb-10">
          Empower your future — whether you’re a student discovering
          opportunities or an organization connecting with talent.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          <button
            onClick={() => handleSignup("student")}
            className="bg-indigo-500 hover:bg-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-md transition-transform transform hover:scale-105"
          >
            🎓 I’m a Student
          </button>
          <button
            onClick={() => handleSignup("org")}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-4 px-6 rounded-xl font-semibold text-lg shadow-md transition-transform transform hover:scale-105"
          >
            🏢 I’m an Organization
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/auth")}
            className="text-indigo-600 hover:underline"
          >
            Log in here
          </button>
        </p>
      </div>
    </div>
  );
}
