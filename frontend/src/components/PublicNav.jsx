import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";

const PublicNav = () => {
  const { loginWithRedirect } = useAuth0();
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToAbout = (e) => {
    e.preventDefault();
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      const headerOffset = 80;
      const elementPosition = aboutSection.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-cream/95 backdrop-blur-sm shadow-md" : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-8 py-5 flex items-center justify-between">
        <div
          className="flex items-center space-x-2 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-yellow-500 rounded-lg flex items-center justify-center transform rotate-12 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-110">
            <GraduationCap className="text-white text-xl transform -rotate-12 group-hover:rotate-0 transition-transform duration-300" />
          </div>
          <div className="text-2xl font-bold">
            <span className="text-purple-700">Student</span>
            <span className="text-yellow-500">Starter</span>
            <span className="text-purple-700 text-3xl">+</span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <Link
            to="/discover"
            className="text-purple-900 font-medium hover:text-yellow-500 transition-colors duration-300 relative group"
          >
            Discover
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <a 
            href="#about"
            onClick={scrollToAbout}
            className="text-purple-900 font-medium hover:text-yellow-500 transition-colors duration-300 relative group cursor-pointer"
          >
            About Us
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300"></span>
          </a>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => loginWithRedirect()}
              className="border-2 border-purple-600 text-purple-900 bg-transparent hover:bg-purple-600 hover:text-cream px-6 py-2.5 rounded-full font-semibold hover:shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Log In
            </button>
          </div>

          <Link 
          to="/signup"
          className="border-2 border-transparent bg-purple-600 text-cream px-6 py-2.5 rounded-full font-semibold hover:shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105">
            Sign Up
          </Link>

          <div>

          </div>
        </div>
      </nav>
    </header>
  );
};

export default PublicNav;