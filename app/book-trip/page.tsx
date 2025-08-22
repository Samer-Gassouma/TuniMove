"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MapPin, Calendar, Clock, Users, Navigation, Loader, CheckCircle2, CreditCard, User, ArrowRight, Car, Timer, AlertCircle, Zap } from "lucide-react";
import { apiClient } from "@/lib/api";
import StationMap from "@/components/map/StationMap";
import stationService from "@/lib/station-service";

// Types based on your API
interface Station {
  id: string;
  stationId?: string;
  name: string;
  stationName?: string;
  nameAr?: string;
  stationNameAr?: string;
  governorate: string | {
    name: string;
    nameAr?: string;
  };
  governorateAr?: string;
  delegation: string | {
    name: string;
    nameAr?: string;
  };
  delegationAr?: string;
  address?: string;
  latitude: number;
  longitude: number;
  isActive?: boolean;
  isOnline: boolean;
  lastHeartbeat?: string | null;
  lastChecked?: string;
  destinationCount?: number;
  localServerIp?: string | null;
  supervisorId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  supervisor?: any;
  _count?: {
    staff: number;
    departureBookings: number;
    destinationBookings: number;
    queueEntries: number;
  };
}

interface RouteDestination {
  destinationId: string;
  destinationName: string;
  destinationNameAr?: string;
  governorate: string;
  delegation: string;
  totalVehicles: number;
  availableSeats: number;
  estimatedDeparture: string;
  basePrice: number;
  vehicles: VehicleInfo[];
}

interface VehicleInfo {
  id?: string;
  queueId?: string;
  vehicleId?: string;
  licensePlate?: string;
  capacity?: number;
  totalSeats?: number;
  availableSeats?: number;
  occupiedSeats?: number;
  queuePosition?: number;
  status?: string;
  pricePerSeat?: number;
  estimatedDeparture?: string;
  driverName?: string;
  driverPhone?: string;
  model?: string;
  vehicleModel?: string;
  color?: string;
  queueType?: string;
  enteredAt?: string;
  isLoading?: boolean;
  isReady?: boolean;
  isPriority?: boolean;
  occupancyRate?: number;
}

interface Booking {
  id: string;
  verificationCode: string;
  totalAmount: number;
  seatsBooked: number;
  status: 'PENDING' | 'PAID' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  journeyDate: string;
  paymentReference?: string;
  paymentProcessedAt?: string;
  createdAt: string;
  departureStation: {
    id: string;
    name: string;
    nameAr?: string;
    governorate: string;
    delegation: string;
  };
  destinationStation: {
    id: string;
    name: string;
    nameAr?: string;
    governorate: string;
    delegation: string;
  };
  vehicles?: VehicleInfo[];
  payment?: {
    paymentUrl: string;
    paymentRef: string;
    amount: number;
    currency: string;
    expiresIn: string;
  };
}

type BookingStep = 'departure' | 'destination' | 'seats' | 'confirm';

