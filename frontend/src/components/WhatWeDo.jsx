import { Handshake, GraduationCap, Building2 } from "lucide-react";

const WhatWeDo = () => {
  return (
    <section className="relative py-20 px-8 bg-gradient-to-br from-purple-50 to-cream">
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-purple-primary mb-4 inline-block relative">
            What We Do
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-purple-primary to-gold rounded-full"></div>
          </h2>
          <p className="text-xl text-purple-dark mt-8 max-w-3xl mx-auto">
            StudentStarter+ bridges the gap between students and opportunities, creating connections that matter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="relative group">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-primary to-gold rounded-t-2xl"></div>
            <div className="bg-white rounded-2xl p-8 shadow-lg shadow-purple-primary/10 hover:shadow-2xl hover:shadow-purple-primary/20 hover:-translate-y-2 transition-all duration-300 h-full relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: "radial-gradient(circle, #E5DFF7 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              ></div>

              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-primary to-gold rounded-full flex items-center justify-center shadow-lg relative">
                  <Handshake className="w-10 h-10 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-primary to-gold rounded-full blur-xl opacity-30 animate-pulse"></div>
                </div>

                <h3 className="text-2xl font-bold text-purple-primary mb-4 text-center">
                  Connecting the Dots
                </h3>

                <p className="text-purple-dark leading-relaxed text-center">
                  We bring students and organizations together on one platform—making it simple to discover, share, and engage with verified opportunities that accelerate career growth and real-world experience.
                </p>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-purple-primary rounded-t-2xl"></div>
            <div className="bg-white rounded-2xl p-8 shadow-lg shadow-purple-primary/10 hover:shadow-2xl hover:shadow-purple-primary/20 hover:-translate-y-2 transition-all duration-300 h-full relative">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-primary to-purple-light rounded-full flex items-center justify-center shadow-lg">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-purple-primary mb-4 text-center">
                Discover & Grow
              </h3>

              <p className="text-purple-dark leading-relaxed text-center">
                Access curated opportunities from internships to workshops and mentorship programs. Save your favorites, track applications, and build a portfolio of experiences that set you apart.
              </p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gold rounded-t-2xl"></div>
            <div className="bg-white rounded-2xl p-8 shadow-lg shadow-gold/10 hover:shadow-2xl hover:shadow-gold/20 hover:-translate-y-2 transition-all duration-300 h-full relative">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gold to-accent-coral rounded-full flex items-center justify-center shadow-lg">
                <Building2 className="w-10 h-10 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-gold mb-4 text-center">
                Reach & Engage
              </h3>

              <p className="text-purple-dark leading-relaxed text-center">
                Connect with motivated students actively seeking growth opportunities. Post programs, manage applications, and build a pipeline of talented individuals ready to contribute and learn.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;