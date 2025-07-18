"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Clock, Users, Navigation, Search, RotateCcw, Zap, Route, Crosshair, Loader, CheckCircle2, Timer, CreditCard, User } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import { useRouter } from "next/navigation";
import { Map, Marker, NavigationControl, GeolocateControl, Source, Layer } from 'react-map-gl/mapbox';
import { TUNISIA_STATIONS, TUNISIA_ROUTES, getStationById, getRouteInfo, type Station, type RouteInfo } from "@/lib/stations";
import 'mapbox-gl/dist/mapbox-gl.css';

// Mapbox tokens
const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2FtZXIyNCIsImEiOiJjbThlMTN6Z2gybDhnMmxyN3FsbHFrbDl0In0.8d5HBrJTL7rb9PrL9krXVA';

interface TripDetails {
  from: Station | null;
  to: Station | null;
  date: string;
  time: string;
  passengers: number;
}

export default function BookTripPage() {
  const [selectionMode, setSelectionMode] = useState<'dropdown' | 'map'>('dropdown');
  const [tripDetails, setTripDetails] = useState<TripDetails>({
    from: null,
    to: null,
    date: '',
    time: '',
    passengers: 1
  });
  const [selectedPoint, setSelectedPoint] = useState<'from' | 'to' | null>(null);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/dark-v11');
  const [viewState, setViewState] = useState({
    longitude: 10.1815,
    latitude: 36.8065,
    zoom: 6.5
  });
  const [animatingStation, setAnimatingStation] = useState<string | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [nearestStations, setNearestStations] = useState<Station[]>([]);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [hasSetNearestStation, setHasSetNearestStation] = useState(false);
  const [connectedStation, setConnectedStation] = useState<Station | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [currentRoute, setCurrentRoute] = useState<RouteInfo | null>(null);
  const [routeGeometry, setRouteGeometry] = useState<any>(null);
  const mapRef = useRef<any>(null);
  const router = useRouter();

  // Use direct station data from central server
  useEffect(() => {
    console.log('🔄 Loading stations from central server data...');
    setStations(TUNISIA_STATIONS);
    console.log(`✅ Loaded ${TUNISIA_STATIONS.length} stations from central server`);
  }, []);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    if (!token) {
      console.log('⚠️ User not authenticated - booking will require login');
    }
  }, []);

  // Note: 3D buildings will be added via mapRef after map loads

  // Get user's current location
  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      setIsLoadingLocation(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // Cache for 1 minute
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`📍 User location: ${latitude}, ${longitude}`);
        
        setUserLocation({ latitude, longitude });
        
        // Update map view to user location
        setViewState({
          longitude,
          latitude,
          zoom: 12
        });

        // Find nearest stations
        await findNearestStations(latitude, longitude);
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('❌ Geolocation error:', error);
        let errorMessage = 'Unable to get your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        setLocationError(errorMessage);
        setIsLoadingLocation(false);
      },
      options
    );
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Find nearest stations with priority for online stations
  const findNearestStations = async (latitude: number, longitude: number) => {
    try {
      // Calculate distances for all stations
      const stationsWithDistance = stations.map(station => ({
        ...station,
        distance: calculateDistance(latitude, longitude, station.latitude!, station.longitude!)
      }));

      // Sort by online status first, then by distance
      const sortedStations = stationsWithDistance.sort((a, b) => {
        // Online stations get priority
        if (a.isOnline && !b.isOnline) return -1;
        if (!a.isOnline && b.isOnline) return 1;
        // If both have same online status, sort by distance
        return a.distance! - b.distance!;
      });

      setNearestStations(sortedStations.slice(0, 10));
      
      // Auto-select the best station (prioritizing online stations)
      if (sortedStations.length > 0 && !tripDetails.from && !hasSetNearestStation) {
        const bestStation = sortedStations[0];
        
        setTripDetails(prev => ({
          ...prev,
          from: bestStation
        }));
        
        setHasSetNearestStation(true);
        
        // Animate to best station
        setViewState({
          longitude: bestStation.longitude!,
          latitude: bestStation.latitude!,
          zoom: 14
        });

        setAnimatingStation(bestStation.id);
        setTimeout(() => setAnimatingStation(null), 2000);

        // Attempt to connect to the station if it's online
        if (bestStation.isOnline) {
          await connectToStation(bestStation);
        }

        const statusText = bestStation.isOnline ? 'online' : 'offline';
        console.log(`✅ Auto-selected ${statusText} station: ${bestStation.name} (${bestStation.distance?.toFixed(2)}km away)`);
      }
    } catch (error) {
      console.error('❌ Error finding nearest stations:', error);
    }
  };

  // Connect to an online station
  const connectToStation = async (station: Station) => {
    if (!station.isOnline) {
      console.log(`❌ Cannot connect to offline station: ${station.name}`);
      return;
    }

    setConnectionStatus('connecting');
    console.log(`🔄 Connecting to ${station.name}...`);

    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setConnectedStation(station);
      setConnectionStatus('connected');
      console.log(`✅ Successfully connected to ${station.name}`);
      
    } catch (error) {
      console.error(`❌ Failed to connect to ${station.name}:`, error);
      setConnectionStatus('disconnected');
    }
  };

  // Draw route between two stations using real roads
  const drawRoute = async (fromStation: Station, toStation: Station) => {
    if (!fromStation || !toStation) {
      setCurrentRoute(null);
      setRouteGeometry(null);
      setIsLoadingRoute(false);
      return;
    }

    console.log(`🗺️ Drawing real traffic route from ${fromStation.name} to ${toStation.name}`);
    setIsLoadingRoute(true);

    try {
      // Get route info from our data
      const routeInfo = getRouteInfo(fromStation.id, toStation.id);
      if (routeInfo) {
        setCurrentRoute(routeInfo);
      }

      // Use Mapbox Directions API to get real road route
      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${fromStation.longitude},${fromStation.latitude};${toStation.longitude},${toStation.latitude}?geometries=geojson&overview=full&steps=true&access_token=${MAPBOX_TOKEN}`;
      
      console.log('🌐 Fetching real route from Mapbox Directions API...');
      const response = await fetch(directionsUrl);
      
      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Create GeoJSON from the real route geometry
        const routeGeoJSON = {
          type: 'Feature',
          properties: {
            distance: route.distance,
            duration: route.duration
          },
          geometry: route.geometry
        };

        setRouteGeometry(routeGeoJSON);
        setIsLoadingRoute(false);
        
        console.log(`✅ Real route fetched: ${(route.distance / 1000).toFixed(1)}km, ${Math.round(route.duration / 60)}min`);

        // Fit the map to show the entire route
        if (mapRef.current) {
          const map = mapRef.current.getMap();
          
          // Get bounds from the route geometry
          const coordinates = route.geometry.coordinates;
          let minLng = coordinates[0][0], maxLng = coordinates[0][0];
          let minLat = coordinates[0][1], maxLat = coordinates[0][1];
          
          coordinates.forEach((coord: [number, number]) => {
            minLng = Math.min(minLng, coord[0]);
            maxLng = Math.max(maxLng, coord[0]);
            minLat = Math.min(minLat, coord[1]);
            maxLat = Math.max(maxLat, coord[1]);
          });
          
          const bounds = [[minLng, minLat], [maxLng, maxLat]];
          
          map.fitBounds(bounds, {
            padding: 80,
            duration: 1500
          });
        }
      } else {
        throw new Error('No route found');
      }

    } catch (error) {
      console.error('❌ Error fetching real route:', error);
      console.log('🔄 Falling back to straight line route...');
      setIsLoadingRoute(false);
      
      // Fallback to straight line if API fails
      const fallbackRouteGeoJSON = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            [fromStation.longitude, fromStation.latitude],
            [toStation.longitude, toStation.latitude]
          ]
        }
      };

      setRouteGeometry(fallbackRouteGeoJSON);

      // Fit the map to show the fallback route
      if (mapRef.current) {
        const map = mapRef.current.getMap();
        const bounds = [
          [Math.min(fromStation.longitude, toStation.longitude), Math.min(fromStation.latitude, toStation.latitude)],
          [Math.max(fromStation.longitude, toStation.longitude), Math.max(fromStation.latitude, toStation.latitude)]
        ];
        
        map.fitBounds(bounds, {
          padding: 50,
          duration: 1500
        });
      }
    }
  };

  // Create booking and redirect to payment
  const createBooking = async () => {
    if (!tripDetails.from || !tripDetails.to || !tripDetails.date || !tripDetails.time) {
      setBookingError('Please fill in all trip details');
      return;
    }

    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      setBookingError('Please login to book a trip');
      router.push('/auth/login');
      return;
    }

    setIsCreatingBooking(true);
    setBookingError(null);

    try {
      // Combine date and time for journeyDate (ISO format)
      const journeyDateTime = new Date(`${tripDetails.date}T${tripDetails.time}:00.000Z`);
      
      // Validate the date
      if (isNaN(journeyDateTime.getTime())) {
        throw new Error('Invalid date or time selected');
      }

      // Check if journey date is in the future
      if (journeyDateTime <= new Date()) {
        throw new Error('Journey date must be in the future');
      }
      
      console.log('🎫 Creating booking...', {
        from: tripDetails.from.name,
        to: tripDetails.to.name,
        passengers: tripDetails.passengers,
        journeyDate: journeyDateTime.toISOString(),
        departureStationId: tripDetails.from.id,
        destinationStationId: tripDetails.to.id
      });

      const bookingData = {
        departureStationId: tripDetails.from.id,
        destinationStationId: tripDetails.to.id,
        seatsBooked: tripDetails.passengers,
        journeyDate: journeyDateTime.toISOString()
      };

            // Call Next.js API route (which proxies to central server)
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });  

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Booking creation failed');
      }

      if (result.success && result.data?.paymentUrl) {
        console.log('✅ Booking created successfully:', result.data.booking.id);
        console.log('💳 Redirecting to payment:', result.data.paymentUrl);
        
        // Automatically redirect to Konnect payment
        window.location.href = result.data.paymentUrl;
      } else {
        throw new Error('No payment URL received');
      }

    } catch (error: any) {
      console.error('❌ Booking creation failed:', error);
      setBookingError(error.message || 'Failed to create booking');
      setIsCreatingBooking(false);
    }
  };

  // Update route when stations change
  useEffect(() => {
    if (tripDetails.from && tripDetails.to) {
      drawRoute(tripDetails.from, tripDetails.to);
    } else {
      setCurrentRoute(null);
      setRouteGeometry(null);
    }
  }, [tripDetails.from, tripDetails.to]);

  const handleMapClick = (event: any) => {
    if (selectedPoint && selectionMode === 'map') {
      const { lng, lat } = event.lngLat;
      
      // Create a custom station for the selected point
      const customStation: Station = {
        id: `custom-${selectedPoint}-${Date.now()}`,
        name: `Selected ${selectedPoint === 'from' ? 'Origin' : 'Destination'}`,
        nameAr: `النقطة المختارة`,
        city: 'Custom Location',
        latitude: lat,
        longitude: lng,
        coordinates: [lng, lat],
        governorate: { name: 'Custom', nameAr: 'مخصص' },
        delegation: { name: 'Custom Location', nameAr: 'موقع مخصص' },
        address: `Custom location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        isActive: true,
        isOnline: false
      };

      setTripDetails(prev => ({
        ...prev,
        [selectedPoint]: customStation
      }));

      // Animate to the selected point
      setViewState({
        longitude: lng,
        latitude: lat,
        zoom: 16
      });

      // Trigger animation effect
      setAnimatingStation(customStation.id);
      setTimeout(() => setAnimatingStation(null), 2000);
      
      setSelectedPoint(null);
    }
  };

  const handleMapLoad = () => {
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      
      // Add 3D buildings layer
      map.on('style.load', () => {
        // Check if the layer already exists
        if (!map.getLayer('add-3d-buildings')) {
          map.addLayer({
            id: 'add-3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 14,
            paint: {
              'fill-extrusion-color': '#1f2937',
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'height']
              ],
              'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'min_height']
              ],
              'fill-extrusion-opacity': 0.8
            }
          });
        }
      });
    }
  };

  const handleStationSelect = (stationId: string, pointType: 'from' | 'to') => {
    // Look in stations from central server data first
    let station = TUNISIA_STATIONS.find(s => s.id === stationId);
    
    if (!station) {
      // Look in nearest stations from location search
      station = nearestStations.find(s => s.id === stationId);
    }
    
    if (station) {
      setTripDetails(prev => ({
        ...prev,
        [pointType]: station
      }));

      if (selectionMode === 'map') {
        // Animate to station on map
        setViewState({
          longitude: station.coordinates[0],
          latitude: station.coordinates[1],
          zoom: 14
        });

        // Trigger animation effect
        setAnimatingStation(station.id);
        setTimeout(() => setAnimatingStation(null), 2000);
      }

      console.log(`📍 Selected ${pointType} station: ${station.name}`);
    }
  };

  const handleSearch = () => {
    if (tripDetails.from && tripDetails.to && tripDetails.date) {
      console.log('Searching trips:', tripDetails);
      // Here you would typically make an API call to search for available trips
      router.push('/search-results');
    }
  };

  const swapLocations = () => {
    setTripDetails(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
  };

  useEffect(() => {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    setTripDetails(prev => ({
      ...prev,
      date: today,
      time: '09:00'
    }));
  }, []);

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
                onClick={() => router.push('/dashboard')}
                variant="outline"
                size="sm"
                className="border-slate-600 text-gray-300 hover:bg-slate-800 hover:text-white p-2"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Route className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-white">Book Your Trip</h1>
                <p className="text-gray-400 text-sm sm:text-base">Find and reserve your perfect journey</p>
              </div>
              
              {/* Connection Status Indicator */}
              {connectionStatus !== 'disconnected' && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800/50 border border-slate-600">
                  {connectionStatus === 'connecting' ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin text-yellow-400" />
                      <span className="text-sm text-yellow-400 hidden sm:inline">Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400 hidden sm:inline">Connected to {connectedStation?.name}</span>
                      <span className="text-xs text-green-400 sm:hidden">Online</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            
            {/* Booking Form */}
            <Card className="backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-600/50 order-2 xl:order-1">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl sm:text-2xl text-white">Trip Details</CardTitle>
                    <CardDescription className="text-gray-400 text-sm sm:text-base">
                      Choose your journey preferences
                    </CardDescription>
                  </div>
                  
                  {/* Selection Mode Toggle */}
                  <div className="flex rounded-lg bg-slate-800/50 border border-slate-600/50 p-1">
                    <Button
                      size="sm"
                      variant={selectionMode === 'dropdown' ? 'default' : 'ghost'}
                      onClick={() => setSelectionMode('dropdown')}
                      className={`text-xs sm:text-sm ${
                        selectionMode === 'dropdown'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      <Search className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Dropdown
                    </Button>
                    <Button
                      size="sm"
                      variant={selectionMode === 'map' ? 'default' : 'ghost'}
                      onClick={() => setSelectionMode('map')}
                      className={`text-xs sm:text-sm ${
                        selectionMode === 'map'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Map
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Location Services */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">Quick Location Setup</span>
                    <Button
                      onClick={getCurrentLocation}
                      disabled={isLoadingLocation}
                      size="sm"
                      variant="outline"
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                    >
                      {isLoadingLocation ? (
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Crosshair className="w-4 h-4 mr-2" />
                      )}
                      {isLoadingLocation ? 'Finding...' : 'Use My Location'}
                    </Button>
                  </div>
                  
                  {locationError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {locationError}
                    </div>
                  )}
                  
                  {userLocation && nearestStations.length > 0 && (
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2 text-green-400 text-sm mb-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Found {nearestStations.length} nearby stations</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Closest: {nearestStations[0]?.name} ({nearestStations[0]?.distance}km away)
                      </div>
                    </div>
                  )}
                </div>

                {/* From/To Selection */}
                <div className="space-y-4">
                  {/* From Location */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      From {tripDetails.from?.distance && (
                        <span className="text-blue-400 text-xs ml-2">
                          ({tripDetails.from.distance}km away)
                        </span>
                      )}
                    </label>
                    {selectionMode === 'dropdown' ? (
                      <Select onValueChange={(value) => handleStationSelect(value, 'from')}>
                        <SelectTrigger className="h-11 sm:h-12 bg-slate-800/50 border-slate-600 text-white">
                          <SelectValue placeholder="Select departure station" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          {/* Nearest Stations First */}
                          {nearestStations.length > 0 && (
                            <>
                              {nearestStations.map((station) => (
                                <SelectItem key={station.id} value={station.id} className="text-white hover:bg-slate-700">
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-4 h-4 text-green-400" />
                                      {station.isOnline ? (
                                        <Zap className="w-3 h-3 text-green-400" />
                                      ) : (
                                        <div className="w-3 h-3 rounded-full bg-gray-500" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{station.name}</span>
                                        {station.isOnline && <Badge className="text-xs bg-green-600 text-white">Online</Badge>}
                                      </div>
                                      <span className="text-gray-400 text-sm">{station.governorate?.name}</span>
                                      <span className="text-green-400 text-xs ml-2">({station.distance?.toFixed(1)}km)</span>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                              <div className="border-t border-slate-600 my-1"></div>
                            </>
                          )}
                          
                          {/* Central Server Stations */}
                          {TUNISIA_STATIONS.filter(station => !nearestStations.find(ns => ns.id === station.id)).map((station) => (
                            <SelectItem key={station.id} value={station.id} className="text-white hover:bg-slate-700">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4 text-blue-400" />
                                  {station.isOnline ? (
                                    <Zap className="w-3 h-3 text-green-400" />
                                  ) : (
                                    <div className="w-3 h-3 rounded-full bg-gray-500" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{station.name}</span>
                                    {station.isOnline && <Badge className="text-xs bg-green-600 text-white">Online</Badge>}
                                  </div>
                                  <span className="text-gray-400 text-sm">{station.governorate.name}</span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setSelectedPoint('from')}
                        className={`w-full h-11 sm:h-12 justify-start bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700 ${
                          selectedPoint === 'from' ? 'border-blue-400 bg-blue-500/10' : ''
                        }`}
                      >
                        <MapPin className="w-4 h-4 mr-2 text-blue-400" />
                        {tripDetails.from ? tripDetails.from.name : 'Click map to select origin'}
                      </Button>
                    )}
                    {tripDetails.from && (
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                        <MapPin className="w-3 h-3 mr-1" />
                        {tripDetails.from.city}
                      </Badge>
                    )}
                  </div>

                  {/* Swap Button */}
                  <div className="flex justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={swapLocations}
                      className="border-slate-600 text-gray-400 hover:bg-slate-700 hover:text-white"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* To Location */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      To
                    </label>
                    {selectionMode === 'dropdown' ? (
                      <Select onValueChange={(value) => handleStationSelect(value, 'to')}>
                        <SelectTrigger className="h-11 sm:h-12 bg-slate-800/50 border-slate-600 text-white">
                          <SelectValue placeholder="Select destination station" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          {/* Nearest Stations First */}
                          {nearestStations.length > 0 && (
                            <>
                              {nearestStations.map((station) => (
                                <SelectItem key={station.id} value={station.id} className="text-white hover:bg-slate-700">
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-4 h-4 text-green-400" />
                                      {station.isOnline ? (
                                        <Zap className="w-3 h-3 text-green-400" />
                                      ) : (
                                        <div className="w-3 h-3 rounded-full bg-gray-500" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{station.name}</span>
                                        {station.isOnline && <Badge className="text-xs bg-green-600 text-white">Online</Badge>}
                                      </div>
                                      <span className="text-gray-400 text-sm">{station.governorate?.name}</span>
                                      <span className="text-green-400 text-xs ml-2">({station.distance?.toFixed(1)}km)</span>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                              <div className="border-t border-slate-600 my-1"></div>
                            </>
                          )}
                          
                          {/* Central Server Stations */}
                          {TUNISIA_STATIONS.filter(station => !nearestStations.find(ns => ns.id === station.id)).map((station) => (
                            <SelectItem key={station.id} value={station.id} className="text-white hover:bg-slate-700">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4 text-purple-400" />
                                  {station.isOnline ? (
                                    <Zap className="w-3 h-3 text-green-400" />
                                  ) : (
                                    <div className="w-3 h-3 rounded-full bg-gray-500" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{station.name}</span>
                                    {station.isOnline && <Badge className="text-xs bg-green-600 text-white">Online</Badge>}
                                  </div>
                                  <span className="text-gray-400 text-sm">{station.governorate.name}</span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setSelectedPoint('to')}
                        className={`w-full h-11 sm:h-12 justify-start bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700 ${
                          selectedPoint === 'to' ? 'border-purple-400 bg-purple-500/10' : ''
                        }`}
                      >
                        <MapPin className="w-4 h-4 mr-2 text-purple-400" />
                        {tripDetails.to ? tripDetails.to.name : 'Click map to select destination'}
                      </Button>
                    )}
                    {tripDetails.to && (
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                        <MapPin className="w-3 h-3 mr-1" />
                        {tripDetails.to.city}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="date"
                        value={tripDetails.date}
                        onChange={(e) => setTripDetails(prev => ({ ...prev, date: e.target.value }))}
                        className="h-11 sm:h-12 pl-10 bg-slate-800/50 border-slate-600 text-white"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Time
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="time"
                        value={tripDetails.time}
                        onChange={(e) => setTripDetails(prev => ({ ...prev, time: e.target.value }))}
                        className="h-11 sm:h-12 pl-10 bg-slate-800/50 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Passengers */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Passengers
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Select 
                      value={tripDetails.passengers.toString()} 
                      onValueChange={(value) => setTripDetails(prev => ({ ...prev, passengers: parseInt(value) }))}
                    >
                      <SelectTrigger className="h-11 sm:h-12 pl-10 bg-slate-800/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <SelectItem key={num} value={num.toString()} className="text-white hover:bg-slate-700">
                            {num} {num === 1 ? 'Passenger' : 'Passengers'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Route Information */}
                {(currentRoute || isLoadingRoute) && tripDetails.from && tripDetails.to && (
                  <Card className="mb-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        {isLoadingRoute ? (
                          <Loader className="w-5 h-5 text-blue-400 animate-spin" />
                        ) : (
                          <Route className="w-5 h-5 text-blue-400" />
                        )}
                        <h3 className="text-lg font-semibold text-white">
                          {isLoadingRoute ? 'Finding Best Route...' : 'Route Information'}
                        </h3>
                      </div>
                      
                      {isLoadingRoute ? (
                        <div className="text-center py-4">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Loader className="w-4 h-4 animate-spin text-blue-400" />
                            <span className="text-gray-300">Calculating real traffic route</span>
                          </div>
                          <div className="text-sm text-gray-400">Using live traffic data</div>
                        </div>
                      ) : currentRoute ? (
                        <>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <Navigation className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-400">Distance</span>
                              </div>
                              <div className="text-xl font-bold text-white">{currentRoute.distance}km</div>
                            </div>
                            <div>
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <Timer className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-400">Duration</span>
                              </div>
                              <div className="text-xl font-bold text-white">{currentRoute.duration}</div>
                            </div>
                            <div>
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <CreditCard className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-400">Price</span>
                              </div>
                              <div className="text-xl font-bold text-green-400">{currentRoute.price} TND</div>
                            </div>
                          </div>
                          <div className="mt-3 p-2 bg-black/20 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-300">
                                <span className="text-blue-400">{tripDetails.from.name}</span>
                                <span className="mx-2">→</span>
                                <span className="text-purple-400">{tripDetails.to.name}</span>
                              </div>
                              <Badge variant="outline" className="bg-green-500/20 border-green-500/40 text-green-400 text-xs">
                                <Navigation className="w-3 h-3 mr-1" />
                                Real Traffic Route
                              </Badge>
                            </div>
                          </div>
                        </>
                      ) : null}
                    </CardContent>
                  </Card>
                )}

                {/* Connect to Station Button */}
                {tripDetails.from?.isOnline && connectionStatus === 'disconnected' && (
                  <Button
                    onClick={() => connectToStation(tripDetails.from!)}
                    className="w-full h-11 sm:h-12 text-base sm:text-lg font-semibold rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300"
                  >
                    <Zap className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Connect to {tripDetails.from.name}
                  </Button>
                )}



                {/* Book Trip Button */}
                {tripDetails.from && tripDetails.to && tripDetails.date && tripDetails.time && currentRoute && !isLoadingRoute && (
                  <div className="space-y-3">
                    {bookingError && (
                      <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-lg">
                        <p className="text-red-400 text-sm">{bookingError}</p>
                      </div>
                    )}
                    
                    {isAuthenticated ? (
                      <>
                        <Button
                          onClick={createBooking}
                          disabled={isCreatingBooking}
                          className="w-full h-11 sm:h-12 text-base sm:text-lg font-semibold rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300"
                        >
                          {isCreatingBooking ? (
                            <>
                              <Loader className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                              Creating Booking...
                            </>
                          ) : (
                            <>
                              <CreditCard className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                              Book Trip - {currentRoute.price} TND
                            </>
                          )}
                        </Button>
                        {!isCreatingBooking && (
                          <p className="text-xs text-gray-400 text-center">
                            You'll be redirected to Konnect for secure payment
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Button
                          onClick={() => router.push('/auth/login')}
                          className="w-full h-11 sm:h-12 text-base sm:text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300"
                        >
                          <User className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                          Login to Book Trip
                        </Button>
                        <p className="text-xs text-gray-400 text-center">
                          Price: {currentRoute.price} TND - Login required for booking
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Search Button */}
                <Button 
                  onClick={handleSearch}
                  disabled={!tripDetails.from || !tripDetails.to || !tripDetails.date}
                  className="w-full h-11 sm:h-12 text-base sm:text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300"
                >
                  <Search className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Search Trips
                </Button>
              </CardContent>
            </Card>

            {/* Interactive Map */}
            <Card className="backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-600/50 order-1 xl:order-2">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl text-white flex items-center gap-2">
                  <Navigation className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                  Interactive Map
                </CardTitle>
                <CardDescription className="text-gray-400 text-sm sm:text-base">
                  {selectionMode === 'map' && selectedPoint 
                    ? `Click on the map to select your ${selectedPoint === 'from' ? 'origin' : 'destination'}`
                    : userLocation && nearestStations.length > 0
                    ? `Showing ${nearestStations.length} nearest stations. Green markers are online, gray are offline.`
                    : 'Explore stations across Tunisia with 3D visualization. Use location services for personalized results.'
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6">
                <div className="h-64 sm:h-80 lg:h-96 rounded-xl overflow-hidden border border-slate-600/50">
                  <Map
                    ref={mapRef}
                    mapboxAccessToken={MAPBOX_TOKEN}
                    {...viewState}
                    onMove={(evt: any) => setViewState(evt.viewState)}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle={mapStyle}
                    onClick={handleMapClick}
                    onLoad={handleMapLoad}
                  >
                    {/* Navigation Controls */}
                    <NavigationControl position="top-right" />
                    <GeolocateControl position="top-right" />

                    {/* Real Traffic Route Line */}
                    {routeGeometry && (
                      <Source
                        id="route"
                        type="geojson"
                        data={routeGeometry}
                      >
                        {/* Outer glow for visibility */}
                        <Layer
                          id="route-line-outer-glow"
                          type="line"
                          paint={{
                            'line-color': '#1e40af',
                            'line-width': 12,
                            'line-opacity': 0.2,
                            'line-blur': 4,
                          }}
                          layout={{
                            'line-join': 'round',
                            'line-cap': 'round',
                          }}
                        />
                        {/* Main route line */}
                        <Layer
                          id="route-line"
                          type="line"
                          paint={{
                            'line-color': isLoadingRoute ? '#6b7280' : '#3b82f6',
                            'line-width': 5,
                            'line-opacity': isLoadingRoute ? 0.5 : 0.9,
                          }}
                          layout={{
                            'line-join': 'round',
                            'line-cap': 'round',
                          }}
                        />
                        {/* Inner glow */}
                        <Layer
                          id="route-line-glow"
                          type="line"
                          paint={{
                            'line-color': isLoadingRoute ? '#9ca3af' : '#60a5fa',
                            'line-width': 8,
                            'line-opacity': isLoadingRoute ? 0.2 : 0.4,
                            'line-blur': 2,
                          }}
                          layout={{
                            'line-join': 'round',
                            'line-cap': 'round',
                          }}
                        />
                      </Source>
                    )}

                    {/* User Location Marker */}
                    {userLocation && (
                      <Marker
                        longitude={userLocation.longitude}
                        latitude={userLocation.latitude}
                      >
                        <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-white flex items-center justify-center shadow-lg animate-pulse">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                      </Marker>
                    )}

                    {/* Nearest Station Markers */}
                    {nearestStations.map((station) => (
                      <Marker
                        key={`nearest-${station.id}`}
                        longitude={station.longitude!}
                        latitude={station.latitude!}
                        onClick={(e: any) => {
                          e.originalEvent.stopPropagation();
                          if (selectedPoint) {
                            handleStationSelect(station.id, selectedPoint);
                          }
                        }}
                      >
                        <div className="relative">
                          <div 
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-300 ${
                              animatingStation === station.id 
                                ? `animate-ping ${station.isOnline ? 'bg-green-500 border-green-400' : 'bg-gray-500 border-gray-400'} scale-150` 
                                : tripDetails.from?.id === station.id
                                ? 'bg-blue-500 border-blue-400 scale-125 shadow-lg shadow-blue-500/50'
                                : tripDetails.to?.id === station.id
                                ? 'bg-purple-500 border-purple-400 scale-125 shadow-lg shadow-purple-500/50'
                                : station.isOnline
                                ? 'bg-green-500 border-green-400 hover:bg-green-600 hover:scale-110 shadow-lg shadow-green-500/30'
                                : 'bg-gray-500 border-gray-400 hover:bg-gray-600 hover:scale-110 shadow-lg shadow-gray-500/30'
                            }`}
                            title={`${station.name} (${station.distance?.toFixed(1)}km away) - ${station.isOnline ? 'Online' : 'Offline'}`}
                          >
                            <MapPin className="w-4 h-4 text-white" />
                          </div>
                          {station.isOnline && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white flex items-center justify-center">
                              <Zap className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>
                      </Marker>
                    ))}

                    {/* Central Server Station Markers */}
                    {TUNISIA_STATIONS.filter(station => !nearestStations.find(ns => ns.id === station.id)).map((station) => (
                      <Marker
                        key={station.id}
                        longitude={station.longitude!}
                        latitude={station.latitude!}
                        onClick={(e: any) => {
                          e.originalEvent.stopPropagation();
                          if (selectedPoint) {
                            handleStationSelect(station.id, selectedPoint);
                          }
                        }}
                      >
                        <div className="relative">
                          <div 
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-300 ${
                              animatingStation === station.id 
                                ? `animate-ping ${station.isOnline ? 'bg-green-500 border-green-400' : 'bg-gray-500 border-gray-400'} scale-150` 
                                : tripDetails.from?.id === station.id
                                ? 'bg-blue-500 border-blue-400 scale-125 shadow-lg shadow-blue-500/50'
                                : tripDetails.to?.id === station.id
                                ? 'bg-purple-500 border-purple-400 scale-125 shadow-lg shadow-purple-500/50'
                                : station.isOnline
                                ? 'bg-green-500 border-green-400 hover:bg-green-600 hover:scale-110 shadow-lg shadow-green-500/30'
                                : 'bg-gray-500 border-gray-400 hover:bg-gray-600 hover:scale-110 shadow-lg shadow-gray-500/30'
                            }`}
                            title={`${station.name} - ${station.isOnline ? 'Online' : 'Offline'}`}
                          >
                            <MapPin className="w-4 h-4 text-white" />
                          </div>
                          {station.isOnline && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white flex items-center justify-center">
                              <Zap className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>
                      </Marker>
                    ))}

                    {/* Custom location markers */}
                    {tripDetails.from && !TUNISIA_STATIONS.find(s => s.id === tripDetails.from?.id) && (
                      <Marker
                        longitude={tripDetails.from.coordinates[0]}
                        latitude={tripDetails.from.coordinates[1]}
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-blue-400 flex items-center justify-center animate-pulse">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                      </Marker>
                    )}

                    {tripDetails.to && !TUNISIA_STATIONS.find(s => s.id === tripDetails.to?.id) && (
                      <Marker
                        longitude={tripDetails.to.coordinates[0]}
                        latitude={tripDetails.to.coordinates[1]}
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-purple-400 flex items-center justify-center animate-pulse">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                      </Marker>
                    )}
                  </Map>
                </div>

                {/* Map Controls */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setMapStyle('mapbox://styles/mapbox/dark-v11')}
                    className={`text-xs border-slate-600 ${
                      mapStyle === 'mapbox://styles/mapbox/dark-v11' 
                        ? 'bg-slate-700 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Dark
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setMapStyle('mapbox://styles/mapbox/satellite-streets-v12')}
                    className={`text-xs border-slate-600 ${
                      mapStyle === 'mapbox://styles/mapbox/satellite-streets-v12' 
                        ? 'bg-slate-700 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Satellite
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setMapStyle('mapbox://styles/mapbox/streets-v12')}
                    className={`text-xs border-slate-600 ${
                      mapStyle === 'mapbox://styles/mapbox/streets-v12' 
                        ? 'bg-slate-700 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Streets
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
} 