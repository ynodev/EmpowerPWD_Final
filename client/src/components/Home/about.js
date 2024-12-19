import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import { 
  Target, Globe, Zap, 
  Award, CheckCircle, Users, 
  BookOpen, TrendingUp, Shield,
  Code, Heart, Lightbulb, Rocket,
  Brain, Sparkles, Workflow
} from 'lucide-react';
import logo from "../../assets/img/logo.svg";
import logoVar1 from "../../assets/img/logoVar1.png";
import google from "../../assets/img/google.png";
import mcdonalds from "../../assets/img/mcdonalds.png";
import samsung from "../../assets/img/samsung.png";
import cocacola from "../../assets/img/cocacola.png";
import roberto from "../../assets/img/roberto.png";
import mhark from "../../assets/img/mhark.png";
import adrian from "../../assets/img/adrian.png";
import christine from "../../assets/img/christine.png";
import SharedNav from '../ui/SharedNav';

const AboutPage = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const teamMembers = [
    {
      name: "Christine Mendoza",
      role: "Founder of EmpowerPWD | Front End Developer",
      bio:  "The visionary behind EmpowerPWD, blending expertise in modern web technologies with a commitment to fostering inclusive innovation and accessibility.",
      expertise: ["HTML", "Tailwind", "JavaScript", "React", "Inclusive Design"],
      photo: christine, 
      icon: <Lightbulb className="w-6 h-6 text-blue-500" />
    },,
    {
      name: "Adrian Perce",
      role: "Full Stack Developer, CuteTech",
      bio: "Experienced Full Stack Developer with a focus on building inclusive, accessible, and user-centric web applications using the latest technologies.",
      expertise: ["Node.js", "Express", "MongoDB", "JavaScript", "React", "UX Research"],
      photo: adrian,  // Assuming 'adrian' is an imported image or URL
      icon: <Heart className="w-6 h-6 text-blue-500" />
    },
    {
      name: "Mhark Pentinio",
      role: "Lead Developer, CuteTech",
      bio: "Skilled Full Stack Developer with a passion for building scalable, user-centric solutions, and a strong commitment to inclusive technology, with expertise in UX/UI design.",
      expertise: [
        "React",
        "Backend",
        "API",
        "UX/UI",
        "Database",
        "Scalability",
      ],
      photo: mhark,  // Assuming 'mhark' is an imported image or URL
      icon: <Code className="w-6 h-6 text-blue-500" />
    },
    {
      name: "Roberto Velasco",
      role: "Software Developer, CuteTech",
      bio: "Dedicated Software Developer with a passion for creating user-friendly, accessible, and inclusive digital experiences that meet diverse needs.",
      expertise: [
        "JavaScript",
        "React",
        "UI/UX",
        "Accessibility",
        "Web Design",
        "Frontend"
      ],
      photo: roberto,  // Assuming 'roberto' is an imported image or URL
      icon: <Brain className="w-6 h-6 text-blue-500" />
    }
  ];

  const features = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Inclusive Design",
      description: "Creating accessible solutions for everyone"
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Innovation",
      description: "Pushing boundaries in accessibility tech"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Expertise",
      description: "Deep knowledge in inclusive employment"
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Growth",
      description: "Continuous improvement and scaling"
    }
  ];

  return (
    <div className="min-h-screen bg-white font-poppins">
      <SharedNav />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl -z-10"></div>
          <div className="absolute top-1/4 left-20 w-[300px] h-[300px] bg-blue-100/30 rounded-full blur-2xl -z-10"></div>
          
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-col items-center text-center mb-16">
              <div className="inline-block px-4 py-2 bg-blue-100 rounded-full mb-8">
                <span className="text-blue-600 font-medium">About EmpowerPWD</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight max-w-4xl">
                Transforming Lives Through
                <span className="bg-gradient-to-r from-[#97BEFE] via-[#4285F4] to-[#00215F] text-transparent bg-clip-text block mt-2">
                  Inclusive Employment
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl">
                Building bridges between exceptional talent and inclusive employers, creating a future where every ability shines and thrives.
              </p>
              <div className="w-full max-w-3xl">
                <img
                  src="https://i.ibb.co/tzPBGs5/pexels-elevate-3009792.jpg"
                  alt="pexels-elevate-3009792"
                  className="rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-2">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#1A2755]">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission and Vision Section */}
        <section className="py-2">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              <div className="bg-white p-10 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <h2 className="text-3xl font-bold text-[#1A2755] mb-6">Our Mission</h2>
                <p className="text-gray-600 space-y-4 leading-relaxed">
                  To create a comprehensive ecosystem that empowers Persons with Disabilities by:
                  <ul className="list-disc pl-6 mt-4 space-y-2">
                    <li>Bridging the employment gap through innovative technological solutions</li>
                    <li>Connecting exceptional talent with progressive, inclusive employers</li>
                    <li>Providing comprehensive support throughout the employment journey</li>
                  </ul>
                </p>
              </div>
              <div className="bg-white p-10 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <h2 className="text-3xl font-bold text-[#1A2755] mb-6">Our Vision</h2>
                <p className="text-gray-600 space-y-4 leading-relaxed">
                  To become the global leader in creating a truly inclusive workforce where:
                  <ul className="list-disc pl-6 mt-4 space-y-2">
                    <li>Disability is recognized as a strength, not a limitation</li>
                    <li>Every individual has equal opportunities to thrive professionally</li>
                    <li>Technology serves as a powerful enabler of inclusive employment</li>
                  </ul>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <span className="text-blue-600 font-medium bg-blue-50 px-4 py-2 rounded-full">Our Team</span>
              <h2 className="text-4xl font-bold text-[#1A2755] mt-6 mb-4">Meet CuteTech</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                The innovative minds behind EmpowerPWD, dedicated to creating inclusive technological solutions
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative mb-6">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-52 object-cover rounded-xl"
                    />
                    <div className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                      {member.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-[#1A2755]">{member.name}</h3>
                  <p className="text-blue-600 mb-4 text-sm">{member.role}</p>
                  <p className="text-gray-600 mb-4 text-sm">{member.bio}</p>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {member.expertise.map((skill, skillIndex) => (
                        <span key={skillIndex} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Reused from HomePage */}
      <footer className="bg-[#021F56] text-white py-10">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8 px-6">
            <div className="max-w-xs lg:min-w-[240px]">
              <div className="flex items-center gap-3 mb-6">
                <img src={logoVar1} alt="logo" className="w-8 h-8 object-contain" />
                <span className="text-xl font-bold whitespace-nowrap">EmpowerPWD</span>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                Connecting talents with inclusive opportunities, building a future where every ability shines.
              </p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-blue-400 transition-colors">
                  <i className="fab fa-facebook text-xl"></i>
                </a>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  <i className="fab fa-twitter text-xl"></i>
                </a>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  <i className="fab fa-linkedin text-xl"></i>
                </a>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  <i className="fab fa-instagram text-xl"></i>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-16 flex-1">
              <div>
                <h3 className="text-lg font-semibold mb-4">Company</h3>
                <ul className="space-y-3">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">How it Works</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Resources</h3>
                <ul className="space-y-3">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Contact</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-gray-400">
                    <i className="fas fa-map-marker-alt mt-1"></i>
                    <span>1234 Kunwari St. Brgy. Marawoy, Lipa City, Batangas</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-400">
                    <i className="fas fa-phone"></i>
                    <span>09123456789</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-400">
                    <i className="fas fa-envelope"></i>
                    <span>empowerpwd@gmail.com</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-800 px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © 2024 EmpowerPWD. All rights reserved.
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;