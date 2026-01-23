import studentsImage from '../assets/students.png';

const Hero = () => {
  return (
    <section className="relative min-h-[95vh] pt-32 pb-20 px-8 overflow-hidden bg-gradient-to-br from-[#FBF7F0] via-[#FBF7F0] to-purple-100/30">
      <div className="absolute inset-0 opacity-[0.08]">
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, #E5DFF7 0px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #E5DFF7 0px, transparent 1px, transparent 60px)",
          }}
        ></div>
      </div>

      {/* Floating Decorative Blobs*/}
      <div className="absolute top-20 right-20 w-32 h-32 bg-purple-200/20 rounded-full blur-3xl animate-float-right"></div>
      <div className="absolute top-40 right-32 w-48 h-48 bg-yellow-400/10 rounded-full blur-3xl animate-float-delayed-right"></div>
      <div className="absolute bottom-32 right-40 w-40 h-40 bg-orange-300/15 rounded-full blur-3xl animate-float-right"></div>
      <div className="absolute top-1/2 right-24 w-36 h-36 bg-purple-300/15 rounded-full blur-3xl animate-float-slow-right"></div>

      {/* Floating Dots*/}
      <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-purple-600 rounded-full animate-pulse"></div>
      <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-2.5 h-2.5 bg-orange-400 rounded-full animate-pulse"></div>

      <div className="container mx-auto relative z-10">
        <div className="flex items-center justify-between gap-12 flex-col lg:flex-row">
          {/* Left Content */}
          <div className="flex-1 max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                Discover
              </span>
              <span className="block mt-2 bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent">
                Career-Building Programs
              </span>
              <span className="block mt-2 text-blue-500">Tailored for You</span>
            </h1>

            <p className="text-xl text-purple-900 mb-10 font-medium">
              Your Jumpstart to Real-World Experience
            </p>

            {/* Stats Badges */}
            <div className="flex items-center space-x-4 flex-wrap gap-2">
              <div className="bg-white px-6 py-3 rounded-full shadow-md flex items-center space-x-3 hover:shadow-lg transition-shadow duration-300">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-400 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                </div>
                <span className="font-semibold text-purple-900">
                  Students <span className="text-yellow-500">1k</span>
                </span>
              </div>

              <div className="bg-white px-6 py-3 rounded-full shadow-md flex items-center space-x-3 hover:shadow-lg transition-shadow duration-300">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-300 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-purple-900">
                  Organizations <span className="text-yellow-500">200</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 relative hidden lg:block">
            <div className="relative w-full h-[500px] flex items-center justify-center">
              <div className="relative z-0">
                <img
                  src={studentsImage}
                  alt="Students connecting"
                  className="w-full h-auto max-w-lg drop-shadow-2xl"
                  style={{ filter: 'drop-shadow(0 20px 40px rgba(107, 95, 237, 0.2))' }}
                />
              </div>

              {/* Floating Icons*/}
              <div className="absolute top-10 right-10 bg-white p-3 rounded-lg shadow-lg animate-float z-10">
                <svg
                  className="w-6 h-6 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                  <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                </svg>
              </div>

              <div className="absolute top-32 right-40 bg-white p-3 rounded-lg shadow-lg animate-float-delayed z-10">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <div className="absolute bottom-32 right-16 bg-white p-3 rounded-lg shadow-lg animate-float z-10">
                <svg
                  className="w-6 h-6 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>

              <div className="absolute bottom-48 left-10 bg-white p-3 rounded-lg shadow-lg animate-float-delayed z-10">
                <svg
                  className="w-6 h-6 text-orange-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                </svg>
              </div>
              <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-purple-300 via-yellow-300 to-purple-300 opacity-30 z-0"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;