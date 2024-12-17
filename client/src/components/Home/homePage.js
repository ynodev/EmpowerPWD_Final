import React, { useState } from 'react';
import { Link } from "react-router-dom";
import logo from "../../assets/img/logo.svg";
import logoVar1 from "../../assets/img/logoVar1.png";
import apply from "../../assets/img/apply-icon.png";
import profile from "../../assets/img/profile.png";
import find from "../../assets/img/find.png";
import joinpic from "../../assets/img/joinpic.png";
import shakehands from "../../assets/img/shakehands.png";
import about from "../../assets/img/about.png";
import intro from "../../assets/img/intro.png";
import google from "../../assets/img/google.png";
import mcdonalds from "../../assets/img/mcdonalds.png";
import samsung from "../../assets/img/samsung.png";
import cocacola from "../../assets/img/cocacola.png";
import amazon from "../../assets/featured/FEATURED_JOBS/AMAZON_LOGO.png";
import aws from "../../assets/featured/FEATURED_JOBS/AWS.png";
import chem from "../../assets/featured/FEATURED_JOBS/CHEMICAL_SOLUTIONS.png";
import  hospital from "../../assets/featured/FEATURED_JOBS/CITY_HOSPITAL.png";
import ca from "../../assets/featured/FEATURED_JOBS/CREATIVE_AGENCY.png";
import df from "../../assets/featured/FEATURED_JOBS/DESIGN_FIRM.png";
import diagnostic from "../../assets/featured/FEATURED_JOBS/DIAGNOSTIC_LAB.png";
import ds from "../../assets/featured/FEATURED_JOBS/DSTUDIO.png";
import facebook from "../../assets/featured/FEATURED_JOBS/FACEBOOK.png";
import fh from "../../assets/featured/FEATURED_JOBS/FASHION_HOUSE.png"
import ibm from "../../assets/featured/FEATURED_JOBS/IBM.png";
import lp from "../../assets/featured/FEATURED_JOBS/LOCAL_PHARMACY.png";
import microsoft from "../../assets/featured/FEATURED_JOBS/MICROSOFT.png";
import mb from "../../assets/featured/FEATURED_JOBS/MUSIC_BAND.png";
import ps from "../../assets/featured/FEATURED_JOBS/PHOTO_STUDIO.png";
import power from "../../assets/featured/FEATURED_JOBS/POWER_SYSTEM.png";
import tc from "../../assets/featured/FEATURED_JOBS/TECH_CORP.png";
import ti from "../../assets/featured/FEATURED_JOBS/TECH_INNOVATIONS.png";
import wc from "../../assets/featured/FEATURED_JOBS/WELNESS_CENTER.png";
import music from "../../assets/featured/FEATURED_JOBS/MUSIC_BAND.png";
import { TermsContent } from "../Terms&Conditions/termsContent";
import { PrivacyContent } from "../Terms&Conditions/privacyContent";
import { Modal } from "../Terms&Conditions/Modal";


const FAQItem = ({ faq }) => {
   const [isOpen, setIsOpen] = useState(false);
 return (
     <div className="border border-gray-200 rounded-xl bg-white relative">
       <button
         className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
         onClick={() => setIsOpen(!isOpen)}
       >
         <span className="text-sm font-semibold">{faq.question}</span>
         <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}>
           <svg width="24" height="24" viewBox="0 0 24 24">
             <path
               fill="currentColor"
               d="M12 4a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H5a1 1 0 1 1 0-2h6V5a1 1 0 0 1 1-1z"
             />
           </svg>
         </span>
       </button>
       {isOpen && (
         <div className="absolute top-full left-0 right-0 z-10 px-6 py-4 border-t bg-white shadow-lg rounded-b-lg">
           <p className="text-gray-600">{faq.answer}</p>
         </div>
       )}
     </div>
   );
 };
 
