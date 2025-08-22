"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StationMap from "@/components/map/StationMap";
import { MapPin, Navigation, AlertCircle } from "lucide-react";

// Mock data for testing
const mockStations = [
  {
    id: 'tunis-main-station',
    name: 'Tunis Main Station',
    nameAr: 'محطة تونس الرئيسية',
    governorate: { name: 'Tunis', nameAr: 'تونس' },
    delegation: { name: 'Tunis Center', nameAr: 'تونس المركز' },
    address: 'Avenue Habib Bourguiba, Tunis',
    latitude: 36.8065,
    longitude: 10.1815,
    isActive: true,
    isOnline: true,
    _count: { staff: 2, departureBookings: 0, destinationBookings: 15, queueEntries: 0 }
  },
  {
    id: 'monastir-main-station',
    name: 'Monastir Main Station',
    nameAr: 'محطة المنستير الرئيسية',
    governorate: { name: 'Monastir', nameAr: 'المنستير' },
    delegation: { name: 'Monastir Center', nameAr: 'المنستير المركز' },
    address: 'Avenue de l\'Indépendance, Monastir',
    latitude: 35.7617,
    longitude: 10.8276,
    isActive: true,
    isOnline: true,
    _count: { staff: 2, departureBookings: 15, destinationBookings: 0, queueEntries: 2 }
  },
  {
    id: 'sfax-main-station',
    name: 'Sfax Main Station',
    nameAr: 'محطة صفاقس الرئيسية',
    governorate: { name: 'Sfax', nameAr: 'صفاقس' },
    delegation: { name: 'Sfax Center', nameAr: 'صفاقس المركز' },
    address: 'Avenue Hedi Chaker, Sfax',
    latitude: 34.7406,
    longitude: 10.7603,
    isActive: true,
    isOnline: true,
    _count: { staff: 2, departureBookings: 0, destinationBookings: 0, queueEntries: 0 }
  },
  {
    id: 'gafsa-main-station',
    name: 'Gafsa Main Station',
    nameAr: 'محطة قفصة الرئيسية',
    governorate: { name: 'Gafsa', nameAr: 'قفصة' },
    delegation: { name: 'Gafsa Center', nameAr: 'قفصة المركز' },
    address: 'Avenue Ali Belhaouane, Gafsa',
    latitude: 34.4217,
    longitude: 8.7842,
    isActive: true,
    isOnline: false, // Offline for testing
    _count: { staff: 2, departureBookings: 0, destinationBookings: 0, queueEntries: 0 }
  }
];

const mockDestinations = [
  {
    destinationId: 'sfax-main-station',
    destinationName: 'Sfax Main Station',
    destinationNameAr: 'محطة صفاقس الرئيسية',
    governorate: 'Sfax',
    delegation: 'Sfax Center',
    totalVehicles: 3,
    availableSeats: 12,
    estimatedDeparture: '2h 15m',
    basePrice: 25,
    vehicles: [],
    latitude: 34.7406,
    longitude: 10.7603
  },
  {
    destinationId: 'gafsa-main-station',
    destinationName: 'Gafsa Main Station',
    destinationNameAr: 'محطة قفصة الرئيسية',
    governorate: 'Gafsa',
    delegation: 'Gafsa Center',
    totalVehicles: 2,
    availableSeats: 8,
    estimatedDeparture: '4h 30m',
    basePrice: 40,
    vehicles: [],
    latitude: 34.4217,
    longitude: 8.7842
  }
];

export default function MapTestPage() {
  const [selectedDeparture, setSelectedDeparture] = useState<any>(null);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [showDestinations, setShowDestinations] = useState(false);

  const handleStationSelect = (stationId: string) => {
    const station = mockStations.find(s => s.id === stationId);
    if (station) {
      setSelectedDeparture(station);
      setSelectedDestination(null);
      setShowDestinations(true);
    }
  };

  const handleDestinationSelect = (destination: any) => {
    setSelectedDestination(destination);
  };

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

  if (!mapboxToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md bg-slate-800/40 backdrop-blur-xl border-red-500/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Mapbox Token Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              To view the interactive map, please add your Mapbox access token to the <code className="bg-slate-700 px-2 py-1 rounded">.env.local</code> file.
            </p>
            <p className="text-sm text-gray-400">
              See <code className="bg-slate-700 px-1 rounded">MAPBOX_SETUP.md</code> for instructions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/20 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white">Interactive Station Map Test</h1>
          <p className="text-gray-400 mt-2">Test the map functionality with mock data</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Selection Status */}
        <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-600/50">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Selected Departure</h3>
                {selectedDeparture ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400">{selectedDeparture.name}</span>
                    <Badge className="bg-green-600/20 text-green-400 border-green-500/50">
                      Online
                    </Badge>
                  </div>
                ) : (
                  <p className="text-gray-400">Click a green marker to select departure station</p>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Selected Destination</h3>
                {selectedDestination ? (
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400">{selectedDestination.destinationName}</span>
                    <span className="text-orange-400 text-sm">{selectedDestination.basePrice} TND</span>
                  </div>
                ) : selectedDeparture ? (
                  <p className="text-gray-400">Click an orange marker to select destination</p>
                ) : (
                  <p className="text-gray-500">Select departure first</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Map */}
        <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-600/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              Interactive Station Map
            </CardTitle>
            <CardDescription>
              Click on station markers to select them. Green = online stations, Orange = available destinations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StationMap
              stations={mockStations}
              destinations={showDestinations ? mockDestinations : []}
              selectedDeparture={selectedDeparture}
              selectedDestination={selectedDestination}
              onStationSelect={handleStationSelect}
              onDestinationSelect={handleDestinationSelect}
              showRoute={!!selectedDestination}
              mapboxAccessToken={mapboxToken}
            />
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-600/50">
          <CardHeader>
            <CardTitle className="text-white">How to Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-300">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
              <p>Click on any green marker (online stations) to select a departure station</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
              <p>After selecting departure, orange markers will appear for available destinations</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
              <p>Click an orange marker to select destination and see the route displayed in blue</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">4</div>
              <p>Click markers to see popup details and quick selection buttons</p>
            </div>
          </CardContent>
        </Card>

        {/* Reset Button */}
        <div className="text-center">
          <Button
            onClick={() => {
              setSelectedDeparture(null);
              setSelectedDestination(null);
              setShowDestinations(false);
            }}
            variant="outline"
            className="border-slate-600 text-gray-300 hover:bg-slate-800"
          >
            Reset Selection
          </Button>
        </div>
      </main>
    </div>
  );
}
