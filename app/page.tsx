"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Users, Zap, Shield, Clock, Star, Truck, Building2, UserPlus, ArrowDown, ChevronDown, Sparkles, Globe, TrendingUp, LogIn, Download, BookOpen, Network, Smartphone, Menu, X } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import { useLanguage } from "@/lib/hooks/useLanguage";
import { LanguageProvider } from "@/components/LanguageProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { RoutesTable } from "@/components/RoutesTable";
import { InteractiveMap } from "@/components/InteractiveMap";
import { useRouter } from "next/navigation";

function LandingPageContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const featuresRef = useRef<HTMLDivElement>(null);
  const routesRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    setIsMobileMenuOpen(false); // Close mobile menu after clicking
  };

  const handleDownloadApp = () => {
    // In a real app, this would trigger app store downloads
    alert('App download coming soon!');
  };

  const handleBookOnline = () => {
    router.push('/user/dashboard');
  };

  return (
    <div className="min-h-screen relative bg-black">
      {/* Particle Background with Neon Effects */}
      <div className="fixed inset-0 z-0">
        <ParticleBackground 
          particleColor="rgba(239, 68, 68, 0.8)"
          connectionColor="rgba(239, 68, 68, 0.3)"
        />
      </div>

      {/* Background Gradient Overlay with Red Accents */}
      <div className="fixed inset-0 z-1 bg-gradient-to-br from-red-900/20 via-black/80 to-red-950/20" />

      {/* Neon Grid Pattern */}
      <div className="fixed inset-0 z-1 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(239, 68, 68, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(239, 68, 68, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px'
        }} />
      </div>

      <div className="relative z-10">
        {/* Navigation - Clean and Simple */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-white">
                  Louaj
                </h1>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-6">
                <button
                  onClick={() => scrollToSection(featuresRef as React.RefObject<HTMLDivElement>)}
                  className="text-white hover:text-blue-400 transition-colors font-medium"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection(routesRef as React.RefObject<HTMLDivElement>)}
                  className="text-white hover:text-blue-400 transition-colors font-medium"
                >
                  Routes
                </button>
                <button
                  onClick={() => router.push('/station-partnership')}
                  className="text-white hover:text-blue-400 transition-colors font-medium"
                >
                  Partner
                </button>
                <div className="flex items-center space-x-3">
                  <Button
                    size="sm"
                    onClick={handleBookOnline}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium"
                  >
                    <BookOpen className="mr-1 h-4 w-4" />
                    Book Trip
                  </Button>
                  <LanguageSwitcher />
                </div>
              </div>


              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center space-x-3">
                <LanguageSwitcher />
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-white hover:text-blue-400 transition-colors"
                  aria-label="Toggle mobile menu"
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-white/10">
                <div className="px-4 py-4 space-y-4">
                  <button
                    onClick={() => scrollToSection(featuresRef as React.RefObject<HTMLDivElement>)}
                    className="block w-full text-left text-white hover:text-blue-400 transition-colors font-medium py-2"
                  >
                    Features
                  </button>
                  <button
                    onClick={() => scrollToSection(routesRef as React.RefObject<HTMLDivElement>)}
                    className="block w-full text-left text-white hover:text-blue-400 transition-colors font-medium py-2"
                  >
                    Routes
                  </button>
                  <button
                    onClick={() => router.push('/station-partnership')}
                    className="block w-full text-left text-white hover:text-blue-400 transition-colors font-medium py-2"
                  >
                    Partner
                  </button>
                  <div className="pt-2 border-t border-white/10">
                    <Button
                      onClick={handleBookOnline}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 text-sm font-medium"
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Book Your Trip
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Section - Simplified and Professional */}
        <section className="min-h-screen flex flex-col items-center justify-center relative px-4 sm:px-6 lg:px-8 pt-16">
          <div className="text-center max-w-4xl mx-auto">
            {/* Simple Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 mb-8">
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 font-medium text-sm">Transportation Made Easy</span>
            </div>

            {/* Clear, Readable Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">
                Travel Across
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Tunisia
              </span>
            </h1>

            {/* Simple Subtitle */}
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-gray-300">
              Safe, Reliable, and Affordable Transportation
            </h2>

            {/* Clear Description */}
            <p className="text-lg sm:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Book your bus tickets online, track your journey in real-time, and travel comfortably across Tunisia with our trusted transportation network.
            </p>

            {/* Clear Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button
                size="lg"
                onClick={handleBookOnline}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Book Your Trip
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                size="lg"
                onClick={handleDownloadApp}
                variant="outline"
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200"
              >
                <Download className="mr-2 h-5 w-5 text-blue-400 hover:text-white" />
                Get the App
              </Button>
            </div>

            {/* Simple Scroll Indicator */}
            <div className="text-gray-500 text-sm flex items-center gap-2" role="button" tabIndex={0}>
              <span>Scroll to explore features</span>
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </div>

            {/* Skip Link for Accessibility */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium z-50"
            >
              Skip to main content
            </a>
          </div>
        </section>

        {/* Features Section - Simple and Clear */}
        <section
          ref={featuresRef}
          id="main-content"
          className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50"
          aria-labelledby="features-heading"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2
                id="features-heading"
                className="text-3xl sm:text-4xl font-bold text-white mb-4"
              >
                Why Choose Our Service?
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Simple, safe, and convenient transportation for everyone
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1: Easy Booking */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Easy Online Booking</h3>
                <p className="text-gray-400 leading-relaxed">
                  Book your bus tickets from home or anywhere with just a few clicks. No need to wait in line!
                </p>
              </div>

              {/* Feature 2: Safe Travel */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200">
                <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Safe & Reliable</h3>
                <p className="text-gray-400 leading-relaxed">
                  Travel with licensed drivers and well-maintained vehicles. Your safety is our top priority.
                </p>
              </div>

              {/* Feature 3: Real-time Tracking */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200">
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Track Your Bus</h3>
                <p className="text-gray-400 leading-relaxed">
                  Know exactly when your bus will arrive. Get real-time updates about your journey.
                </p>
              </div>

              {/* Feature 4: Affordable */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200">
                <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Great Prices</h3>
                <p className="text-gray-400 leading-relaxed">
                  Travel across Tunisia without breaking the bank. Affordable fares for everyone.
                </p>
              </div>

              {/* Feature 5: Many Routes */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200">
                <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center mb-4">
                  <Network className="h-6 w-6 text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Many Destinations</h3>
                <p className="text-gray-400 leading-relaxed">
                  Travel to cities and towns across Tunisia. We connect you to where you need to go.
                </p>
              </div>

              {/* Feature 6: 24/7 Support */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200">
                <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Help When You Need It</h3>
                <p className="text-gray-400 leading-relaxed">
                  Our friendly team is here to help you anytime. Get assistance with your booking or travel.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Routes & Map Section - Clear and Simple */}
        <section ref={routesRef} className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Bus Routes & Destinations
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                See all our bus routes, prices, and destinations across Tunisia
              </p>
            </div>

            {/* Side by side layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Routes Table on the left */}
              <div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Route Information</h3>
                  <p className="text-gray-400 text-sm">
                    Choose your starting point and destination to see prices and available routes.
                  </p>
                </div>
                <RoutesTable />
              </div>

              {/* Interactive Map on the right */}
              <div ref={mapRef}>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Interactive Map</h3>
                  <p className="text-gray-400 text-sm">
                    Click on stations to see details. Green dots = Online stations, Gray dots = Offline stations.
                  </p>
                </div>
                <InteractiveMap />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Simple and Clear */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900/30">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 md:p-12">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Ready to Start Your Journey?
              </h3>
              <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
                Join thousands of travelers who choose us for safe, comfortable, and affordable bus travel across Tunisia.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => router.push('/user/dashboard')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Book Your Trip
                </Button>
                <Button
                  size="lg"
                  onClick={() => router.push('/user/auth/login')}
                  variant="outline"
                  className="border-white/20 text-blue-400 hover:bg-white/10 hover:text-white px-8 py-3 text-lg font-semibold"
                >
                  <LogIn className="mr-2 h-5 w-5 text-blue-400 hover:text-white" />
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer - Clean and Professional */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900/50 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Company Info */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Louaj</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Safe, reliable, and affordable transportation across Tunisia. Making travel easy for everyone.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Book Trip</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">View Routes</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help & Support</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Get Help</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>📞 Call us: +216 XX XXX XXX</li>
                  <li>💬 WhatsApp: +216 XX XXX XXX</li>
                  <li>📧 Email: help@louaj.tn</li>
                  <li>⏰ Available 24/7</li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 text-center">
              <p className="text-gray-500 text-sm">
                © 2024 Louaj. Making transportation simple and safe for everyone in Tunisia.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Custom CSS for Neon Effects */}
      <style jsx>{`
        .glow-red {
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
        }
        .glow-red:hover {
          box-shadow: 0 0 30px rgba(239, 68, 68, 0.6);
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <LandingPageContent />
    </LanguageProvider>
  );
}