export default function StepByStepBooking() {
  const [currentStep, setCurrentStep] = useState<BookingStep>('departure');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Loading states
  const [loadingStations, setLoadingStations] = useState(false);
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [loadingRouteDetails, setLoadingRouteDetails] = useState(false);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);

  // Data states
  const [onlineStations, setOnlineStations] = useState<Station[]>([]);
  const [selectedDeparture, setSelectedDeparture] = useState<Station | null>(null);
  const [availableDestinations, setAvailableDestinations] = useState<RouteDestination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<RouteDestination | null>(null);
  const [routeDetails, setRouteDetails] = useState<RouteDestination | null>(null);
  const [selectedSeats, setSelectedSeats] = useState(1);

  // Error states
  const [error, setError] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    // Load online stations on mount
    loadOnlineStations();
  }, []);

  const loadOnlineStations = async () => {
    setLoadingStations(true);
    setError(null);
    
    try {
      console.log('🔄 Loading stations from API...');
      const response = await stationService.getAllStations();
      
      console.log('📦 Raw API Response:', response);
      
      if (response.success && response.data.stations) {
        const stationsData = stationService.transformStationData(response);
        
        console.log('🏪 Processed stations data:', stationsData);
        console.log('🔍 First station structure:', stationsData[0]);
        
        setOnlineStations(stationsData);
        console.log(`✅ Loaded ${stationsData.length} stations`);
      } else {
        throw new Error(response.message || 'Failed to load stations');
      }
    } catch (err: any) {
      console.error('❌ Error loading stations:', err);
      // Fallback to existing API client if direct service fails
      try {
        console.log('🔄 Trying fallback API...');
        const response = await apiClient.getOnlineStations();
        
        if (response.success && response.data) {
          let stationsData = [];
          
          if (Array.isArray(response.data)) {
            stationsData = response.data;
          } else if ((response.data as any).stations && Array.isArray((response.data as any).stations)) {
            stationsData = (response.data as any).stations;
          } else if (typeof response.data === 'object') {
            stationsData = Object.values(response.data as any).filter((item: any) => 
              typeof item === 'object' && item !== null && 'id' in item && 'name' in item
            );
          }
          
          setOnlineStations(Array.isArray(stationsData) ? stationsData : []);
          console.log(`✅ Loaded ${Array.isArray(stationsData) ? stationsData.length : 0} stations via fallback`);
        } else {
          throw new Error(response.error || 'Failed to load stations');
        }
      } catch (fallbackErr: any) {
        console.error('❌ Fallback API also failed:', fallbackErr);
        setError(fallbackErr.message || 'Failed to load stations');
      }
    } finally {
      setLoadingStations(false);
    }
  };

  const handleDepartureSelect = async (stationId: string) => {
    // Find station using flexible ID matching
    const station = onlineStations.find(s => {
      return (s.id === stationId) || (s.stationId === stationId) || ((s as any)._id === stationId);
    });
    
    if (!station) {
      console.error('Station not found with ID:', stationId);
      console.log('Available stations:', onlineStations.map(s => ({ 
        id: s.id, 
        stationId: s.stationId, 
        name: s.name || s.stationName 
      })));
      return;
    }

    const stationName = station.name || station.stationName || 'Unknown Station';
    console.log('🏪 Selected departure station:', stationName, 'with ID:', stationId);
    setSelectedDeparture(station);
    setSelectedDestination(null);
    setRouteDetails(null);
    setAvailableDestinations([]);
    setLoadingDestinations(true);
    setError(null);

    try {
      console.log(`🔄 Loading destinations for ${stationName}...`);
      // Use the stationId that was clicked (which should be the correct one)
      const response = await apiClient.getStationDestinations(stationId);
      
      if (response.success && response.data) {
        // Handle both array and object responses
        const destinationsData = Array.isArray(response.data) ? response.data : (response.data as any).destinations || [];
        
        // Enrich destinations with coordinates from station data
        const enrichedDestinations = stationService.enrichDestinationsWithCoordinates(destinationsData, onlineStations);
        
        setAvailableDestinations(enrichedDestinations);
        console.log(`✅ Found ${enrichedDestinations.length} destinations from ${stationName}`);
        setCurrentStep('destination');
      } else {
        throw new Error(response.error || 'No destinations available');
      }
    } catch (err: any) {
      console.error('❌ Error loading destinations:', err);
      setError(err.message || 'Failed to load destinations');
    } finally {
      setLoadingDestinations(false);
    }
  };

  const handleDestinationSelect = async (destination: RouteDestination) => {
    setSelectedDestination(destination);
    setRouteDetails(null);
    setLoadingRouteDetails(true);
    setError(null);

    if (!selectedDeparture) return;

    try {
      const stationName = selectedDeparture.name || selectedDeparture.stationName || 'Unknown Station';
      console.log(`🔄 Loading route details from ${stationName} to ${destination.destinationName}...`);
      
      // Get the correct station ID for the API call
      const departureStationId = selectedDeparture.stationId || selectedDeparture.id || '';
      console.log('🚂 Using departure station ID:', departureStationId);
      
      const response = await apiClient.getRouteDetails(departureStationId, destination.destinationId);
      
      if (response.success && response.data) {
        // Handle the actual API response structure
        const routeData = response.data as any; // Type as any to handle API response
        const queueData = routeData.queue || {};
        
        // Create a combined route details object that matches our interface
        const processedRouteDetails: RouteDestination = {
          destinationId: routeData.route?.destinationStation?.id || selectedDestination?.destinationId || '',
          destinationName: routeData.route?.destinationStation?.name || selectedDestination?.destinationName || '',
          destinationNameAr: routeData.route?.destinationStation?.nameAr,
          governorate: routeData.route?.destinationStation?.governorate || selectedDestination?.governorate || '',
          delegation: routeData.route?.destinationStation?.delegation || selectedDestination?.delegation || '',
          totalVehicles: queueData.totalVehicles || 0,
          availableSeats: queueData.totalAvailableSeats || 0,
          estimatedDeparture: queueData.vehicles?.[0]?.estimatedDeparture || 'Soon',
          basePrice: queueData.priceRange?.average || queueData.vehicles?.[0]?.pricePerSeat || 0,
          vehicles: queueData.vehicles || []
        };
        
        setRouteDetails(processedRouteDetails);
        console.log(`✅ Route details loaded: ${processedRouteDetails.availableSeats} seats available`);
        console.log('� Vehicles:', processedRouteDetails.vehicles.length);
        console.log('💰 Price per seat:', processedRouteDetails.basePrice, 'TND');
        setCurrentStep('seats');
      } else {
        throw new Error(response.error || 'Failed to load route details');
      }
    } catch (err: any) {
      console.error('❌ Error loading route details:', err);
      setError(err.message || 'Failed to load route details');
    } finally {
      setLoadingRouteDetails(false);
    }
  };

  const handleSeatsConfirm = () => {
    if (selectedSeats > 0 && routeDetails && selectedSeats <= (routeDetails.availableSeats || 0)) {
      setCurrentStep('confirm');
    } else {
      setError('Please select a valid number of seats');
    }
  };

  const createBooking = async () => {
    if (!selectedDeparture || !selectedDestination || !routeDetails) {
      setError('Missing booking information');
      return;
    }

    if (!isAuthenticated) {
      setError('Please login to book a trip');
      // In a real app, you'd redirect to login
      return;
    }

    setIsCreatingBooking(true);
    setError(null);

    try {
      // Use current time as journey date since we're booking for immediate departure
      const journeyDateTime = new Date();

      console.log('🎫 Creating booking...', {
        departureStationId: selectedDeparture.stationId || selectedDeparture.id,
        destinationStationId: selectedDestination.destinationId,
        seatsBooked: selectedSeats,
        journeyDate: journeyDateTime.toISOString()
      });

      const departureStationId = selectedDeparture.stationId || selectedDeparture.id || '';
      const response = await apiClient.createBooking(
        departureStationId,
        selectedDestination.destinationId,
        selectedSeats,
        journeyDateTime.toISOString()
      );

      const responseData = response.data as any; // Type as any to handle actual API response structure
      
      if (response.success && (responseData?.paymentUrl || responseData?.payment?.paymentUrl)) {
        const paymentUrl = responseData.paymentUrl || responseData.payment?.paymentUrl;
        console.log('✅ Booking created successfully:', responseData.booking?.id || responseData.booking?.bookingId);
        console.log('💳 Redirecting to payment:', paymentUrl);
        
        // Automatically redirect to payment
        window.location.href = paymentUrl;
      } else {
        console.log('📋 Full API Response:', response);
        console.log('📦 Response data:', responseData);
        console.log('💳 Payment data:', responseData?.payment);
        console.log('💳 Payment URL in response:', responseData?.paymentUrl);
        console.log('💳 Payment URL in payment object:', responseData?.payment?.paymentUrl);
        throw new Error(response.error || 'No payment URL received');
      }
    } catch (err: any) {
      console.error('❌ Booking creation failed:', err);
      setError(err.message || 'Failed to create booking');
    } finally {
      setIsCreatingBooking(false);
    }
  };

  const goBack = () => {
    switch (currentStep) {
      case 'destination':
        setCurrentStep('departure');
        setSelectedDestination(null);
        setAvailableDestinations([]);
        break;
      case 'seats':
        setCurrentStep('destination');
        setRouteDetails(null);
        break;
      case 'confirm':
        setCurrentStep('seats');
        break;
      default:
        // Go to dashboard or previous page
        break;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'departure': return 'Select Departure Station';
      case 'destination': return 'Choose Destination';
      case 'seats': return 'Select Seats & Date';
      case 'confirm': return 'Confirm Booking';
      default: return 'Book Trip';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'departure': return 'Choose your starting point from available online stations';
      case 'destination': return `Available destinations from ${selectedDeparture?.name || selectedDeparture?.stationName}`;
      case 'seats': return 'Select number of seats for your journey';
      case 'confirm': return 'Review and confirm your booking details';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/20 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-6">
            <Button
              onClick={currentStep === 'departure' ? undefined : goBack}
              variant="outline"
              size="sm"
              className="border-slate-600 text-gray-300 hover:bg-slate-800 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{getStepTitle()}</h1>
              <p className="text-gray-400">{getStepDescription()}</p>
            </div>

            {/* Step indicator */}
            <div className="hidden sm:flex items-center gap-2">
              {['departure', 'destination', 'seats', 'confirm'].map((step, index) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step
                      ? 'bg-blue-600 text-white'
                      : index < ['departure', 'destination', 'seats', 'confirm'].indexOf(currentStep)
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-700 text-gray-400'
                  }`}
                >
                  {index < ['departure', 'destination', 'seats', 'confirm'].indexOf(currentStep) ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Card className="mb-6 border-red-500/50 bg-red-500/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Select Departure Station */}
        {currentStep === 'departure' && (
          <div className="space-y-6">
            <Card className="backdrop-blur-xl bg-slate-800/40 border border-slate-600/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  Choose Your Departure Station
                </CardTitle>
                <CardDescription>
                  Select from {onlineStations?.filter(s => s.isOnline).length || 0} online stations currently accepting passengers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingStations ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader className="w-6 h-6 animate-spin text-blue-400 mr-2" />
                    <span className="text-gray-300">Loading online stations...</span>
                  </div>
                ) : !onlineStations || onlineStations.length === 0 || onlineStations.filter(s => s.isOnline).length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Online Stations</h3>
                    <p className="text-gray-400 mb-4">There are currently no online stations available.</p>
                    <Button onClick={loadOnlineStations} variant="outline">
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {(onlineStations || []).filter(station => station.isOnline).map((station, index) => {
                      // More flexible filtering - just check if station exists and has some identifier
                      const stationAny = station as any;
                      if (!station || (!stationAny.id && !stationAny._id && !stationAny.stationId)) {
                        console.warn('Skipping invalid station at index', index, station);
                        return null;
                      }
                      
                      const stationId = stationAny.id || stationAny._id || stationAny.stationId;
                      const stationName = stationAny.name || stationAny.stationName || `Station ${index + 1}`;
                      
                      return (
                        <Card
                          key={stationId}
                          className="cursor-pointer hover:bg-slate-700/30 transition-colors border-slate-600/50 bg-slate-800/20"
                          onClick={() => {
                            console.log('🖱️ Station clicked:', { stationId, stationName, station });
                            handleDepartureSelect(stationId);
                          }}
                        >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                              <MapPin className="w-6 h-6 text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-white">{stationName}</h3>
                              <p className="text-sm text-gray-400">
                                {typeof station.governorate === 'string' ? station.governorate : station.governorate?.name || 'Unknown'}, {typeof station.delegation === 'string' ? station.delegation : station.delegation?.name || 'Unknown'}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className="bg-green-600/20 text-green-400 border-green-500/50">
                                  <Zap className="w-3 h-3 mr-1" />
                                  Online
                                </Badge>
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
                      );
                    }).filter(Boolean)}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interactive Map */}
            {onlineStations && onlineStations.filter(s => s.isOnline).length > 0 && (
              <Card className="backdrop-blur-xl bg-slate-800/40 border border-slate-600/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-blue-400" />
                    Interactive Station Map
                  </CardTitle>
                  <CardDescription>
                    Click on any station marker to select it as your departure point
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StationMap
                    stations={onlineStations.filter(s => s.isOnline)}
                    destinations={[]}
                    selectedDeparture={selectedDeparture}
                    selectedDestination={null}
                    onStationSelect={handleDepartureSelect}
                    onDestinationSelect={() => {}}
                    showRoute={false}
                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 2: Select Destination */}
        {currentStep === 'destination' && selectedDeparture && (
          <div className="space-y-6">
            <Card className="backdrop-blur-xl bg-slate-800/40 border border-slate-600/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-purple-400" />
                  Available Destinations
                </CardTitle>
                <CardDescription>
                  Departing from <span className="text-blue-400 font-medium">{selectedDeparture.name || selectedDeparture.stationName}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingDestinations ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader className="w-6 h-6 animate-spin text-purple-400 mr-2" />
                    <span className="text-gray-300">Loading destinations...</span>
                  </div>
                ) : !availableDestinations || availableDestinations.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Destinations Available</h3>
                    <p className="text-gray-400">No vehicles are currently queued from this station.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(availableDestinations || []).filter(destination => destination && destination.destinationId && destination.destinationName).map((destination) => (
                      <Card
                        key={destination.destinationId}
                        className="cursor-pointer hover:bg-slate-700/30 transition-colors border-slate-600/50 bg-slate-800/20"
                        onClick={() => handleDestinationSelect(destination)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-purple-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">{destination.destinationName || 'Unknown Destination'}</h3>
                                <p className="text-sm text-gray-400">
                                  {destination.governorate || 'Unknown'}, {destination.delegation || 'Unknown'}
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                  <div className="flex items-center gap-1 text-sm">
                                    <Car className="w-4 h-4 text-blue-400" />
                                    <span className="text-blue-400">{destination.totalVehicles} vehicles</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm">
                                    <Users className="w-4 h-4 text-green-400" />
                                    <span className="text-green-400">{destination.availableSeats} seats</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm">
                                    <Timer className="w-4 h-4 text-orange-400" />
                                    <span className="text-orange-400">{destination.estimatedDeparture}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-white">{destination.basePrice} TND</div>
                              <div className="text-sm text-gray-400">per seat</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interactive Map with Destinations */}
            {availableDestinations && availableDestinations.length > 0 && (
              <Card className="backdrop-blur-xl bg-slate-800/40 border border-slate-600/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-purple-400" />
                    Destination Map
                  </CardTitle>
                  <CardDescription>
                    Click on destination markers to select your final destination
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StationMap
                    stations={onlineStations}
                    destinations={availableDestinations}
                    selectedDeparture={selectedDeparture}
                    selectedDestination={selectedDestination}
                    onStationSelect={handleDepartureSelect}
                    onDestinationSelect={handleDestinationSelect}
                    showRoute={!!selectedDestination}
                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 3: Select Seats and Date */}
        {currentStep === 'seats' && selectedDestination && (
          <Card className="backdrop-blur-xl bg-slate-800/40 border border-slate-600/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" />
                Select Number of Seats
              </CardTitle>
              <CardDescription>
                Route: <span className="text-blue-400">{selectedDeparture?.name || selectedDeparture?.stationName}</span> → <span className="text-purple-400">{selectedDestination.destinationName}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingRouteDetails ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-6 h-6 animate-spin text-green-400 mr-2" />
                  <span className="text-gray-300">Loading route details...</span>
                </div>
              ) : routeDetails ? (
                <>
                  {/* Route Summary */}
                  <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div>
                          <Car className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                          <div className="text-sm text-gray-400">Vehicles</div>
                          <div className="text-xl font-bold text-white">{routeDetails.totalVehicles}</div>
                        </div>
                        <div>
                          <Users className="w-5 h-5 text-green-400 mx-auto mb-1" />
                          <div className="text-sm text-gray-400">Available Seats</div>
                          <div className="text-xl font-bold text-green-400">{routeDetails.availableSeats || 0}</div>
                        </div>
                        <div>
                          <Timer className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                          <div className="text-sm text-gray-400">Est. Departure</div>
                          <div className="text-lg font-bold text-orange-400">
                            {routeDetails.estimatedDeparture 
                              ? new Date(routeDetails.estimatedDeparture).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })
                              : 'Soon'
                            }
                          </div>
                        </div>
                        <div>
                          <CreditCard className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                          <div className="text-sm text-gray-400">Price per Seat</div>
                          <div className="text-xl font-bold text-blue-400">{routeDetails.basePrice || 0} TND</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

               
                  {/* Seat Selection Counter */}
                  <div className="space-y-6">
                    <Card className="bg-slate-700/20 border-slate-600/50">
                      <CardContent className="p-6">
                        <div className="text-center space-y-4">
                          <h3 className="text-lg font-semibold text-white">Number of Seats</h3>
                          <div className="flex items-center justify-center gap-4">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setSelectedSeats(Math.max(1, selectedSeats - 1))}
                              disabled={selectedSeats <= 1}
                              className="w-12 h-12 rounded-full border-slate-600 text-white hover:bg-slate-700"
                            >
                              -
                            </Button>
                            <div className="text-4xl font-bold text-white min-w-[80px]">
                              {selectedSeats}
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setSelectedSeats(Math.min(routeDetails.availableSeats || 6, selectedSeats + 1))}
                              disabled={selectedSeats >= (routeDetails.availableSeats || 6)}
                              className="w-12 h-12 rounded-full border-slate-600 text-white hover:bg-slate-700"
                            >
                              +
                            </Button>
                          </div>
                          <p className="text-sm text-gray-400">
                            Maximum {routeDetails.availableSeats || 6} seats available
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Cost Display */}
                    <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-sm text-gray-400">Total Cost</div>
                            <div className="text-sm text-gray-400">{selectedSeats} seat{selectedSeats > 1 ? 's' : ''} × {routeDetails.basePrice || 0} TND</div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-green-400">
                              {selectedSeats * (routeDetails.basePrice || 0)} TND
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Button
                      onClick={handleSeatsConfirm}
                      className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      disabled={selectedSeats === 0 || selectedSeats > (routeDetails.availableSeats || 0)}
                    >
                      Continue to Confirmation
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Confirm Booking */}
        {currentStep === 'confirm' && selectedDeparture && selectedDestination && routeDetails && (
          <Card className="backdrop-blur-xl bg-slate-800/40 border border-slate-600/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                Confirm Your Booking
              </CardTitle>
              <CardDescription>
                Please review your booking details before proceeding to payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Booking Summary */}
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                  <span className="text-gray-300">From:</span>
                  <span className="text-blue-400 font-medium">{selectedDeparture.name || selectedDeparture.stationName}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                  <span className="text-gray-300">To:</span>
                  <span className="text-purple-400 font-medium">{selectedDestination.destinationName}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                  <span className="text-gray-300">Number of Seats:</span>
                  <span className="text-green-400 font-medium">{selectedSeats}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                  <span className="text-gray-300">Price per Seat:</span>
                  <span className="text-blue-400 font-medium">{routeDetails.basePrice} TND</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20">
                  <span className="text-lg font-medium text-white">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-400">{selectedSeats * routeDetails.basePrice} TND</span>
                </div>
              </div>

              {/* Route Map */}
              <Card className="backdrop-blur-xl bg-slate-800/40 border border-slate-600/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-blue-400" />
                    Your Journey Route
                  </CardTitle>
                  <CardDescription>
                    Visual route from {selectedDeparture.name || selectedDeparture.stationName} to {selectedDestination.destinationName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StationMap
                    stations={onlineStations}
                    destinations={availableDestinations}
                    selectedDeparture={selectedDeparture}
                    selectedDestination={selectedDestination}
                    onStationSelect={() => {}} // Read-only in confirmation step
                    onDestinationSelect={() => {}} // Read-only in confirmation step
                    showRoute={true}
                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''}
                  />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                {isAuthenticated ? (
                  <Button
                    onClick={createBooking}
                    disabled={isCreatingBooking}
                    className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700"
                  >
                    {isCreatingBooking ? (
                      <>
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        Creating Booking...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Book Trip & Pay {selectedSeats * routeDetails.basePrice} TND
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => {/* Redirect to login */}}
                    className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <User className="w-5 h-5 mr-2" />
                    Login to Complete Booking
                  </Button>
                )}

                {!isCreatingBooking && isAuthenticated && (
                  <p className="text-sm text-gray-400 text-center">
                    You'll be redirected to Konnect for secure payment processing
                  </p>
                )}
              </div>

             
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}