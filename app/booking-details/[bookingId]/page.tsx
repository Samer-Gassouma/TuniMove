"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  CreditCard, 
  Calendar, 
  Users, 
  Navigation, 
  Timer, 
  Phone, 
  User, 
  MapPin,
  Clock,
  Ticket,
  AlertTriangle,
  Copy,
  Share2
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

interface BookingDetailsResponse {
  booking: {
    id: string;
    verificationCode: string;
    status: string;
    totalAmount: string;
    seatsBooked: number;
    journeyDate: string;
    paymentReference: string;
    paymentProcessedAt: string;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      phoneNumber: string;
      firstName: string;
      lastName: string;
    };
    departureStation: {
      id: string;
      name: string;
      governorate: {
        id: string;
        name: string;
        nameAr: string;
        createdAt: string;
      };
      delegation: {
        id: string;
        name: string;
        nameAr: string;
        governorateId: string;
        createdAt: string;
      };
      localServerIp?: string;
    };
    destinationStation: {
      id: string;
      name: string;
      governorate: {
        id: string;
        name: string;
        nameAr: string;
        createdAt: string;
      };
      delegation: {
        id: string;
        name: string;
        nameAr: string;
        governorateId: string;
        createdAt: string;
      };
    };
    vehicleAllocations: Array<{
      vehicleId?: string;
      licensePlate: string;
      driverName?: string;
      driverPhone?: string;
      seatsBooked: number;
      queuePosition?: number;
      estimatedDeparture?: string;
      ticketIds?: string[];
    }>;
  };
  payment: {
    status: string;
    amount: number;
    currency: string;
  };
  summary: {
    totalSeats: number;
    totalAmount: string;
    vehicleCount: number;
    isPaid: boolean;
    departureLocation: string;
    destinationLocation: string;
    journeyDate: string;
  };
}

interface StationCoordinates {
  [stationId: string]: {
    latitude: number;
    longitude: number;
  };
}