const HomePageComponent = () => {
   const [isOpen, setIsOpen] = React.useState(false);
   const [showContactModal, setShowContactModal] = React.useState(false);
   const [currentIndex, setCurrentIndex] = useState(0);
   const [selectedCategory, setSelectedCategory] = useState('Technology');
   const [selectedFaq, setSelectedFaq] = useState(null);
   const [activeForm, setActiveForm] = useState(null);
   const [isTermsOpen, setIsTermsOpen] = useState(false);
   const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

   const jobs = [
      // Technology
      {
        title: 'Data Scientist',
        company: 'Microsoft',
        logo: microsoft,
        description: 'A Data Scientist analyzes and interprets complex data sets, develops predictive models, and provides insights to drive business decisions.',
        category: 'Technology'
      },
      {
        title: 'DevOps Engineer',
        company: 'IBM',
        logo: ibm,
        description: 'A DevOps Engineer works to automate and streamline operations and processes, ensuring efficient software development and deployment.',
        category: 'Technology'
      },
      {
        title: 'Cloud Architect',
        company: 'Amazon Web Services',
        logo: aws,
        description: 'A Cloud Solutions Architect designs and manages cloud computing strategies and solutions for organizations.',
        category: 'Technology'
      },
      {
      title: 'AI Research Scientist',
      company: 'IBM',
      logo: ibm,
      description: 'An AI Research Scientist at IBM works on cutting-edge machine learning algorithms, developing innovative solutions for real-world problems in industries like healthcare, finance, and more.',
      category: 'Technology'
      },
      {
      title: 'Blockchain Developer',
      company: 'IBM',
      logo: ibm,
      description: 'A Blockchain Developer designs and implements decentralized applications and blockchain systems to ensure transparency and security in digital transactions.',
      category: 'Technology'
      },
         
      // Medical
      {
        title: 'Registered Nurse',
        company: 'HealthCare Inc.',
        logo: hospital,
        description: 'A Registered Nurse provides patient care, educates patients about health conditions, and offers advice and emotional support to patients and their families.',
        category: 'Medical'
      },
      {
        title: 'Medical Assistant',
        company: 'City Hospital',
        logo: hospital,
        description: 'A Medical Assistant performs administrative and clinical tasks to support healthcare professionals in a medical office or clinic.',
        category: 'Medical'
      },
      {
        title: 'Physical Therapist',
        company: 'Wellness Center',
        logo: wc,
        description: 'A Physical Therapist helps patients improve their movement and manage their pain through exercise and rehabilitation techniques.',
        category: 'Medical'
      },
      {
        title: 'Pharmacist',
        company: 'Local Pharmacy',
        logo: lp,
        description: 'A Pharmacist dispenses medications, provides information about drugs, and advises patients on their proper use.',
        category: 'Medical'
      },
      {
        title: 'MRI Technologist',
        company: 'Diagnostic Lab',
        logo: diagnostic,
        description: 'A Radiologic Technologist performs imaging examinations, such as X-rays, to help diagnose medical conditions.',
        category: 'Medical'
      },
      {
        title: 'Surgeon',
        company: 'City Hospital',
        logo: hospital,
        description: 'A Surgeon performs operations to treat injuries, diseases, and deformities, ensuring patient safety and recovery.',
        category: 'Medical'
      },
    
      // Arts
      {
        title: 'Graphic Designer',
        company: 'Creative Agency',
        logo: ca,
        description: 'A Graphic Designer creates visual concepts to communicate ideas that inspire, inform, or captivate consumers.',
        category: 'Arts'
      },
      {
        title: 'Art Director',
        company: 'Design Studio',
        logo: ds,
        description: 'An Art Director is responsible for the visual style and images in magazines, newspapers, product packaging, and movie and television productions.',
        category: 'Arts'
      },
      {
        title: 'Musician',
        company: 'Music Band',
        logo: mb,
        description: 'A Musician plays one or more instruments or sings, creating music for entertainment, artistic expression, or commercial purposes.',
        category: 'Arts'
      },
      {
        title: 'Photographer',
        company: 'Photo Studio',
        logo: power,
        description: 'A Photographer captures images that tell a story or convey a message, working in various settings such as studios, events, or nature.',
        category: 'Arts'
      },
      {
        title: 'Fashion Designer',
        company: 'Fashion House',
        logo: fh,
        description: 'A Fashion Designer creates clothing, accessories, and footwear, focusing on aesthetics, functionality, and market trends.',
        category: 'Arts'
      },
      {
        title: 'Interior Designer',
        company: 'Design Firm',
        logo: df,
        description: 'An Interior Designer plans and designs interior spaces, ensuring they are functional, safe, and aesthetically pleasing.',
        category: 'Arts'
      },
    
      // Engineering
      {
        title: 'Mechanical Engr.',
        company: 'Tech Innovations',
        logo: ti,
        description: 'A Mechanical Engineer develops and tests mechanical devices, including tools, engines, and machines.',
        category: 'Engineering'
      },
      {
        title: 'Electrical Engr.',
        company:'Power System',
        logo: power,
        description: 'An Electrical Engineer designs, develops, and tests electrical equipment and systems, including power generation equipment and communication systems.',
        category: 'Engineering'
      },
      {
        title: 'Software Engr.',
        company: 'Tech Corp',
        logo: tc,
        description: 'A Software Engineer develops software solutions, ensuring they meet user requirements and function effectively.',
        category: 'Engineering'
      },
      {
        title: 'Chemical Engr.',
        company: 'Chemical Solutions',
        logo: chem,
        description: 'A Chemical Engineer designs processes for large-scale chemical manufacturing, ensuring safety and efficiency.',
        category: 'Engineering'
      },
      {
        title: 'Computer Engr.',
        company: 'Tech Innovation',
        logo: ti,
        description: 'An Environmental Engineer develops solutions to environmental problems, focusing on sustainability and compliance with regulations.',
        category: 'Engineering'
      },
    ];

    const testimonials = [
     {
         text: "Fantastic work! Everything looks polished and runs smoothly. Keep it up!",
         name: "Roberto Velasco",
         title: "Macho Dancer",
         image: "https://placehold.co/40x40"
     },
     {
         text: "Fantastic work! Everything looks polished and runs smoothly. Keep it up!",
         name: "Roberto Velasco",
         title: "Macho Dancer",
         image: "https://placehold.co/40x40"
     },
     {
         text: "Fantastic work! Everything looks polished and runs smoothly. Keep it up!",
         name: "Roberto Velasco",
         title: "Macho Dancer",
         image: "https://placehold.co/40x40"
     },
     {
         text: "Fantastic work! Everything looks polished and runs smoothly. Keep it up!",
         name: "Roberto Velasco",
         title: "Macho Dancer",
         image: "https://placehold.co/40x40"
     },
     {
         text: "Fantastic work! Everything looks polished and runs smoothly. Keep it up!",
         name: "Roberto Velasco",
         title: "Macho Dancer",
         image: "https://placehold.co/40x40"
     },
     {
         text: "Fantastic work! Everything looks polished and runs smoothly. Keep it up!",
         name: "Roberto Velasco",
         title: "Macho Dancer",
         image: "https://placehold.co/40x40"
     }
  ];
// Function to filter jobs based on the selected category
const filteredJobs = jobs.filter(job => job.category === selectedCategory);

const handlePrevClick = () => {
  setCurrentIndex((currentIndex - 1 + filteredJobs.length) % filteredJobs.length);
};

const handleNextClick = () => {
  setCurrentIndex((currentIndex + 1) % filteredJobs.length);
};


   const JobCard = ({ title, company, rating, description, logoUrl }) => (
         <div className="border rounded-lg p-4 shadow-md">
            <div className="flex items-center mb-4">
               <img src={logoUrl} alt="Company logo" className="w-16 h-16 mr-4" style={{ borderRadius: '2px' }}/>
               <div>
                  <h2 className="text-xl font-semibold">{title}</h2>
                  <p className="text-gray-600">{company} {rating} Ratings</p>
               </div>
            </div>
            <p className="text-gray-700 text-sm">
               {description}
            </p>
         </div>
   );




   const [openIndex, setOpenIndex] = useState(null);

   const QuestionForm = () => (
     <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
       <div className="bg-white rounded-xl p-8 max-w-md w-full relative">
         <h3 className="font-semibold text-xl mb-6 text-[#4744F2]">Ask Your Question</h3>
         <form className="space-y-4">
           <div>
             <input
               type="text"
               placeholder="Your Name"
               className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4744F2]/50"
             />
           </div>
           <div>
             <input
               type="email"
               placeholder="Your Email"
               className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4744F2]/50"
             />
           </div>
           <div>
             <textarea
               placeholder="Your Question"
               rows="4"
               className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4744F2]/50"
             ></textarea>
           </div>
           <button className="w-full bg-[#4744F2] text-white py-2 rounded-lg hover:bg-[#3532D9] transition-colors">
             Submit Question
           </button>
         </form>
         <button 
           onClick={() => setActiveForm(null)}
           className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
         >
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
           </svg>
         </button>
       </div>
     </div>
   );

   const ChatForm = () => (
     <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
       <div className="bg-white rounded-xl p-8 max-w-md w-full relative">
         <h3 className="font-semibold text-xl mb-6 text-[#4744F2]">Start a Chat</h3>
         <form className="space-y-4">
           <div>
             <input
               type="text"
               placeholder="Your Name"
               className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4744F2]/50"
             />
           </div>
           <div>
             <input
               type="email"
               placeholder="Your Email"
               className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4744F2]/50"
             />
           </div>
           <div>
             <textarea
               placeholder="How can we help you?"
               rows="4"
               className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4744F2]/50"
             ></textarea>
           </div>
           <button className="w-full bg-[#4744F2] text-white py-2 rounded-lg hover:bg-[#3532D9] transition-colors">
             Start Chat
           </button>
         </form>
         <button 
           onClick={() => setActiveForm(null)}
           className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
         >
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
           </svg>
         </button>
       </div>
     </div>
   );

   return (
      <div className="min-h-screen bg-white font-poppins">
         <header className="fixed top-0 left-0 right-0 flex justify-between items-center px-8 py-4 bg-white z-50 shadow-md">
            <div className="flex items-center">
               <img src={logo} alt="logo" className="w-8 h-8" />
               <span className="ml-2 text-lg font-semibold">EmpowerPWD</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-8">
                  <a href="/" className="text-gray-600 hover:text-black font-medium">Home</a>
                  <a href="#about" className="text-gray-600 hover:text-black font-medium">About Us</a>
                  <a href="#featured-jobs" className="text-gray-600 hover:text-black font-medium">Featured Jobs</a>


                  <a href="/guest/blogs" className="text-gray-600 hover:text-black font-medium">Blogs</a>
               </nav>
               <Link 
                  to="/login" 
                  className="bg-[#1A2755] text-white px-6 py-2 rounded-xl hover:bg-[#3532D9] transition-colors font-medium"
               >
                  SIGN IN
               </Link>
            </div>
            <button 
               className="md:hidden"
               onClick={() => setIsOpen(!isOpen)}
            >
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
               </svg>
            </button>
         </header>
         {isOpen && (
            <div className="md:hidden bg-white border-t">
               <nav className="flex flex-col p-4">
                     <Link to="/" className="py-2 text-gray-600 hover:text-black">Home</Link>
                     <Link to="/about" className="py-2 text-gray-600 hover:text-black">About Us</Link>
                     <Link to="/jobs" className="py-2 text-gray-600 hover:text-black">Featured Jobs</Link>

               </nav>
            </div>
         )}
         <main className="pt-16 max-w-[1440px] mx-auto">
            <section className="relative py-8 lg:py-12 overflow-hidden">
               {/* Background decoration */}
               <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50/50 rounded-l-[100px] -z-10 hidden lg:block"></div>
               
               <div className="container mx-auto px-4 lg:px-6">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-0">
                     {/* Content Side */}
                     <div className="w-full lg:w-1/2 space-y-6 lg:pr-12 mt-4 lg:mt-0">
                        {/* Badge */}
                        <div className="inline-block px-4 py-2 bg-blue-50 rounded-full">
                           <span className="text-blue-600 font-medium text-sm">
                              #1 Job Platform for PWDs
                           </span>
                        </div>
                        
                        {/* Main Heading - Adjusted spacing */}
                        <div className="space-y-4">
                           <h1 className="text-3xl lg:text-6xl text-black font-extrabold leading-tight">
                              Find <span className="text-blue-600">Opportunities</span>
                              <br />
                              Where Abilities{" "}
                              <span className="bg-gradient-to-r from-[#97BEFE] via-[#4285F4] to-[#00215F] text-transparent bg-clip-text">
                                 Shine
                              </span>
                           </h1>
                           <p className="text-base lg:text-xl text-gray-600 max-w-xl">
                              A platform dedicated to inclusive opportunities for every ability. Join us in building careers where skills and potential shine.
                           </p>
                        </div>
                        
                        {/* Stats - Adjusted for mobile */}
                        <div className="flex flex-wrap gap-6 lg:gap-8 py-4 lg:py-6">
                           <div>
                              <h4 className="text-xl lg:text-3xl font-bold text-blue-600">20K+</h4>
                              <p className="text-sm lg:text-base text-gray-600">Active Jobs</p>
                           </div>
                           <div>
                              <h4 className="text-xl lg:text-3xl font-bold text-blue-600">50K+</h4>
                              <p className="text-sm lg:text-base text-gray-600">Job Seekers</p>
                           </div>
                           <div>
                              <h4 className="text-xl lg:text-3xl font-bold text-blue-600">10K+</h4>
                              <p className="text-sm lg:text-base text-gray-600">Companies</p>
                           </div>
                        </div>

                        {/* Search Box - Adjusted padding and spacing */}
                        <div className="bg-white p-4 lg:p-3 rounded-2xl shadow-lg max-w-2xl mt-6 lg:mt-0">
                           <div className="flex flex-col md:flex-row gap-4">
                              <div className="flex-1 relative">
                                 <div className="absolute left-4 top-3.5 text-gray-400">
                                    <i className="fas fa-search"></i>
                                 </div>
                                 <input
                                    type="text"
                                    placeholder="Job Title or Keyword"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                 />
                              </div>
                              <div className="flex-1 relative">
                                 <div className="absolute left-4 top-3.5 text-gray-400">
                                    <i className="fas fa-map-marker-alt"></i>
                                 </div>
                                 <input
                                    type="text"
                                    placeholder="Location"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                 />
                              </div>
                              <button className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap">
                                 Search Jobs
                              </button>
                           </div>
                        </div>

                        {/* Popular Searches - Added mobile spacing */}
                        <div className="pt-6 lg:pt-4">
                           <p className="text-gray-600 mb-3">Popular Searches:</p>
                           <div className="flex flex-wrap gap-2">
                              <span className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200 cursor-pointer">
                                 Remote Jobs
                              </span>
                              <span className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200 cursor-pointer">
                                 Tech Jobs
                              </span>
                              <span className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200 cursor-pointer">
                                 Healthcare
                              </span>
                              <span className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200 cursor-pointer">
                                 Customer Service
                              </span>
                           </div>
                        </div>
                     </div>

                     {/* Image Side - Adjusted for better mobile display */}
                     <div className="lg:w-1/2 relative pl-20 mt-8 lg:mt-0">
                        {/* Decorative elements */}
                        <div className="absolute -top-10 right-0 w-72 h-72 bg-blue-100/50 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-10 right-20 w-72 h-72 bg-blue-200/50 rounded-full blur-3xl"></div>
                        
                        {/* Main image */}
                        <div className="relative z-10">
                           <div className="flex justify-end mr-[-100px]">
                              <img 
                                 src={intro} 
                                 alt="Hero illustration" 
                                 className="w-[120%] h-auto object-contain animate-float"
                              />
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Trusted Companies - Adjusted spacing */}
                  <div className="mt-12 lg:mt-16 text-center px-4 lg:px-0">
                     <p className="text-gray-600 mb-6">Trusted by leading companies</p>
                     <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-8 opacity-75">
                        <img src={google} alt="Google logo" className="h-8 lg:h-10 grayscale hover:grayscale-0 transition-all"/>
                        <img src={cocacola} alt="Coca Cola logo" className="h-8 lg:h-10 grayscale hover:grayscale-0 transition-all"/>
                        <img src={mcdonalds} alt="McDonald's logo" className="h-8 lg:h-10 grayscale hover:grayscale-0 transition-all"/>
                        <img src={samsung} alt="Samsung logo" className="h-8 lg:h-10 grayscale hover:grayscale-0 transition-all"/>
                     </div>
                  </div>
               </div>
            </section>

            <section  id="about" className="py-20 lg:py-24 bg-white">
               <div className="container mx-auto px-4 lg:px-6">
                  <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                     {/* Content Side */}
                     <div className="lg:w-1/2 space-y-8 animate-slideInLeft"> {/* Added animation and increased space-y */}
                        <div className="inline-block animate-fadeIn">
                           <span className="bg-blue-50 text-blue-600 px-6 py-2 rounded-full text-sm font-semibold">
                              About Us
                           </span>
                        </div>
                        
                        <h2 className="text-4xl lg:text-5xl font-bold leading-tight bg-gradient-to-r from-[#1A2755] to-[#4285F4] bg-clip-text text-transparent">
                           Explore Opportunities,
                           <br />
                           Build Connections,
                           <br />
                           Transform Lives
                        </h2>
                        
                        <p className="text-gray-600 text-lg leading-relaxed">
                           EmpowerPWD bridges the gap between persons with disabilities and inclusive companies, 
                           connecting skilled job seekers with opportunities that celebrate their talents while 
                           fostering diverse workplaces.
                        </p>
                        
                        {/* Stats with animation */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-8 animate-fadeIn">
                           <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                              <h3 className="text-3xl font-bold text-blue-600">15+</h3>
                              <p className="text-gray-600 mt-2">Partner Industries</p>
                           </div>
                           <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                              <h3 className="text-3xl font-bold text-blue-600">98%</h3>
                              <p className="text-gray-600 mt-2">Success Rate</p>
                           </div>
                           <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                              <h3 className="text-3xl font-bold text-blue-600">24/7</h3>
                              <p className="text-gray-600 mt-2">Support Available</p>
                           </div>
                        </div>
                        
                        {/* CTA Buttons with animation */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6 animate-fadeIn">
                        <Link 
   to="/about" 
   className="px-8 py-4 bg-[#1A2755] text-white rounded-full hover:bg-[#3532D9] transition-all transform hover:scale-105 font-medium inline-block text-center"
>
   Learn More
</Link>
                          
                        </div>
                     </div>
                     
                     {/* Image Side with animations */}
                     <div className="lg:w-1/2 relative animate-slideInRight">
                        {/* Background decorations with animation */}
                        <div className="absolute -top-4 -right-4 w-64 h-64 bg-blue-50 rounded-full -z-10 animate-pulse"></div>
                        <div className="absolute -bottom-4 -left-4 w-64 h-64 bg-blue-100 rounded-full -z-10 animate-pulse"></div>
                        
                        {/* Main image with hover effect */}
                        
                        <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl mb-16">
                           <img  
                              src={about} 
                              alt="About Us" 
                              className="w-full h-auto object-cover transform hover:scale-105 transition-all duration-700"
                           />
                        </div>
                        
                        {/* Floating card with animation */}
                        <div className="absolute bottom-0 right-8 bg-white p-6 rounded-xl shadow-xl z-20 animate-fadeIn hover:shadow-2xl transition-shadow">
                           <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center transform hover:rotate-12 transition-transform">
                                 <i className="fas fa-handshake text-white text-xl"></i>
                              </div>
                              <div>
                                 <h4 className="font-semibold text-lg">Trusted Platform</h4>
                                 <p className="text-gray-500">1000+ Companies</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            <section className="py-10 lg:py-14 bg-gray-50 w-full">
               <div className="container mx-auto px-6">
                  <div className="bg-gradient-to-r from-[#004195] to-[#000000] rounded-[2rem] overflow-hidden">
                     <div className="flex flex-col lg:flex-row items-center justify-between">
                        <div className="p-6 lg:p-10 max-w-xl">
                           <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
                              Join Our Community Now!
                           </h2>
                           <p className="text-white/80 mb-8">
                              Become part of a growing network of skilled individuals and inclusive employers. 
                              Together, let's create a diverse and accessible workforce.
                           </p>
                           <a href="/user-type">
                              <button className="px-8 py-3 border border-white text-white rounded-full hover:bg-white hover:text-blue-500 transition duration-300">
                                 Get Started Now
                              </button>
                              </a>
                        </div>
                        <div className="lg:w-1/2 flex justify-end p-6 lg:p-0">
                           <img
                              src={joinpic}
                              alt="Join community illustration"
                              className="w-auto h-[300px] object-contain"
                           />
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            <section id ="featured-jobs" className="py-10 lg:py-14">
               <div className="container mx-auto px-4">
                  <div className="p-4 lg:p-8 max-w-screen-xl mx-auto">
                     <div className="flex flex-col lg:flex-row justify-between gap-4">
                        <div>
                           <h2 className="text-blue-500 text-lg font-black">Featured Jobs</h2>
                           <h1 className="text-black text-3xl lg:text-4xl font-bold mb-8">Latest Job Opportunity</h1>
                        </div>
                        <div className="flex space-x-2">
                           <button className="bg-white p-2 rounded-full shadow-md border w-10 h-10 flex items-center justify-center" onClick={handlePrevClick}>
                              <i className="fas fa-arrow-left"></i>
                           </button>
                           <button className="bg-white p-2 rounded-full shadow-md border w-10 h-10 flex items-center justify-center" onClick={handleNextClick}>
                              <i className="fas fa-arrow-right"></i>
                           </button>
                        </div>
                     </div>
                     <div className="flex flex-col lg:flex-row gap-4">
                        <div className="bg-[#F4F8FF] p-4 rounded-xl shadow-md w-full lg:w-1/6 h-auto lg:h-40">
                           <ul className="p-2">
                              <li className="flex items-center ">
                                 <button 
                                 onClick={() => setSelectedCategory('Technology')} 
                                 className={`flex items-center ${selectedCategory === 'Technology' ? 'bg-blue-100' : ''} hover:bg-blue-50 p-1 rounded w-full`}
                                 >
                                 <div className={`w-1 h-6 ${selectedCategory === 'Technology' ? 'bg-blue-500' : 'bg-transparent'} mr-2`}></div>
                                 <span className={`font-bold ${selectedCategory === 'Technology' ? 'text-blue-500' : 'text-black'}`}>Technology</span>
                                 </button>
                              </li>
                              <li className="flex items-center ">
                                 <button 
                                 onClick={() => setSelectedCategory('Medical')} 
                                 className={`flex items-center ${selectedCategory === 'Medical' ? 'bg-blue-100' : ''} hover:bg-blue-50 p-1 rounded w-full`}
                                 >
                                 <div className={`w-1 h-6 ${selectedCategory === 'Medical' ? 'bg-blue-500' : 'bg-transparent'} mr-2`}></div>
                                 <span className={`font-bold ${selectedCategory === 'Medical' ? 'text-blue-500' : 'text-black'}`}>Medical</span>
                                 </button>
                              </li>
                              <li className="flex items-center ">
                                 <button 
                                 onClick={() => setSelectedCategory('Engineering')} 
                                 className={`flex items-center ${selectedCategory === 'Engineering' ? 'bg-blue-100' : ''} hover:bg-blue-50  p-1 rounded w-full`}
                                 >
                                 <div className={`w-1 h-6 ${selectedCategory === 'Engineering' ? 'bg-blue-500' : 'bg-transparent'} mr-2`}></div>
                                 <span className={`font-bold ${selectedCategory === 'Engineering' ? 'text-blue-500' : 'text-black'}`}>Engineering</span>
                                 </button>
                              </li>
                              <li className="flex items-center">
                                 <button 
                                 onClick={() => setSelectedCategory('Arts')} 
                                 className={`flex items-center ${selectedCategory === 'Arts' ? 'bg-blue-100' : ''} hover:bg-blue-50 p-1 rounded w-full`}
                                 >
                                 <div className={`w-1 h-6 ${selectedCategory === 'Arts' ? 'bg-blue-500' : 'bg-transparent'} mr-2`}></div>
                                 <span className={`font-bold ${selectedCategory === 'Arts' ? 'text-blue-500' : 'text-black'}`}>Arts</span>
                                 </button>
                              </li>
                           </ul>
                        </div>
                        <div className="flex-1">
                           <div className="bg-[#0048BE] p-4 lg:p-6 rounded-xl">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                 {filteredJobs.length > 0 && filteredJobs.slice(currentIndex, currentIndex + 3).map((job, index) => ( // Use filtered jobs
                                 <div key={index} className="bg-white p-6 rounded-xl shadow-md h-[300px] flex flex-col justify-between">
                                    <div>
                                       <div className="flex justify-between items-start mb-4">
                                       <div>
                                          <h3 className="text-black text-lg font-bold mb-2">{job.title}</h3>
                                          <p className="text-gray-500 text-sm">{job.company}</p>
                                       </div>
                                       <img 
                                          src={job.logo} 
                                          alt={`${job.company} logo`} 
                                          className="w-16 h-16 object-contain rounded-xl"
                                       />
                                       </div>
                                       <p className="text-gray-500 line-clamp-4">{job.description}</p>
                                    </div>
                                    <Link to="/login">
  <button className="bg-blue-900 text-white mt-4 py-2 px-4 w-full rounded-xl">
    Apply Now
  </button>
</Link>
                                 </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            <section className="py-10 lg:py-14 bg-white">
               <div className="container mx-auto px-4">
                  <div className="flex flex-col lg:flex-row justify-between mb-4 bg-[#EEF0FC] p-4 lg:p-8 rounded-xl">
                     <div className="max-w-2xl">
                        <h2 className="text-3xl lg:text-4xl font-bold text-[#2036BE] leading-tight">
                           Looking for help? Here are our most frequently asked questions.
                        </h2>
                        <p className="text-[#2036BE] mt-4 text-md mb-8">
                           Everything you need to know about EmpowerPWD and our services.
                        </p>
                        
                     </div>
                     <div className="relative w-full lg:w-80 mt-4 lg:mt-0">
               <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                     onClick={() => setActiveForm('question')}
                     className="px-6 py-2.5 border-2 border-[#2036BE] text-[#2036BE] rounded-full hover:bg-[#2036BE] hover:text-white transition-colors text-sm font-medium w-full sm:w-1/2"
                  >
                     I've got a question
                     <span className="ml-2">→</span>
                  </button>
                  <button 
                     onClick={() => setActiveForm('chat')}
                     className="px-6 py-2.5 bg-[#334ACE] text-white rounded-full hover:bg-[#3532D9] transition-colors text-sm font-medium w-full sm:w-1/2"
                  >
                     Chat to our team
                     <span className="ml-2">→</span>
                  </button>
               </div>
               </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-[#EEF0FC] p-4 lg:p-8 rounded-xl shadow-md">
                     {[
                        {
                           icon: "🎯",
                           title: "What is EmpowerPWD?",
                           description: "Here for the first time? Learn how EmpowerPWD can help you grow.",
                           answer: "EmpowerPWD is a dedicated platform connecting persons with disabilities to inclusive employment opportunities. We provide tools, resources, and support to help both job seekers and employers create successful partnerships.",
                           link: "#"
                        },
                        {
                           icon: "💼",
                           title: "The Platform",
                           description: "Tracking your applications and managing your profile.",
                           answer: "The platform allows job seekers to create profiles, search for jobs, apply for jobs, and manage their job applications efficiently. Employers can post job listings, review applications, and manage their company profiles.",
                           link: "#"
                        },
                        {
                           icon: "🚀",
                           title: "Getting Started",
                           description: "Everything you need to know to get started with EmpowerPWD.",
                           answer: "To get started with EmpowerPWD, you need to register as a job seeker or an employer. Once registered, you can create a profile, search for jobs, apply for jobs, and manage your job applications efficiently. Employers can post job listings, review applications, and manage their company profiles.",
                           link: "#"
                        },
                        {
                           icon: "🎮",
                           title: "Job Search",
                           description: "Learn how to search and apply for jobs effectively.",
                           answer: "To search for jobs effectively, you can use the search bar to search for job titles, keywords, or locations. You can also filter jobs based on category, location, and company. Once you find a job that interests you, you can apply for it by clicking the 'Apply Now' button.",
                           link: "#"
                        },
                        {
                           icon: "💬",
                           title: "Messaging",
                           description: "Connect and communicate with potential employers.",
                           answer: "You can connect and communicate with potential employers by sending messages through the platform. Employers can send messages to job seekers, and job seekers can send messages to employers.",
                           link: "#"
                        },
                        {
                           icon: "📥",
                           title: "Applications",
                           description: "Track and manage your job applications efficiently.",
                           answer: "You can track and manage your job applications efficiently by using the platform's features. You can view your job applications, update your application status, and receive notifications about your job applications.",
                           link: "#"
                        },
                        {
                           icon: "🤖",
                           title: "Resources",
                           description: "Access training materials and helpful resources.",
                           answer: "You can access training materials and helpful resources by using the platform's features. You can view training materials, read articles, and access other resources related to job searching and employment.",
                           link: "#"
                        },
                        {
                           icon: "🤖",
                           title: "Support",
                           description: "Get help and support whenever you need it.",
                           answer: "You can get help and support whenever you need it by using the platform's features. You can contact our support team through the 'Get in Touch' section on the homepage. You can also receive support from other users through the platform's features.",
                           link: "#"
                        }
                     ].map((item, index) => (
                        <div key={index} className="relative h-[200px]">
                           <button 
                              onClick={() => setSelectedFaq(selectedFaq === index ? null : index)}
                              className="w-full text-left h-full"
                           >
                              <div className={`p-6 bg-white rounded-2xl hover:shadow-lg transition-all h-full ${selectedFaq === index ? 'ring-2 ring-[#4744F2]' : ''}`}>
                                 <span className="text-3xl mb-4 block">{item.icon}</span>
                                 <h3 className="font-semibold text-lg mb-2 text-[#2036BE]">{item.title}</h3>
                                 <p className="text-[#2036BE]/70 text-sm line-clamp-2">{item.description}</p>
                              </div>
                           </button>
                           
                           {/* Answer Popup */}
                           {selectedFaq === index && (
                              <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
                                 <div className="bg-white rounded-xl p-6 max-w-md relative">
                                    <h3 className="font-semibold text-lg mb-4 text-[#4744F2]">{item.title}</h3>
                                    <p className="text-gray-600 text-sm">{item.answer}</p>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedFaq(null);
                                      }}
                                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                                    >
                                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                       </svg>
                                    </button>
                                 </div>
                              </div>
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            </section>

            {activeForm === 'question' && <QuestionForm />}
            {activeForm === 'chat' && <ChatForm />}
         </main>

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
                           <li>
                              <a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a>
                           </li>
                           <li>
                              <a href="#" className="text-gray-400 hover:text-white transition-colors">About</a>
                           </li>
                           <li>
                              <a href="#" className="text-gray-400 hover:text-white transition-colors">How it Works</a>
                           </li>
                           <li>
                              <a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a>
                           </li>
                        </ul>
                     </div>

                     <div>
                        <h3 className="text-lg font-semibold mb-4">Resources</h3>
                        <ul className="space-y-3">
                           <li>
                              <a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a>
                           </li>
                           <li>
                              <a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a>
                           </li>
                           <li>
                              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                           </li>
                           <li>
                              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                           </li>
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
                        <button
                        onClick={() => setIsPrivacyOpen(true)}
                        className="text-gray-400 hover:text-white text-sm transition-colors"
                        >
                        Privacy Policy
                        </button>
                        <button
                        onClick={() => setIsTermsOpen(true)}
                        className="text-gray-400 hover:text-white text-sm transition-colors"
                        >
                        Terms of Service
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </footer>

         <Modal
            isOpen={isPrivacyOpen}
            onClose={() => setIsPrivacyOpen(false)}
            title="Privacy Policy"
            >
            <PrivacyContent />
         </Modal>
         <Modal
            isOpen={isTermsOpen}
            onClose={() => setIsTermsOpen(false)}
            title="Terms of Service"
            >
            <TermsContent />
         </Modal>
      </div>
   )


}


export default HomePageComponent;

