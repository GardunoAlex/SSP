import { GraduationCap, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-purple-dark text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-primary to-gold rounded-lg flex items-center justify-center transform rotate-12">
                <GraduationCap className="w-5 h-5 text-white transform -rotate-12" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-white">Student</span>
                <span className="text-gold">Starter</span>
                <span className="text-white">+</span>
              </span>
            </div>
            <p className="text-slate-300 text-sm text-center md:text-left">
              Connecting students to career opportunities
            </p>
          </div>

          <div className="flex items-center gap-8 text-sm">
            <Link to="/about" className="text-slate-300 hover:text-gold transition-colors">
              About
            </Link>
            <Link to="/opportunities" className="text-slate-300 hover:text-gold transition-colors">
              Opportunities
            </Link>
            <a href="mailto:hello@studentstarter.com" className="text-slate-300 hover:text-gold transition-colors flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Contact
            </a>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-700 text-center text-slate-400 text-sm">
          <p>© 2024 StudentStarter+. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;