export default function BookingDetailsPage() {
  const [bookingDetails, setBookingDetails] = useState<BookingDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [stationCoordinates, setStationCoordinates] = useState<StationCoordinates>({});
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;

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

  const getStationCoordinates = (stationId: string) => {
    const coords = stationCoordinates[stationId];
    return coords || {
      latitude: 35.8256, // Fallback coordinates (center of Tunisia)
      longitude: 10.6340
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!bookingId) {
        setError('No booking ID provided');
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Fetching booking details for ID:', bookingId);
        
        // Fetch both booking details and station coordinates in parallel
        const [bookingResponse] = await Promise.all([
          fetch(`/api/bookings/details/${bookingId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }),
          fetchStationCoordinates()
        ]);

        const result = await bookingResponse.json();

        if (bookingResponse.ok && result.success && result.data) {
          console.log('✅ Booking details loaded successfully:', result.data);
          setBookingDetails(result.data);
        } else {
          console.error('❌ Failed to fetch booking details:', result);
          setError(result.error || result.message || 'Failed to fetch booking details');
        }
      } catch (error) {
        console.error('❌ Error fetching booking details:', error);
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingId]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatAmount = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numAmount.toFixed(2);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
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
    switch (status.toUpperCase()) {
      case 'PAID':
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'PENDING':
        return <Timer className="w-4 h-4" />;
      case 'FAILED':
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Timer className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <ParticleBackground />
        <Card className="w-full max-w-md backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-600/50">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-white">Loading booking details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !bookingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <ParticleBackground />
        <Card className="w-full max-w-md backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-600/50">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Booking Not Found</h2>
            <p className="text-gray-400 mb-6">
              {error || "We couldn't find the booking details you're looking for."}
            </p>
            <div className="space-y-3">
              <Button onClick={() => router.back()} className="w-full" variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button onClick={() => router.push('/booking-history')} className="w-full">
                View All Bookings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const booking = bookingDetails.booking;
  const payment = bookingDetails.payment;
  const summary = bookingDetails.summary;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <ParticleBackground />
      
      <div className="relative z-10 max-w-4xl mx-auto pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="sm"
              className="border-slate-600 hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Ticket className="w-8 h-8 text-blue-400" />
                Booking Details
              </h1>
              <p className="text-gray-400">Complete information about your trip</p>
            </div>
          </div>
          
          <Button
            onClick={() => copyToClipboard(booking.id, 'booking-id')}
            variant="outline"
            size="sm"
            className="border-slate-600 hover:bg-slate-700"
          >
            {copied === 'booking-id' ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-400" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </>
            )}
          </Button>
        </div>

        {/* Main Booking Card */}
        <Card className={`mb-6 backdrop-blur-xl border ${
          booking.status === 'PAID' || booking.status === 'COMPLETED'
            ? 'bg-gradient-to-br from-green-800/20 to-green-900/20 border-green-600/50'
            : booking.status === 'FAILED' || booking.status === 'CANCELLED'
            ? 'bg-gradient-to-br from-red-800/20 to-red-900/20 border-red-600/50'
            : 'bg-gradient-to-br from-yellow-800/20 to-yellow-900/20 border-yellow-600/50'
        }`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className={`flex items-center gap-2 ${
                  booking.status === 'PAID' || booking.status === 'COMPLETED'
                    ? 'text-green-400'
                    : booking.status === 'FAILED' || booking.status === 'CANCELLED'
                    ? 'text-red-400'
                    : 'text-yellow-400'
                }`}>
                  {getStatusIcon(booking.status)}
                  Booking {booking.status}
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Booking ID: <span className="font-mono text-white">{booking.id}</span>
                </CardDescription>
              </div>
              <Badge className={`${getStatusColor(booking.status)} text-sm px-3 py-1`}>
                {booking.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Trip Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Navigation className="w-5 h-5" />
                  Trip Details
                </h3>
                
                <div className="space-y-3">
                  <div className="p-3 bg-black/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-400 text-sm">From</span>
                    </div>
                    <p className="text-white font-medium">{booking.departureStation.name}</p>
                    <p className="text-gray-300 text-sm">
                      {booking.departureStation.delegation.name}, {booking.departureStation.governorate.name}
                    </p>
                  </div>

                  <div className="p-3 bg-black/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-red-400" />
                      <span className="text-gray-400 text-sm">To</span>
                    </div>
                    <p className="text-white font-medium">{booking.destinationStation.name}</p>
                    <p className="text-gray-300 text-sm">
                      {booking.destinationStation.delegation.name}, {booking.destinationStation.governorate.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-black/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-400 text-sm">Passengers</span>
                      </div>
                      <p className="text-white font-bold">{booking.seatsBooked}</p>
                    </div>

                    <div className="p-3 bg-black/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-yellow-400" />
                        <span className="text-gray-400 text-sm">Journey</span>
                      </div>
                      <p className="text-white font-bold text-sm">
                        {formatDate(booking.journeyDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Passenger & Payment Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Passenger & Payment
                </h3>
                
                <div className="space-y-3">
                  <div className="p-3 bg-black/20 rounded-lg">
                    <span className="text-gray-400 text-sm">Passenger Name</span>
                    <p className="text-white font-medium">
                      {booking.user.firstName} {booking.user.lastName}
                    </p>
                  </div>

                  <div className="p-3 bg-black/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Phone className="w-4 h-4 text-green-400" />
                      <span className="text-gray-400 text-sm">Phone Number</span>
                    </div>
                    <p className="text-white font-mono">{booking.user.phoneNumber}</p>
                  </div>

                  <div className={`p-3 rounded-lg border ${
                    booking.status === 'PAID' || booking.status === 'COMPLETED'
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-gray-500/10 border-gray-500/30'
                  }`}>
                    <span className="text-gray-400 text-sm">Total Amount</span>
                    <p className={`font-bold text-2xl ${
                      booking.status === 'PAID' || booking.status === 'COMPLETED'
                        ? 'text-green-400'
                        : 'text-gray-400'
                    }`}>
                      {formatAmount(booking.totalAmount)} {payment.currency}
                    </p>
                  </div>

                  {booking.paymentProcessedAt && (
                    <div className="p-3 bg-black/20 rounded-lg">
                      <span className="text-gray-400 text-sm">Payment Processed</span>
                      <p className="text-white text-sm">
                        {formatDate(booking.paymentProcessedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Route Visualization */}
        <Card className="mb-6 backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-600/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Route Map
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your journey from {booking.departureStation.name} to {booking.destinationStation.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 rounded-lg overflow-hidden">
              <StationMap
                stations={[
                  {
                    id: booking.departureStation.id,
                    name: booking.departureStation.name,
                    governorate: booking.departureStation.governorate.name,
                    delegation: booking.departureStation.delegation.name,
                    latitude: getStationCoordinates(booking.departureStation.id).latitude,
                    longitude: getStationCoordinates(booking.departureStation.id).longitude,
                    isOnline: true
                  }
                ]}
                destinations={[
                  {
                    destinationId: booking.destinationStation.id,
                    destinationName: booking.destinationStation.name,
                    governorate: booking.destinationStation.governorate.name,
                    delegation: booking.destinationStation.delegation.name,
                    totalVehicles: 1,
                    availableSeats: booking.seatsBooked,
                    estimatedDeparture: booking.journeyDate,
                    basePrice: parseFloat(booking.totalAmount),
                    vehicles: [],
                    latitude: getStationCoordinates(booking.destinationStation.id).latitude,
                    longitude: getStationCoordinates(booking.destinationStation.id).longitude
                  }
                ]}
                selectedDeparture={{
                  id: booking.departureStation.id,
                  name: booking.departureStation.name,
                  governorate: booking.departureStation.governorate.name,
                  delegation: booking.departureStation.delegation.name,
                  latitude: getStationCoordinates(booking.departureStation.id).latitude,
                  longitude: getStationCoordinates(booking.departureStation.id).longitude,
                  isOnline: true
                }}
                selectedDestination={{
                  destinationId: booking.destinationStation.id,
                  destinationName: booking.destinationStation.name,
                  governorate: booking.destinationStation.governorate.name,
                  delegation: booking.destinationStation.delegation.name,
                  totalVehicles: 1,
                  availableSeats: booking.seatsBooked,
                  estimatedDeparture: booking.journeyDate,
                  basePrice: parseFloat(booking.totalAmount),
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
          </CardContent>
        </Card>

        {/* Verification Code Card */}
        {booking.verificationCode && (
          <Card className="mb-6 backdrop-blur-xl bg-gradient-to-br from-blue-800/20 to-blue-900/20 border border-blue-600/50">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-blue-400 mb-2">Verification Code</h3>
                <p className="text-gray-400 mb-4">Show this code to the driver when boarding</p>
                <div className="bg-black/30 rounded-lg p-4 border border-blue-500/30 relative">
                  <span className="text-4xl font-mono font-bold text-white tracking-wider">
                    {booking.verificationCode}
                  </span>
                  <Button
                    onClick={() => copyToClipboard(booking.verificationCode, 'verification-code')}
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-blue-400 hover:text-blue-300"
                  >
                    {copied === 'verification-code' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vehicle Information */}
        {booking.vehicleAllocations && booking.vehicleAllocations.length > 0 && (
          <Card className="mb-6 backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-600/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                Vehicle Information
              </CardTitle>
              <CardDescription className="text-gray-400">
                Your allocated vehicles and driver details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {booking.vehicleAllocations.map((vehicle, index) => (
                  <div key={index} className="p-4 bg-black/20 rounded-lg border border-slate-600/30">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-white">Vehicle {index + 1}</h4>
                      <Badge variant="outline" className="bg-blue-500/20 border-blue-500/40 text-blue-400">
                        {vehicle.seatsBooked} seat{vehicle.seatsBooked > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">License Plate</span>
                        <span className="text-white font-mono font-bold">{vehicle.licensePlate}</span>
                      </div>
                      
                      {vehicle.driverName && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Driver</span>
                          <span className="text-white">{vehicle.driverName}</span>
                        </div>
                      )}
                      
                      {vehicle.driverPhone && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Driver Phone</span>
                          <span className="text-white font-mono">{vehicle.driverPhone}</span>
                        </div>
                      )}
                      
                      {vehicle.queuePosition && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Queue Position</span>
                          <span className="text-white">#{vehicle.queuePosition}</span>
                        </div>
                      )}
                      
                      {vehicle.estimatedDeparture && (
                        <div className="flex items-center justify-between sm:col-span-2">
                          <span className="text-gray-400 flex items-center gap-2">
                            <Timer className="w-4 h-4" />
                            Estimated Departure
                          </span>
                          <span className="text-white">
                            {formatDate(vehicle.estimatedDeparture)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {vehicle.ticketIds && vehicle.ticketIds.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-600/30">
                        <span className="text-gray-400 text-sm">Ticket IDs:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {vehicle.ticketIds.map((ticketId, ticketIndex) => (
                            <span key={ticketIndex} className="text-xs font-mono bg-slate-700/50 px-2 py-1 rounded text-gray-300">
                              {ticketId}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking Timeline */}
        <Card className="mb-6 backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-600/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Booking Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-black/20 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <div className="flex-1">
                  <p className="text-white font-medium">Booking Created</p>
                  <p className="text-gray-400 text-sm">{formatDate(booking.createdAt)}</p>
                </div>
              </div>
              
              {booking.paymentProcessedAt && (
                <div className="flex items-center gap-4 p-3 bg-black/20 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Payment Processed</p>
                    <p className="text-gray-400 text-sm">{formatDate(booking.paymentProcessedAt)}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-4 p-3 bg-black/20 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="flex-1">
                  <p className="text-white font-medium">Journey Date</p>
                  <p className="text-gray-400 text-sm">{formatDate(booking.journeyDate)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        {(booking.status === 'PAID' || booking.status === 'COMPLETED') && (
          <Card className="mb-6 backdrop-blur-xl bg-gradient-to-br from-yellow-800/20 to-yellow-900/20 border border-yellow-600/50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Important Information
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  Please arrive at the departure station at least 15 minutes before your scheduled departure.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  Show your verification code <strong className="text-white font-mono">{booking.verificationCode}</strong> to the driver.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  Keep your payment reference for your records: <strong className="text-white font-mono">{booking.paymentReference}</strong>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  Contact customer service if you need any assistance with your booking.
                </li>
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => router.push('/booking-history')}
            variant="outline"
            className="flex-1 h-12 border-slate-600 hover:bg-slate-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
          </Button>
          
          <Button 
            onClick={() => router.push('/book-trip')}
            className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Book Another Trip
          </Button>
        </div>
      </div>
    </div>
  );
}
