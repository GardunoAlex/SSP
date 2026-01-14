import { useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";


export default function Signup() {
  const navigate = useNavigate();
  const { loginWithRedirect } = useAuth0();

  const loginAsStudent = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: "signup",
        role: "student"
      }
    })
  }

  const loginAsOrg = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: "signup",
        role: "org"
      }
    })
  }

  return (
    <section className="bg-cream">
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-conic-gradient(from 0deg at 50% 50%, #F5A623 0deg 90deg, transparent 90deg 180deg)",
          backgroundSize: "100px 100px",
        }}
      ></div>
      <div className="min-h-screen flex flex-col justify-center items-center px-6">
        <div className="max-w-md w-full text-center">
          <div
            className="flex items-center justify-center space-x-2 p-5 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-yellow-500 rounded-lg flex items-center justify-center transform rotate-12 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-110">
              <GraduationCap className="text-white text-xl transform -rotate-12 group-hover:rotate-0 transition-transform duration-300" />
            </div>
            <div className="text-3xl font-bold">
              <span className="text-purple-700">Student</span>
              <span className="text-yellow-500">Starter</span>
              <span className="text-purple-700 text-3xl">+</span>
            </div>
          </div>
          <p className="text-gray-600 mb-10">
            Empower your future — whether you’re a student discovering
            opportunities or an organization connecting with talent.
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            <button
              onClick={loginAsStudent}
              className="bg-purple-500 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-md transition-transform transform hover:scale-105"
            >
              I’m a Student
            </button>
            <button
              onClick={loginAsOrg}
              className="bg-yellow-500 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-md transition-transform transform hover:scale-105"
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
    </section>
  );
}
