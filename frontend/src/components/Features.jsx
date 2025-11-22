import { Search, Shield, Bell, Users } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Search,
      title: "Smart Discovery",
      description: "Filter by GPA, location, major, and interests to find perfect-fit opportunities."
    },
    {
      icon: Shield,
      title: "Verified Programs",
      description: "All opportunities are vetted and verified by our team and partner universities."
    },
    {
      icon: Bell,
      title: "Deadline Alerts",
      description: "Never miss an opportunity with customizable reminders and notifications."
    },
    {
      icon: Users,
      title: "Peer Reviews",
      description: "Read real feedback from students who've participated in these programs."
    }
  ];

  return (
    <section className="py-20 px-8 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-purple-primary mb-4">
            Why Student Starter+?
          </h2>
          <p className="text-xl text-purple-dark max-w-2xl mx-auto">
            Everything you need to discover and secure your next opportunity
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl hover:bg-purple-50 transition-colors duration-300"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-primary to-gold rounded-full flex items-center justify-center">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-purple-dark mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;