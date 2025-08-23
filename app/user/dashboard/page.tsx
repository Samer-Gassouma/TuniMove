'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  LogOut, 
  Map, 
  Calendar, 
  User, 
  Car, 
  Clock, 
  CreditCard, 
  TrendingUp, 
  Route, 
  History, 
  Plus,
  ArrowRight,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function DefaultDashboard() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalTrips: 0,
    completedTrips: 0,
    totalSpent: 0
  })

  useEffect(() => {
    const authToken = localStorage.getItem('userToken')
    const userProfileData = localStorage.getItem('userProfile')
    
    if (!authToken || !userProfileData) {
      router.push('/user/auth/login')
      return
    }

    try {
      const profile = JSON.parse(userProfileData)
      setUserProfile(profile)
    } catch (error) {
      router.push('/user/auth/login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('userToken')
    localStorage.removeItem('userProfile')
    router.push('/user/auth/login')
  }

  // Fetch user bookings and calculate stats
  const fetchUserData = async () => {
    if (!userProfile || !userProfile.id) return

    setLoading(true)
    try {
      const token = localStorage.getItem('userToken')
      
      // Fetch user bookings from central server
      const response = await fetch(`${process.env.NEXT_PUBLIC_CENTRAL_SERVER_URL || 'http://localhost:5000'}/api/v1/central-bookings/user/${userProfile.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const bookings = data.data || []
        
        // Filter only completed bookings for recent transactions
        const completedBookings = bookings.filter((booking: any) => 
          booking.status === 'completed' || booking.paymentStatus === 'completed'
        )
        
        // Calculate stats
        const totalTrips = bookings.length
        const completedTrips = completedBookings.length
        const totalSpent = completedBookings.reduce((sum: number, booking: any) => sum + (booking.totalAmount || 0), 0)
        
        setStats({
          totalTrips,
          completedTrips,
          totalSpent: parseFloat(totalSpent.toFixed(2))
        })
        
        // Format recent transactions (latest 4)
        const recentTransactions = completedBookings
          .slice(0, 4)
          .map((booking: any) => ({
            id: booking.id,
            type: 'booking',
            status: 'completed',
            amount: booking.totalAmount || 0,
            date: new Date(booking.createdAt).toLocaleDateString(),
            description: `${booking.departureStation?.name || 'Unknown'} to ${booking.destinationStation?.name || 'Unknown'}`,
            paymentRef: booking.paymentReference || booking.id
          }))
        
        setRecentTransactions(recentTransactions)
      } else {
        console.error('Failed to fetch user bookings')
        // Fallback to empty data
        setStats({ totalTrips: 0, completedTrips: 0, totalSpent: 0 })
        setRecentTransactions([])
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      // Fallback to empty data
      setStats({ totalTrips: 0, completedTrips: 0, totalSpent: 0 })
      setRecentTransactions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userProfile) {
      fetchUserData()
    }
  }, [userProfile])

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative bg-black">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black/80 to-blue-950/20" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px'
        }} />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="bg-black/80 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Home className="h-8 w-8 text-blue-400 mr-3" />
                <h1 className="text-2xl font-bold text-white">
                  Louaj <span className="text-blue-400">Dashboard</span>
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-400">
                  {userProfile.firstName} {userProfile.lastName}
                </span>
                <span className="text-sm text-blue-400">
                  {userProfile.role}
                </span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-bold text-white mb-2">
                    Welcome back, {userProfile.firstName}! 👋
                  </h2>
                  <p className="text-gray-400 text-lg">Ready for your next journey?</p>
                </div>
                <div className="hidden md:flex items-center space-x-2">
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    <Star className="w-3 h-3 mr-1" />
                    Premium User
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Book New Trip */}
              <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 cursor-pointer group"
                    onClick={() => router.push('/user/book-trip')}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/30 transition-colors">
                    <Plus className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Book New Trip</h3>
                  <p className="text-gray-400 text-sm">Find and book your next journey</p>
                  <ArrowRight className="w-4 h-4 text-blue-400 mx-auto mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardContent>
              </Card>

              {/* View Routes */}
              <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/30 hover:border-green-400/50 transition-all duration-300 hover:scale-105 cursor-pointer group"
                    onClick={() => router.push('/')}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500/30 transition-colors">
                    <Route className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">View Routes</h3>
                  <p className="text-gray-400 text-sm">Explore available destinations</p>
                  <ArrowRight className="w-4 h-4 text-green-400 mx-auto mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardContent>
              </Card>

              {/* Booking History */}
              <Card className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 hover:scale-105 cursor-pointer group"
                    onClick={() => router.push('/user/booking-history')}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-500/30 transition-colors">
                    <History className="w-6 h-6 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Booking History</h3>
                  <p className="text-gray-400 text-sm">View all your past trips</p>
                  <ArrowRight className="w-4 h-4 text-orange-400 mx-auto mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardContent>
              </Card>

              {/* Profile Management */}
              <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 cursor-pointer group"
                    onClick={() => router.push('/user/profile')}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/30 transition-colors">
                    <User className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Profile</h3>
                  <p className="text-gray-400 text-sm">Manage your account</p>
                  <ArrowRight className="w-4 h-4 text-purple-400 mx-auto mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardContent>
              </Card>
            </div>

            {/* Stats and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Stats Cards */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                          <Car className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Total Trips</p>
                          <p className="text-2xl font-bold text-white">{loading ? '...' : stats.totalTrips}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Completed</p>
                          <p className="text-2xl font-bold text-white">{loading ? '...' : stats.completedTrips}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                          <TrendingUp className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Total Spent</p>
                          <p className="text-2xl font-bold text-white">{loading ? '...' : `${stats.totalSpent} DT`}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Recent Transactions */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center">
                      <CreditCard className="w-5 h-5 text-green-400 mr-2" />
                      Recent Transactions
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => router.push('/user/booking-history')}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                    >
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                      </div>
                    ) : recentTransactions.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        No completed transactions yet
                      </div>
                    ) : (
                      recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center space-x-3">
                                                     <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                             transaction.status === 'completed' ? 'bg-green-500/20' : 'bg-red-500/20'
                           }`}>
                             {transaction.status === 'completed' ? (
                               <CheckCircle className="w-4 h-4 text-green-400" />
                             ) : (
                               <AlertCircle className="w-4 h-4 text-red-400" />
                             )}
                           </div>
                          <div>
                            <p className="text-white text-sm font-medium">{transaction.description}</p>
                            <p className="text-gray-400 text-xs">{transaction.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${
                            transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)} DT
                          </p>
                          <p className="text-gray-400 text-xs">{transaction.paymentRef}</p>
                        </div>
                      </div>
                    )))}
                  </div>
                </CardContent>
              </Card>
            </div>


          </div>
        </main>
      </div>
    </div>
  )
}