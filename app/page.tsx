"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Users, Zap, Shield, Clock, Star, Truck, Building2, UserPlus, ArrowDown, ChevronDown, Sparkles, Globe, TrendingUp, LogIn } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import { useRouter } from "next/navigation";

export default function Home() {
  const [stationEmail, setStationEmail] = useState("");
  const [stationName, setStationName] = useState("");
  const [activeSection, setActiveSection] = useState<'user' | 'station' | null>(null);
  const router = useRouter();

  const userSectionRef = useRef<HTMLDivElement>(null);
  const stationSectionRef = useRef<HTMLDivElement>(null);

  const handleStationRequest = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Station request:", { stationName, stationEmail });
  };

  const scrollToSection = (section: 'user' | 'station') => {
    setActiveSection(section);
    const targetRef = section === 'user' ? userSectionRef : stationSectionRef;
    
    if (targetRef.current) {
      targetRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleUserLogin = () => {
    router.push('/auth/login');
  };

  const handleUserRegister = () => {
    router.push('/auth/register');
  };

  return (
    <div className="min-h-screen relative bg-black">
      {/* Particle Background */}
      <div className="fixed inset-0 z-0">
        <ParticleBackground 
          particleColor={
            activeSection === 'user' ? "rgba(59, 130, 246, 0.8)" :
            activeSection === 'station' ? "rgba(34, 197, 94, 0.8)" :
            "rgba(139, 92, 246, 0.7)"
          }
          connectionColor={
            activeSection === 'user' ? "rgba(59, 130, 246, 0.3)" :
            activeSection === 'station' ? "rgba(34, 197, 94, 0.3)" :
            "rgba(139, 92, 246, 0.2)"
          }
        />
      </div>

      {/* Background Gradient Overlay */}
      <div className={`fixed inset-0 z-1 transition-all duration-1000 ${
        activeSection === 'user' 
          ? 'bg-gradient-to-br from-blue-900/40 via-slate-900/60 to-indigo-900/40'
          : activeSection === 'station'
          ? 'bg-gradient-to-br from-green-900/40 via-slate-900/60 to-emerald-900/40'
          : 'bg-gradient-to-br from-purple-900/30 via-slate-900/50 to-blue-900/30'
      }`} />

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center relative px-3 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-purple-500/30 mb-6 sm:mb-8 animate-bounce-in">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
              <span className="text-purple-300 font-medium text-xs sm:text-sm">Tunisia's Smart Transportation Revolution</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black mb-6 sm:mb-8 animate-fade-in-up">
              <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent leading-tight">
                Tuni
              </span>
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
                Move
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl lg:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200 px-4 sm:px-0">
              The future of transportation is here. Connect, travel, and transform how Tunisia moves with our 
              <span className="text-purple-400 font-semibold"> intelligent network</span>.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-16 animate-fade-in-up animation-delay-400 px-4 sm:px-0">
              <Button 
                size="lg" 
                onClick={() => scrollToSection('user')}
                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
              >
                <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Join as Passenger
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button 
                size="lg" 
                onClick={() => scrollToSection('station')}
                className="group bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-2xl hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
              >
                <Building2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Station Partnership
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Scroll Indicator */}
            <div className="animate-bounce">
              <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-24 lg:py-32 px-3 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16 lg:mb-20">
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Why Choose
                </span>{" "}
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  TuniMove?
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto px-4 sm:px-0">
                Revolutionary features that redefine transportation
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  icon: <Zap className="h-6 w-6 sm:h-8 sm:w-8" />,
                  title: "Real-time Intelligence",
                  description: "AI-powered tracking with live updates and predictive routing for optimal travel experience"
                },
                {
                  icon: <Shield className="h-6 w-6 sm:h-8 sm:w-8" />,
                  title: "Enterprise Security",
                  description: "Bank-level encryption and advanced security protocols protecting every journey"
                },
                {
                  icon: <Globe className="h-6 w-6 sm:h-8 sm:w-8" />,
                  title: "Smart Network",
                  description: "Interconnected ecosystem connecting all of Tunisia through intelligent coordination"
                }
              ].map((feature, index) => (
                <div key={index} className="group animate-fade-in-up" style={{ animationDelay: `${index * 200}ms` }}>
                  <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-purple-500/10 h-full">
                    <CardContent className="p-6 sm:p-8">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 group-hover:text-purple-300 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* User Section */}
        <section ref={userSectionRef} className="py-16 sm:py-24 lg:py-32 px-3 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <Card className={`backdrop-blur-xl border transition-all duration-700 ${
              activeSection === 'user' 
                ? 'bg-gradient-to-br from-blue-900/30 to-slate-900/30 border-blue-400/50 shadow-2xl shadow-blue-500/20 scale-105' 
                : 'bg-gradient-to-br from-slate-800/30 to-slate-900/30 border-slate-600/30'
            }`}>
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Left Content */}
                <div className="p-6 sm:p-8 lg:p-16">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-6 sm:mb-8 transition-all duration-500 ${
                    activeSection === 'user' ? 'scale-110 shadow-xl shadow-blue-500/30' : ''
                  }`}>
                    <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  
                  <h3 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 transition-all duration-500 ${
                    activeSection === 'user'
                      ? 'bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent'
                      : 'text-white'
                  }`}>
                    Join as Passenger
                  </h3>
                  
                  <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed">
                    Step into the future of transportation with intelligent routing, 
                    real-time updates, and seamless booking.
                  </p>

                  <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    {[
                      "🎯 AI-powered route optimization",
                      "⚡ Real-time tracking & notifications", 
                      "💎 Premium comfort experience",
                      "💰 Dynamic smart pricing",
                      "📱 Intuitive mobile platform",
                      "🎫 Contactless digital tickets"
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3 text-gray-300 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex-shrink-0"></div>
                        <span className="text-sm sm:text-base">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="p-6 sm:p-8 lg:p-16 bg-gradient-to-br from-slate-800/20 to-slate-900/40 backdrop-blur-sm flex flex-col justify-center">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="text-center mb-6 sm:mb-8">
                      <h4 className="text-xl sm:text-2xl font-bold text-white mb-2">Ready to Get Started?</h4>
                      <p className="text-gray-400 text-sm sm:text-base">Join thousands of passengers already using TuniMove</p>
                    </div>
                    
                    <Button 
                      onClick={handleUserLogin}
                      className={`w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl transform hover:scale-105 transition-all duration-300 ${
                        activeSection === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-xl shadow-blue-500/30'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      }`}
                    >
                      <LogIn className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                      Login to Your Account
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-600" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="bg-slate-900 px-4 text-gray-400">or</span>
                      </div>
        </div>

                    <Button 
                      onClick={handleUserRegister}
                      variant="outline"
                      className={`w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl border-2 transition-all duration-300 ${
                        activeSection === 'user'
                          ? 'border-blue-400 text-blue-300 hover:bg-blue-500/10 hover:text-blue-200'
                          : 'border-slate-600 text-gray-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <UserPlus className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                      Create New Account
                    </Button>

                    <p className="text-center text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                      By continuing, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Station Section */}
        <section ref={stationSectionRef} className="py-16 sm:py-24 lg:py-32 px-3 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <Card className={`backdrop-blur-xl border transition-all duration-700 ${
              activeSection === 'station' 
                ? 'bg-gradient-to-br from-green-900/30 to-slate-900/30 border-green-400/50 shadow-2xl shadow-green-500/20 scale-105' 
                : 'bg-gradient-to-br from-slate-800/30 to-slate-900/30 border-slate-600/30'
            }`}>
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Left Content */}
                <div className="p-6 sm:p-8 lg:p-16">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center mb-6 sm:mb-8 transition-all duration-500 ${
                    activeSection === 'station' ? 'scale-110 shadow-xl shadow-green-500/30' : ''
                  }`}>
                    <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  
                  <h3 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 transition-all duration-500 ${
                    activeSection === 'station'
                      ? 'bg-gradient-to-r from-green-300 to-teal-300 bg-clip-text text-transparent'
                      : 'text-white'
                  }`}>
                    Station Partnership
                  </h3>
                  
                  <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed">
                    Transform your station into a smart hub with our cutting-edge 
                    platform and comprehensive management tools.
                  </p>

                  <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    {[
                      "📊 Advanced analytics dashboard",
                      "💼 Complete fleet management", 
                      "🔄 Automated scheduling system",
                      "💳 Integrated payment processing",
                      "📈 Revenue optimization tools",
                      "🛡️ Enhanced security features"
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3 text-gray-300 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-teal-400 flex-shrink-0"></div>
                        <span className="text-sm sm:text-base">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Contact Form */}
                <div className="p-6 sm:p-8 lg:p-16 bg-gradient-to-br from-slate-800/20 to-slate-900/40 backdrop-blur-sm">
                  <div className="text-center mb-6 sm:mb-8">
                    <h4 className="text-xl sm:text-2xl font-bold text-white mb-2">Partner With Us</h4>
                    <p className="text-gray-400 text-sm sm:text-base">Join the transportation revolution</p>
                  </div>
                  
                  <form onSubmit={handleStationRequest} className="space-y-4 sm:space-y-6">
                    <div>
                      <Input
                        type="text"
                        placeholder="Station Name"
                        value={stationName}
                        onChange={(e) => setStationName(e.target.value)}
                        className={`h-11 sm:h-12 text-base sm:text-lg bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 ${
                          activeSection === 'station' ? 'focus:border-green-400' : 'focus:border-slate-400'
                        }`}
                        required
                      />
                    </div>
                    
                    <div>
                      <Input
                        type="email"
                        placeholder="Contact Email"
                        value={stationEmail}
                        onChange={(e) => setStationEmail(e.target.value)}
                        className={`h-11 sm:h-12 text-base sm:text-lg bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 ${
                          activeSection === 'station' ? 'focus:border-green-400' : 'focus:border-slate-400'
                        }`}
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit"
                      className={`w-full h-11 sm:h-12 text-base sm:text-lg font-semibold rounded-xl transform hover:scale-105 transition-all duration-300 ${
                        activeSection === 'station'
                          ? 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-xl shadow-green-500/30'
                          : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700'
                      }`}
                    >
                      <Building2 className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                      Request Partnership
                    </Button>
                  </form>
                  
                  <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-slate-800/30 rounded-xl border border-slate-700/50">
                    <div className="text-center">
                      <h5 className="text-base sm:text-lg font-semibold text-white mb-2">
                        🚀 Early Partner Benefits
                      </h5>
                      <ul className="text-xs sm:text-sm text-gray-400 space-y-1">
                        <li>• Zero setup fees for first 6 months</li>
                        <li>• Priority technical support</li>
                        <li>• Exclusive partner dashboard access</li>
                        <li>• Revenue sharing opportunities</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl sm:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Trusted by
              </span>{" "}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Leaders
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-16 max-w-3xl mx-auto">
              Join the growing network that's revolutionizing transportation across Tunisia
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { number: "150+", label: "Partner Stations", icon: <Building2 className="w-8 h-8" /> },
                { number: "25K+", label: "Daily Passengers", icon: <Users className="w-8 h-8" /> },
                { number: "99.9%", label: "Uptime Reliability", icon: <TrendingUp className="w-8 h-8" /> }
              ].map((stat, index) => (
                <div key={index} className="group animate-count-up" style={{ animationDelay: `${index * 200}ms` }}>
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/30 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-purple-400">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
                    {stat.number}
                  </div>
                  <div className="text-xl text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-900/80 to-black/80 backdrop-blur-xl border-t border-slate-700/50">
          <div className="max-w-7xl mx-auto text-center">
            <h3 className="text-3xl sm:text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Ready to Transform
              </span>{" "}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Transportation?
              </span>
            </h3>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Join the revolution that's connecting Tunisia through intelligent transportation
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300">
              <Sparkles className="mr-2 h-6 w-6" />
              Get Started Today
            </Button>
          </div>
      </footer>
      </div>
    </div>
  );
}
