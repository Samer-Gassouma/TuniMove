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
  departureStation: string;
  destinationStation: string;
  seatsBooked: number;
  journeyDate: string;
  totalAmount: number;
  paymentRef?: string;
  verificationCode?: string;
  paymentProcessedAt?: string;
  createdAt?: string;
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
            departureStation: booking.departureStation?.name || 'Unknown Station',
            destinationStation: booking.destinationStation?.name || 'Unknown Station',
            seatsBooked: booking.seatsBooked,
            journeyDate: booking.journeyDate,
            totalAmount: booking.totalAmount,
            paymentRef: booking.paymentReference,
            verificationCode: booking.verificationCode,
            paymentProcessedAt: booking.paymentProcessedAt,
            createdAt: booking.createdAt
          };
          
          console.log('✅ Booking details loaded:', bookingDetails);
          setBookingDetails(bookingDetails);
        } else {
          console.error('❌ Failed to fetch booking details:', result);
          // Fallback to mock data for demo
          const mockBooking: BookingDetails = {
            id: paymentRef || `booking_${Date.now()}`,
            status: status === 'completed' ? 'CONFIRMED' : status === 'failed' ? 'FAILED' : 'PENDING',
            departureStation: 'Monastir Main Station',
            destinationStation: 'Sfax Main Station',
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
          departureStation: 'Monastir Main Station',
          destinationStation: 'Sfax Main Station',
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
                  {bookingDetails.departureStation} → {bookingDetails.destinationStation}
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