import { useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();

  const handleSignup = (role) => {
    // temporarily store selected role before redirecting
    localStorage.setItem("signupRole", role);
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-t from-indigo-100 to-white px-6">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center items-center mb-4 gap-2">
          <GraduationCap className="text-indigo-600 w-10 h-10" />
          <h1 className="text-4xl sm:text-5xl font-bold text-sky-400">
            Student<span className="text-yellow-400">Starter</span>
            <span className="text-indigo-600">+</span>
          </h1>
        </div>
        <p className="text-gray-600 mb-10">
          Empower your future — whether you’re a student discovering
          opportunities or an organization connecting with talent.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          <button
            onClick={() => handleSignup("student")}
            className="bg-indigo-500 hover:bg-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-md transition-transform transform hover:scale-105"
          >
            I’m a Student
          </button>
          <button
            onClick={() => handleSignup("org")}
            className="bg-yellow-400 hover:bg-yellow-600 text-gray-900 py-4 px-6 rounded-xl font-semibold text-lg shadow-md transition-transform transform hover:scale-105"
          >
            I’m an Organization
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
