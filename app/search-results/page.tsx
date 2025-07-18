"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Clock, Users, Star, CreditCard, CheckCircle } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import { useRouter } from "next/navigation";

interface Trip {
  id: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  availableSeats: number;
  totalSeats: number;
  rating: number;
  operator: string;
  amenities: string[];
}

// Mock trip data
const MOCK_TRIPS: Trip[] = [
  {
    id: '1',
    from: 'Tunis Central Station',
    to: 'Sfax Main Terminal',
    departureTime: '09:00',
    arrivalTime: '12:30',
    duration: '3h 30m',
    price: 15.50,
    currency: 'TND',
    availableSeats: 12,
    totalSeats: 45,
    rating: 4.8,
    operator: 'TuniExpress',
    amenities: ['WiFi', 'AC', 'Snacks', 'USB Charging']
  },
  {
    id: '2',
    from: 'Tunis Central Station',
    to: 'Sfax Main Terminal',
    departureTime: '14:15',
    arrivalTime: '17:45',
    duration: '3h 30m',
    price: 18.00,
    currency: 'TND',
    availableSeats: 8,
    totalSeats: 45,
    rating: 4.9,
    operator: 'ComfortLine',
    amenities: ['WiFi', 'AC', 'Meals', 'USB Charging', 'Entertainment']
  },
  {
    id: '3',
    from: 'Tunis Central Station',
    to: 'Sfax Main Terminal',
    departureTime: '19:30',
    arrivalTime: '23:00',
    duration: '3h 30m',
    price: 12.75,
    currency: 'TND',
    availableSeats: 25,
    totalSeats: 45,
    rating: 4.6,
    operator: 'EcoTravel',
    amenities: ['WiFi', 'AC', 'USB Charging']
  }
];

export default function SearchResultsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTrips(MOCK_TRIPS);
      setIsLoading(false);
    }, 1500);
  }, []);

  const handleBookTrip = (tripId: string) => {
    setSelectedTrip(tripId);
    // Here you would typically navigate to booking confirmation or payment
    console.log('Booking trip:', tripId);
  };

  const getAvailabilityColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return 'text-green-400';
    if (percentage > 20) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Searching for the best trips...</p>
        </div>
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
            <div className="flex items-center gap-3 sm:gap-4 py-4 sm:py-6">
              <Button
                onClick={() => router.push('/book-trip')}
                variant="outline"
                size="sm"
                className="border-slate-600 text-gray-300 hover:bg-slate-800 hover:text-white p-2"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-white">Available Trips</h1>
                <p className="text-gray-400 text-sm sm:text-base">Found {trips.length} trips for your journey</p>
              </div>
            </div>
          </div>
        </header>

        {/* Search Summary */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Card className="backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-600/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-medium">Tunis Central</span>
                  </div>
                  <div className="text-gray-400">→</div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    <span className="text-white font-medium">Sfax Main</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Today</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>1 Passenger</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trip Results */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-8">
          <div className="space-y-4 sm:space-y-6">
            {trips.map((trip) => (
              <Card 
                key={trip.id} 
                className="backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-600/50 hover:border-blue-500/50 transition-all duration-300"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center">
                    
                    {/* Trip Info */}
                    <div className="lg:col-span-8">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        
                        {/* Departure */}
                        <div>
                          <div className="text-2xl sm:text-3xl font-bold text-white">{trip.departureTime}</div>
                          <div className="text-gray-400 text-sm">{trip.from}</div>
                        </div>

                        {/* Journey Details */}
                        <div className="text-center">
                          <div className="text-gray-400 text-sm mb-1">{trip.duration}</div>
                          <div className="flex items-center justify-center">
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                          </div>
                          <div className="text-blue-400 text-sm font-medium mt-1">{trip.operator}</div>
                        </div>

                        {/* Arrival */}
                        <div className="text-right sm:text-left lg:text-right">
                          <div className="text-2xl sm:text-3xl font-bold text-white">{trip.arrivalTime}</div>
                          <div className="text-gray-400 text-sm">{trip.to}</div>
                        </div>
                      </div>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {trip.amenities.map((amenity, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="bg-slate-700/50 text-gray-300 border-slate-600/50 text-xs"
                          >
                            {amenity}
                          </Badge>
                        ))}
                      </div>

                      {/* Rating and Availability */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-white font-medium">{trip.rating}</span>
                          </div>
                          <div className={`flex items-center gap-1 ${getAvailabilityColor(trip.availableSeats, trip.totalSeats)}`}>
                            <Users className="w-4 h-4" />
                            <span className="text-sm font-medium">{trip.availableSeats} seats left</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price and Booking */}
                    <div className="lg:col-span-4 flex flex-col items-center lg:items-end gap-3">
                      <div className="text-center lg:text-right">
                        <div className="text-3xl font-bold text-white">
                          {trip.price} <span className="text-lg text-gray-400">{trip.currency}</span>
                        </div>
                        <div className="text-gray-400 text-sm">per person</div>
                      </div>

                      <Button
                        onClick={() => handleBookTrip(trip.id)}
                        disabled={trip.availableSeats === 0}
                        className="w-full lg:w-auto bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transform hover:scale-105 transition-all duration-300"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        {trip.availableSeats === 0 ? 'Sold Out' : 'Book Now'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No results message */}
          {trips.length === 0 && !isLoading && (
            <Card className="backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-600/50">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">No trips found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your search criteria or date</p>
                <Button 
                  onClick={() => router.push('/book-trip')}
                  variant="outline"
                  className="border-slate-600 text-gray-300 hover:bg-slate-800 hover:text-white"
                >
                  Modify Search
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
} 