"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, LogOut, MapPin, Clock, CreditCard, User, Settings, Menu } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import RecentActivity from "@/components/RecentActivity";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  isPhoneVerified: boolean;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const verifyAndLoadUser = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token) {
        console.log('🔒 No token found, redirecting to login');
        router.push('/auth/login');
        return;
      }

      // If we have cached user data and it's valid, use it
      if (userData && userData !== 'null' && userData !== 'undefined') {
        try {
          const parsedUser = JSON.parse(userData);
          if (parsedUser && typeof parsedUser === 'object') {
            setUser(parsedUser);
            return;
          }
        } catch (error) {
          console.warn('⚠️ Invalid cached user data, verifying token...');
        }
      }

      // Verify token with backend
      try {
        const response = await fetch('/api/v1/users/verify-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (response.ok && result.success && result.data?.user) {
          const verifiedUser = result.data.user;
          localStorage.setItem('user', JSON.stringify(verifiedUser));
          setUser(verifiedUser);
          console.log('✅ Token verified, user loaded');
        } else {
          throw new Error(result.message || 'Token verification failed');
        }
      } catch (error) {
        console.error('❌ Token verification failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        router.push('/auth/login');
      }
    };

    verifyAndLoadUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear cookie as well
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    console.log('🔒 User logged out');
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
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
                  onClick={handleLogout}
                  variant="outline"
                  className="border-slate-600 text-gray-700 hover:bg-slate-800 hover:text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" />
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
                    handleLogout();
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