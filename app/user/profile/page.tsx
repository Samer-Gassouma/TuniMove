'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, User, Phone, Mail, Shield, Edit2, Save, X, Menu } from 'lucide-react';
import ParticleBackground from '@/components/ParticleBackground';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  isPhoneVerified: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const verifyAndLoadUser = async () => {
      const token = localStorage.getItem('userToken');
      const userData = localStorage.getItem('userProfile');
      
      if (!token) {
        console.log('🔒 No user token found, redirecting to login');
        router.push('/user/auth/login');
        return;
      }

      // If we have cached user data and it's valid, use it
      if (userData && userData !== 'null' && userData !== 'undefined') {
        try {
          const parsedUser = JSON.parse(userData);
          if (parsedUser && typeof parsedUser === 'object') {
            setUser(parsedUser);
            setEditData({
              firstName: parsedUser.firstName || '',
              lastName: parsedUser.lastName || '',
              email: parsedUser.email || ''
            });
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
          localStorage.setItem('userProfile', JSON.stringify(verifiedUser));
          setUser(verifiedUser);
          setEditData({
            firstName: verifiedUser.firstName || '',
            lastName: verifiedUser.lastName || '',
            email: verifiedUser.email || ''
          });
          console.log('✅ User token verified, user loaded');
        } else {
          throw new Error(result.message || 'Token verification failed');
        }
      } catch (error) {
        console.error('❌ Token verification failed:', error);
        localStorage.removeItem('userToken');
        localStorage.removeItem('userProfile');
        document.cookie = 'userToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        router.push('/user/auth/login');
      }
    };

    verifyAndLoadUser();
  }, [router]);

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || ''
    });
    setError('');
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch('/api/v1/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });

      const data = await response.json();

      if (response.ok) {
        // Update user data in localStorage and state
        const updatedUser: User = {
          ...user!,
          firstName: editData.firstName,
          lastName: editData.lastName,
          email: editData.email
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
        setSuccess('Profile updated successfully!');
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4 sm:py-6">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-gray-300 hover:bg-slate-800 hover:text-white p-2 flex-shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-2xl font-bold text-white truncate">Profile Settings</h1>
                  <p className="text-gray-400 text-sm sm:text-base truncate">Manage your account information</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
          {/* Profile Information Card */}
          <Card className="backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-600/50 mb-6 sm:mb-8">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl sm:text-2xl text-white">Personal Information</CardTitle>
                  <CardDescription className="text-gray-400 text-sm sm:text-base">
                    Your basic account details
                  </CardDescription>
                </div>
                
                {!isEditing ? (
                  <Button 
                    onClick={handleEdit}
                    variant="outline"
                    className="border-slate-600 text-gray-300 hover:bg-slate-800 hover:text-white w-full sm:w-auto"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      onClick={handleSave}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 text-white order-1 sm:order-none"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button 
                      onClick={handleCancel}
                      variant="outline"
                      className="border-slate-600 text-gray-300 hover:bg-slate-800 hover:text-white order-2 sm:order-none"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {error && (
                <div className="p-3 sm:p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="p-3 sm:p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    First Name
                  </label>
                  {isEditing ? (
                    <Input
                      value={editData.firstName}
                      onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                      className="bg-slate-800/50 border-slate-600 text-white h-11 sm:h-12"
                      placeholder="Enter first name"
                    />
                  ) : (
                    <p className="text-white text-base sm:text-lg p-3 bg-slate-800/30 rounded-lg border border-slate-700">
                      {user.firstName}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Last Name
                  </label>
                  {isEditing ? (
                    <Input
                      value={editData.lastName}
                      onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                      className="bg-slate-800/50 border-slate-600 text-white h-11 sm:h-12"
                      placeholder="Enter last name"
                    />
                  ) : (
                    <p className="text-white text-base sm:text-lg p-3 bg-slate-800/30 rounded-lg border border-slate-700">
                      {user.lastName}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Email Address
                  </label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      className="bg-slate-800/50 border-slate-600 text-white h-11 sm:h-12"
                      placeholder="Enter email address (optional)"
                    />
                  ) : (
                    <p className="text-white text-base sm:text-lg p-3 bg-slate-800/30 rounded-lg border border-slate-700">
                      {user.email || 'Not provided'}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Phone Number
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-white text-base sm:text-lg truncate flex-1">{user.phoneNumber}</span>
                    {user.isPhoneVerified ? (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1 flex-shrink-0">
                        <Shield className="w-3 h-3" />
                        <span className="hidden sm:inline">Verified</span>
                        <span className="sm:hidden">✓</span>
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex-shrink-0">
                        <span className="hidden sm:inline">Pending</span>
                        <span className="sm:hidden">!</span>
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    Contact support to change your phone number
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status Card */}
          <Card className="backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-600/50">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl text-white">Account Status</CardTitle>
              <CardDescription className="text-gray-400 text-sm sm:text-base">
                Your account verification and security status
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium text-sm sm:text-base">Phone Verification</p>
                    <p className="text-gray-400 text-xs sm:text-sm truncate">Your phone number verification status</p>
                  </div>
                </div>
                {user.isPhoneVerified ? (
                  <span className="px-2 sm:px-3 py-1 bg-green-500/20 text-green-400 text-xs sm:text-sm rounded-full flex-shrink-0">
                    <span className="hidden sm:inline">Verified</span>
                    <span className="sm:hidden">✓</span>
                  </span>
                ) : (
                  <span className="px-2 sm:px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs sm:text-sm rounded-full flex-shrink-0">
                    <span className="hidden sm:inline">Pending</span>
                    <span className="sm:hidden">!</span>
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium text-sm sm:text-base">Account Created</p>
                    <p className="text-gray-400 text-xs sm:text-sm truncate">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="px-2 sm:px-3 py-1 bg-blue-500/20 text-blue-400 text-xs sm:text-sm rounded-full flex-shrink-0">
                  Active
                </span>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
} 