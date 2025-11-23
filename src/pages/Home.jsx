// Home.jsx
import React, { useState, useEffect } from 'react';
import { Shield, Zap, Globe, ArrowRight, CheckCircle, Clock, FileText, Users, Lock, Award, Sparkles } from 'lucide-react';

const Home = ({ setCurrentPage, theme }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);
  const words = ['Digital Art', 'NFTs', 'Creations', 'Intellectual Property'];
  const [currentFeature, setCurrentFeature] = useState(0);
  const heroBgImage = 'https://i.pinimg.com/1200x/9e/02/31/9e0231e00f7c99c4265bcb24e72a2d7b.jpg';

  // Typing effect
  useEffect(() => {
    const handleTyping = () => {
      const currentWord = words[currentWordIndex];
      
      if (isDeleting) {
        setDisplayText(currentWord.substring(0, displayText.length - 1));
        setTypingSpeed(75);
      } else {
        setDisplayText(currentWord.substring(0, displayText.length + 1));
        setTypingSpeed(150);
      }

      if (!isDeleting && displayText === currentWord) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && displayText === '') {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
      }
    };

    const typingTimer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(typingTimer);
  }, [displayText, isDeleting, currentWordIndex, words]);

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallax = document.getElementById('parallax-bg');
      if (parallax) {
        parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Blockchain Timestamping",
      description: "Immutable proof of creation timestamped on the Ethereum blockchain",
    },
    {
      icon: Zap,
      title: "Instant Verification",
      description: "Verify any artwork's authenticity in seconds with our advanced system",
    },
    {
      icon: Globe,
      title: "Global Registry",
      description: "Decentralized network of verified artworks from creators worldwide",
    },
    {
      icon: Lock,
      title: "Secure Storage",
      description: "IPFS storage with blockchain-backed ownership records",
    }
  ];

  const stats = [
    { number: "15,482", label: "Artworks Protected" },
    { number: "3,297", label: "Verified Artists" },
    { number: "28,956", label: "Successful Verifications" },
    { number: "99.97%", label: "Uptime" }
  ];

  const steps = [
    {
      step: "01",
      title: "Upload Your Art",
      description: "Simply upload your digital artwork to our secure platform"
    },
    {
      step: "02",
      title: "Blockchain Registration",
      description: "We timestamp your creation on the Ethereum blockchain"
    },
    {
      step: "03",
      title: "Get Your Certificate",
      description: "Receive a permanent certificate of authenticity"
    },
    {
      step: "04",
      title: "Verify Anywhere",
      description: "Anyone can verify your artwork's authenticity instantly"
    }
  ];
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <div 
          id="parallax-bg"
          className="absolute inset-0 bg-cover bg-center bg-fixed transition-transform duration-0"
          style={{
            backgroundImage: `url('${heroBgImage}')`,
          }}
        />
        
        {/* Enhanced Overlay - Less intrusive */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-900/80 to-slate-800/60"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center pt-20 pb-20">
          {/* Trust Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 mb-8">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-300">
              Trusted by 3,297+ digital artists
            </span>
          </div>

          {/* Main Headline with Typing Effect */}
          <div className="space-y-6 mb-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Protect Your
              <br />
              <span className="block bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent min-h-[1.2em]">
                {displayText}
                <span className="ml-1 animate-pulse">|</span>
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Secure your creative work with blockchain technology. 
              <span className="text-blue-400 font-semibold"> Timestamp, verify, and protect</span> 
              {" "}your digital art from plagiarism with immutable proof of ownership.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={() => setCurrentPage('register')}
              className="group px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-all duration-200 hover:scale-105 flex items-center space-x-3 shadow-lg"
            >
              <Shield className="w-5 h-5" />
              <span>Start Protecting</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => setCurrentPage('gallery')}
              className="px-8 py-4 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white rounded-lg font-semibold text-lg transition-all duration-200 hover:scale-105 bg-slate-800/30 backdrop-blur-sm"
            >
              View Gallery
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-slate-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose PRISM?
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Comprehensive protection for your digital creativity using cutting-edge blockchain technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`p-6 rounded-xl border border-slate-700 bg-slate-800/50 hover:border-slate-600 transition-all duration-300 hover:scale-105 group ${
                    currentFeature === index
                      ? 'border-blue-500 bg-blue-500/10 transform scale-105'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${
                    currentFeature === index
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-400">
              Get started in minutes with our simple process
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-slate-800 rounded-2xl p-12 border border-slate-700">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Protect Your Art?
            </h2>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              Join thousands of artists who trust PRISM to protect their digital creations with blockchain technology
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setCurrentPage('register')}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-all duration-200 hover:scale-105 flex items-center space-x-3"
              >
                <Shield className="w-5 h-5" />
                <span>Register Your Artwork</span>
              </button>
              <button
                onClick={() => setCurrentPage('verify')}
                className="px-8 py-4 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white rounded-lg font-semibold text-lg transition-all duration-200"
              >
                Verify Artwork
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-2">
          <div className="grid md:grid-cols-4 gap-14">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                  <span className="font-bold text-white text-lg">P</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">PRISM</h3>
                  <p className="text-slate-400 text-sm">Plagiarism Resistant Integrity System for Media</p>
                </div>
              </div>
              <p className="text-slate-400 max-w-md">
                Protecting digital creativity through blockchain technology. 
                Timestamp, verify, and secure your artwork with immutable proof.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><button onClick={() => setCurrentPage('home')} className="text-slate-400 hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => setCurrentPage('gallery')} className="text-slate-400 hover:text-white transition-colors">Gallery</button></li>
                <li><button onClick={() => setCurrentPage('register')} className="text-slate-400 hover:text-white transition-colors">Register Art</button></li>
                <li><button onClick={() => setCurrentPage('verify')} className="text-slate-400 hover:text-white transition-colors">Verify Art</button></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © 2024 PRISM. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;