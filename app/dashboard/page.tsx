"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, LogOut, MapPin, Clock, CreditCard, User, Settings, Menu } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import RecentActivity from "@/components/RecentActivity";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

export default function DashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { user, loading, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAuthenticated) {
    return null; // Will redirect via useEffect
  }  return (
    <div className="min-h-screen relative bg-black">
      {/* Particle Background */}
      <div className="fixed inset-0 z-0">
        <ParticleBackground 
          particleColor="rgba(59, 130, 246, 0.6)"
          connectionColor="rgba(59, 130, 246, 0.2)"
        />
      </div>

      {/* Background Gradient */}
      <div className="fixed inset-0 z-1 bg-gradient-to-br from-blue-900/30 via-slate-900/50 to-purple-900/30" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-700/50 bg-slate-900/20 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4 sm:py-6">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-2xl font-bold text-white truncate">TuniMove Dashboard</h1>
                  <p className="text-gray-400 text-sm sm:text-base truncate">Welcome back, {user.firstName}!</p>
                </div>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden sm:flex items-center gap-3">
                <Button 
                  onClick={() => router.push('/profile')}
                  variant="outline"
                  className="border-slate-600 text-gray-700 hover:bg-slate-800 hover:text-white"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                
                                  <Button
                    onClick={logout}
                    variant="ghost"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden border-slate-600 text-gray-700 hover:bg-slate-800 hover:text-white p-2"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>

            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
              <div className="sm:hidden pb-4 border-t border-slate-700/50 mt-4 pt-4 space-y-2">
                <Button 
                  onClick={() => {
                    router.push('/profile');
                    setMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full justify-start border-slate-600 text-gray-700 hover:bg-slate-800 hover:text-white"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                
                <Button 
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full justify-start border-slate-600 text-gray-700 hover:bg-slate-800 hover:text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <Card 
              onClick={() => router.push('/book-trip')}
              className="backdrop-blur-xl bg-gradient-to-br from-blue-800/30 to-blue-900/30 border border-blue-600/30 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group"
            >
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">Book a Trip</h3>
                <p className="text-gray-400 text-sm sm:text-base">Find and book your next journey</p>
              </CardContent>
            </Card>

            <Card 
              className="backdrop-blur-xl bg-gradient-to-br from-green-800/30 to-green-900/30 border border-green-600/30 hover:border-green-500/50 transition-all duration-300 cursor-pointer group"
              onClick={() => router.push('/booking-history')}
            >
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">My Trips</h3>
                <p className="text-gray-400 text-sm sm:text-base">View your booking history</p>
              </CardContent>
            </Card>

           
          </div>

          {/* Recent Activity */}
          <RecentActivity />
        </main>
      </div>
    </div>
  );
} 