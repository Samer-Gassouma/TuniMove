"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  Navigation, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Clock3, 
  MapPin,
  Ticket,
  History,
  RefreshCw
} from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import { apiClient } from "@/lib/api";
import dynamic from "next/dynamic";

const StationMap = dynamic(() => import("@/components/map/StationMap"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-black/20 rounded-lg flex items-center justify-center">
      <div className="text-gray-400">Loading map...</div>
    </div>
  )
});

interface Station {
  id: string;
  name: string;
  governorate: string;
  delegation: string;
  latitude?: number;
  longitude?: number;
}

interface StationCoordinates {
  [stationId: string]: {
    latitude: number;
    longitude: number;
  };
}

interface Booking {
  id: string;
  verificationCode: string;
  status: 'PAID' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  seatsBooked: number;
  totalAmount: number;
  journeyDate: string;
  paymentReference?: string;
  paymentProcessedAt?: string;
  createdAt: string;
  departureStation: Station;
  destinationStation: Station;
}

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stationCoordinates, setStationCoordinates] = useState<StationCoordinates>({});
  const router = useRouter();

  const fetchStationCoordinates = async () => {
    try {
      console.log('🗺️ Fetching station coordinates...');
      
      const response = await fetch('http://localhost:5000/api/v1/stations');
      
      if (!response.ok) {
        throw new Error('Failed to fetch stations');
      }
      
      const result = await response.json();
      
      if (result.success && result.data?.stations) {
        const coordinates: StationCoordinates = {};
        result.data.stations.forEach((station: any) => {
          coordinates[station.id] = {
            latitude: station.latitude,
            longitude: station.longitude
          };
        });
        setStationCoordinates(coordinates);
        console.log('✅ Station coordinates loaded:', Object.keys(coordinates).length, 'stations');
      }
    } catch (error) {
      console.error('❌ Error fetching station coordinates:', error);
      // Fallback to default coordinates if API fails
      console.log('🔄 Using fallback coordinates');
    }
  };

  const fetchBookingHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      console.log('📋 Fetching booking history with API client...');

      const response = await apiClient.getBookingHistory();

      if (response.success && response.data) {
        setBookings(response.data.bookings || []);
        console.log('✅ Booking history loaded:', response.data.bookings?.length || 0, 'bookings');
      } else {
        throw new Error(response.error || 'Failed to fetch booking history');
      }
    } catch (error: any) {
      console.error('❌ Error fetching booking history:', error);
      setError(error.message || 'Failed to load booking history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchBookingHistory(),
        fetchStationCoordinates()
      ]);
    };
    
    loadData();
  }, []);

  const getStationCoordinates = (stationId: string) => {
    const coords = stationCoordinates[stationId];
    return coords || {
      latitude: 35.8256, // Fallback coordinates (center of Tunisia)
      longitude: 10.6340
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-500/20 border-green-500/40 text-green-400';
      case 'COMPLETED':
        return 'bg-blue-500/20 border-blue-500/40 text-blue-400';
      case 'PENDING':
        return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400';
      case 'FAILED':
        return 'bg-red-500/20 border-red-500/40 text-red-400';
      case 'CANCELLED':
        return 'bg-gray-500/20 border-gray-500/40 text-gray-400';
      default:
        return 'bg-gray-500/20 border-gray-500/40 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'PENDING':
        return <Clock3 className="w-4 h-4" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock3 className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <ParticleBackground />
        <Card className="w-full max-w-md backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-600/50">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-white">Loading your booking history...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <ParticleBackground />
      
      <div className="relative z-10 max-w-4xl mx-auto pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              size="sm"
              className="border-slate-600 hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <History className="w-8 h-8 text-blue-400" />
                Booking History
              </h1>
              <p className="text-gray-400">View all your trip bookings • Click on any booking to see details</p>
            </div>
          </div>
          
          <Button
            onClick={fetchBookingHistory}
            variant="outline"
            size="sm"
            className="border-slate-600 hover:bg-slate-700"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6 backdrop-blur-xl bg-gradient-to-br from-red-800/40 to-red-900/40 border border-red-600/50">
            <CardContent className="p-6 text-center">
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Error Loading History</h3>
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={fetchBookingHistory} className="bg-red-600 hover:bg-red-700">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Bookings List */}
        {bookings.length === 0 && !error ? (
          <Card className="backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-600/50">
            <CardContent className="p-8 text-center">
              <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Bookings Yet</h3>
              <p className="text-gray-400 mb-6">You haven't made any trip bookings yet.</p>
              <Button 
                onClick={() => router.push('/book-trip')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Book Your First Trip
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card 
                key={booking.id} 
                className="backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-600/50 hover:border-slate-500/50 transition-all duration-300 cursor-pointer group"
                onClick={() => router.push(`/booking-details/${booking.paymentReference || booking.id}`)}
              >
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg text-white group-hover:text-blue-400 transition-colors">
                          {booking.departureStation.name} → {booking.destinationStation.name}
                        </CardTitle>
                        <Badge variant="outline" className={`${getStatusColor(booking.status)} text-xs`}>
                          {getStatusIcon(booking.status)}
                          <span className="ml-1">{booking.status}</span>
                        </Badge>
                      </div>
                      <CardDescription className="text-gray-400">
                        Booking ID: {booking.id} • Code: {booking.verificationCode}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">{booking.totalAmount} TND</div>
                      <div className="text-sm text-gray-400">{booking.seatsBooked} seat(s)</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Journey Date */}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <div>
                        <div className="text-sm text-gray-400">Journey Date</div>
                        <div className="text-white font-medium">{formatDate(booking.journeyDate)}</div>
                        <div className="text-xs text-gray-500">{formatTime(booking.journeyDate)}</div>
                      </div>
                    </div>

                    {/* Passengers */}
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      <div>
                        <div className="text-sm text-gray-400">Passengers</div>
                        <div className="text-white font-medium">{booking.seatsBooked}</div>
                      </div>
                    </div>

                    {/* Booked Date */}
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-400" />
                      <div>
                        <div className="text-sm text-gray-400">Booked On</div>
                        <div className="text-white font-medium">{formatDate(booking.createdAt)}</div>
                        <div className="text-xs text-gray-500">{formatTime(booking.createdAt)}</div>
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-green-400" />
                      <div>
                        <div className="text-sm text-gray-400">Payment</div>
                        <div className="text-white font-medium">
                          {booking.paymentProcessedAt ? 'Completed' : 'Pending'}
                        </div>
                        {booking.paymentReference && (
                          <div className="text-xs text-gray-500 font-mono">{booking.paymentReference}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Route Details */}
                  <div className="mb-4 p-3 bg-black/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 font-medium">{booking.departureStation.name}</span>
                        <span className="text-gray-400 text-sm">({booking.departureStation.governorate})</span>
                      </div>
                      <Navigation className="w-4 h-4 text-gray-400" />
                      <div className="flex items-center gap-2">
                        <span className="text-purple-400 font-medium">{booking.destinationStation.name}</span>
                        <span className="text-gray-400 text-sm">({booking.destinationStation.governorate})</span>
                        <MapPin className="w-4 h-4 text-purple-400" />
                      </div>
                    </div>
                  </div>

                  {/* Compact Route Map */}
                  <div className="mb-4">
                    <div className="h-32 rounded-lg overflow-hidden border border-slate-600/30">
                      <StationMap
                        stations={[
                          {
                            id: booking.departureStation.id,
                            name: booking.departureStation.name,
                            governorate: booking.departureStation.governorate,
                            delegation: booking.departureStation.delegation || '',
                            latitude: getStationCoordinates(booking.departureStation.id).latitude,
                            longitude: getStationCoordinates(booking.departureStation.id).longitude,
                            isOnline: true
                          }
                        ]}
                        destinations={[
                          {
                            destinationId: booking.destinationStation.id,
                            destinationName: booking.destinationStation.name,
                            governorate: booking.destinationStation.governorate,
                            delegation: booking.destinationStation.delegation || '',
                            totalVehicles: 1,
                            availableSeats: booking.seatsBooked,
                            estimatedDeparture: booking.journeyDate,
                            basePrice: parseFloat(String(booking.totalAmount || '0')),
                            vehicles: [],
                            latitude: getStationCoordinates(booking.destinationStation.id).latitude,
                            longitude: getStationCoordinates(booking.destinationStation.id).longitude
                          }
                        ]}
                        selectedDeparture={{
                          id: booking.departureStation.id,
                          name: booking.departureStation.name,
                          governorate: booking.departureStation.governorate,
                          delegation: booking.departureStation.delegation || '',
                          latitude: getStationCoordinates(booking.departureStation.id).latitude,
                          longitude: getStationCoordinates(booking.departureStation.id).longitude,
                          isOnline: true
                        }}
                        selectedDestination={{
                          destinationId: booking.destinationStation.id,
                          destinationName: booking.destinationStation.name,
                          governorate: booking.destinationStation.governorate,
                          delegation: booking.destinationStation.delegation || '',
                          totalVehicles: 1,
                          availableSeats: booking.seatsBooked,
                          estimatedDeparture: booking.journeyDate,
                          basePrice: parseFloat(String(booking.totalAmount || '0')),
                          vehicles: [],
                          latitude: getStationCoordinates(booking.destinationStation.id).latitude,
                          longitude: getStationCoordinates(booking.destinationStation.id).longitude
                        }}
                        onStationSelect={() => {}} // Disabled in view mode
                        onDestinationSelect={() => {}} // Disabled in view mode
                        showRoute={true}
                        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''}
                      />
                    </div>
                  </div>

                  {/* View Details Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/booking-details/${booking.paymentReference || booking.id}`);
                      }}
                      variant="outline"
                      size="sm"
                      className="border-blue-600 text-blue-400 hover:bg-blue-600/10 group-hover:border-blue-500"
                    >
                      View Details
                      <Navigation className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 