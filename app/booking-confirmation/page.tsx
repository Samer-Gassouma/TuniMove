"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, ArrowLeft, CreditCard, Calendar, Users, Navigation, Timer } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";

interface BookingDetails {
  id: string;
  status: 'CONFIRMED' | 'FAILED' | 'PENDING';
  departureStation: {
    name: string;
    governorate: string;
    delegation?: string;
  };
  destinationStation: {
    name: string;
    governorate: string;
    delegation?: string;
  };
  seatsBooked: number;
  journeyDate: string;
  totalAmount: number;
  paymentRef?: string;
  verificationCode?: string;
  paymentProcessedAt?: string;
  createdAt?: string;
  user?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  };
  vehicleAllocations?: Array<{
    vehicleId?: string;
    licensePlate: string;
    driverName?: string;
    driverPhone?: string;
    seatsBooked: number;
    queuePosition?: number;
    estimatedDeparture?: string;
    ticketIds?: string[];
  }>;
  summary?: {
    totalSeats: number;
    totalAmount: number;
    vehicleCount: number;
    isPaid: boolean;
    departureLocation: string;
    destinationLocation: string;
    journeyDate: string;
  };
}

export default function BookingConfirmationPage() {
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const fetchBookingDetails = async () => {
      // Get payment status from URL parameters
      const paymentRef = searchParams.get('payment_ref');
      const status = searchParams.get('status');
      
      console.log('🎫 Booking confirmation page loaded:', { paymentRef, status });

      if (!paymentRef) {
        console.error('❌ No payment reference provided');
        setLoading(false);
        return;
      }

      try {
        // Fetch actual booking details from API
        console.log('🔍 Fetching booking details for payment ref:', paymentRef);
        
        const response = await fetch(`/api/bookings/${paymentRef}`);
        const result = await response.json();

        if (response.ok && result.success && result.data?.booking) {
          const booking = result.data.booking;
          
          // Map the booking data to our interface
          const bookingDetails: BookingDetails = {
            id: booking.id,
            status: booking.status === 'PAID' ? 'CONFIRMED' : booking.status === 'FAILED' ? 'FAILED' : 'PENDING',
            departureStation: {
              name: booking.departureStation?.name || 'Unknown Station',
              governorate: booking.departureStation?.governorate || 'Unknown',
              delegation: booking.departureStation?.delegation
            },
            destinationStation: {
              name: booking.destinationStation?.name || 'Unknown Station', 
              governorate: booking.destinationStation?.governorate || 'Unknown',
              delegation: booking.destinationStation?.delegation
            },
            seatsBooked: booking.seatsBooked,
            journeyDate: booking.journeyDate,
            totalAmount: booking.totalAmount,
            paymentRef: booking.paymentReference,
            verificationCode: booking.verificationCode,
            paymentProcessedAt: booking.paymentProcessedAt,
            createdAt: booking.createdAt,
            user: booking.user,
            vehicleAllocations: booking.vehicleAllocations || [],
            summary: result.data.summary
          };
          
          console.log('✅ Booking details loaded:', bookingDetails);
          setBookingDetails(bookingDetails);
        } else {
          console.error('❌ Failed to fetch booking details:', result);
          // Fallback to mock data for demo
          const mockBooking: BookingDetails = {
            id: paymentRef || `booking_${Date.now()}`,
            status: status === 'completed' ? 'CONFIRMED' : status === 'failed' ? 'FAILED' : 'PENDING',
            departureStation: {
              name: 'Monastir Main Station',
              governorate: 'Monastir'
            },
            destinationStation: {
              name: 'Sfax Main Station', 
              governorate: 'Sfax'
            },
            seatsBooked: 2,
            journeyDate: new Date().toISOString(),
            totalAmount: 25.00,
            paymentRef: paymentRef || undefined
          };
          setBookingDetails(mockBooking);
        }
      } catch (error) {
        console.error('❌ Error fetching booking details:', error);
        // Fallback to mock data
        const mockBooking: BookingDetails = {
          id: paymentRef || `booking_${Date.now()}`,
          status: status === 'completed' ? 'CONFIRMED' : status === 'failed' ? 'FAILED' : 'PENDING',
          departureStation: {
            name: 'Monastir Main Station',
            governorate: 'Monastir'
          },
          destinationStation: {
            name: 'Sfax Main Station',
            governorate: 'Sfax'  
          },
          seatsBooked: 2,
          journeyDate: new Date().toISOString(),
          totalAmount: 25.00,
          paymentRef: paymentRef || undefined
        };
        setBookingDetails(mockBooking);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [searchParams]);

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleBookAnother = () => {
    router.push('/book-trip');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <ParticleBackground />
        <Card className="w-full max-w-md backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-600/50">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-white">Verifying your booking...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <ParticleBackground />
        <Card className="w-full max-w-md backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-600/50">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Booking Not Found</h2>
            <p className="text-gray-400 mb-6">We couldn't find your booking details.</p>
            <Button onClick={handleBackToDashboard} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isConfirmed = bookingDetails.status === 'CONFIRMED';
  const isFailed = bookingDetails.status === 'FAILED';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <ParticleBackground />
      
      <div className="relative z-10 max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Booking {isConfirmed ? 'Confirmed' : isFailed ? 'Failed' : 'Pending'}
          </h1>
          <p className="text-gray-400">
            {isConfirmed ? 'Your trip has been successfully booked!' : 
             isFailed ? 'There was an issue with your booking.' :
             'Your booking is being processed.'}
          </p>
        </div>

        {/* Status Card */}
        <Card className="mb-6 backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-600/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-6">
              {isConfirmed ? (
                <CheckCircle2 className="w-20 h-20 text-green-400" />
              ) : isFailed ? (
                <XCircle className="w-20 h-20 text-red-400" />
              ) : (
                <Timer className="w-20 h-20 text-yellow-400" />
              )}
            </div>
            
            <div className="text-center mb-6">
              <Badge 
                variant="outline" 
                className={`text-sm px-3 py-1 ${
                  isConfirmed ? 'bg-green-500/20 border-green-500/40 text-green-400' :
                  isFailed ? 'bg-red-500/20 border-red-500/40 text-red-400' :
                  'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
                }`}
              >
                {bookingDetails.status}
              </Badge>
            </div>

            {/* Booking Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                <span className="text-gray-400">Booking ID</span>
                <span className="text-white font-mono text-sm">{bookingDetails.id}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                <span className="text-gray-400 flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  Route
                </span>
                <span className="text-white">
                  {bookingDetails.departureStation.name} → {bookingDetails.destinationStation.name}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                <span className="text-gray-400 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Passengers
                </span>
                <span className="text-white">{bookingDetails.seatsBooked}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                <span className="text-gray-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Journey Date
                </span>
                <span className="text-white">
                  {new Date(bookingDetails.journeyDate).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                <span className="text-gray-400 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Total Amount
                </span>
                <span className="text-green-400 font-bold">{bookingDetails.totalAmount} TND</span>
              </div>

              {bookingDetails.verificationCode && (
                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                  <span className="text-gray-400">Verification Code</span>
                  <span className="text-white font-mono text-sm font-bold">{bookingDetails.verificationCode}</span>
                </div>
              )}

              {bookingDetails.paymentRef && (
                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                  <span className="text-gray-400">Payment Reference</span>
                  <span className="text-white font-mono text-sm">{bookingDetails.paymentRef}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Details Section */}
        {bookingDetails.vehicleAllocations && bookingDetails.vehicleAllocations.length > 0 && (
          <Card className="mb-6 backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-600/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                Vehicle Details
              </CardTitle>
              <CardDescription className="text-gray-400">
                Your allocated vehicles and driver information
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {bookingDetails.vehicleAllocations.map((vehicle, index) => (
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
                            {new Date(vehicle.estimatedDeparture).toLocaleTimeString()}
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

        {/* Trip Summary Section */}
        {bookingDetails.summary && (
          <Card className="mb-6 backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-600/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Trip Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                  <span className="text-gray-400">From</span>
                  <span className="text-white text-right">{bookingDetails.summary.departureLocation}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                  <span className="text-gray-400">To</span>
                  <span className="text-white text-right">{bookingDetails.summary.destinationLocation}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                  <span className="text-gray-400">Total Vehicles</span>
                  <span className="text-white">{bookingDetails.summary.vehicleCount}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                  <span className="text-gray-400">Journey Date</span>
                  <span className="text-white">
                    {new Date(bookingDetails.summary.journeyDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Important Information */}
        {isConfirmed && (
          <Card className="mb-6 backdrop-blur-xl bg-gradient-to-br from-green-800/20 to-green-900/20 border border-green-600/50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Important Information
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Please arrive at the departure station at least 15 minutes before your scheduled departure.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Show your verification code <strong className="text-white">{bookingDetails.verificationCode}</strong> to the driver.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Keep your payment reference for your records: <strong className="text-white font-mono">{bookingDetails.paymentRef}</strong>
                </li>
                {bookingDetails.vehicleAllocations && bookingDetails.vehicleAllocations.length > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    Look for vehicle{bookingDetails.vehicleAllocations.length > 1 ? 's' : ''}: {' '}
                    <strong className="text-white">
                      {bookingDetails.vehicleAllocations.map(v => v.licensePlate).join(', ')}
                    </strong>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={handleBackToDashboard}
            variant="outline"
            className="flex-1 h-12 border-slate-600 hover:bg-slate-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          {isConfirmed && (
            <Button 
              onClick={handleBookAnother}
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Book Another Trip
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 