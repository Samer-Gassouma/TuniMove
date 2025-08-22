'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, Search, Clock, CheckCircle, XCircle, MapPin, User, Mail, Phone } from 'lucide-react'
import Map from '@/components/map/Map'
import { StationPartnershipService } from '@/lib/station-partnership'
import type { StationPartnershipRequest } from '@/lib/supabase'

export default function RequestStatusChecker() {
  const [requestNumber, setRequestNumber] = useState('')
  const [request, setRequest] = useState<StationPartnershipRequest | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!requestNumber.trim()) {
      setError('Veuillez entrer un numéro de demande')
      return
    }

    setIsLoading(true)
    setError('')
    setHasSearched(true)

    try {
      const result = await StationPartnershipService.getRequestByNumber(requestNumber.trim())
      setRequest(result)
      
      if (!result) {
        setError('Request not found. Please check your request number.')
      }
    } catch (error) {
      console.error('Error fetching request:', error)
      setError('Failed to fetch request status. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Clock className="w-4 h-4" />,
          label: 'En attente de révision'
        }
      case 'approved':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Approuvée'
        }
      case 'rejected':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <XCircle className="w-4 h-4" />,
          label: 'Rejetée'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <Clock className="w-4 h-4" />,
          label: 'Inconnu'
        }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Section de recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Vérifier le statut de la demande</CardTitle>
          <CardDescription>
            Entrez votre numéro de demande pour vérifier le statut de votre candidature au partenariat de station.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="requestNumber" className="sr-only">Numéro de demande</Label>
              <Input
                id="requestNumber"
                placeholder="Entrez votre numéro de demande (ex : SPR-1234567890-123)"
                value={requestNumber}
                onChange={(e) => setRequestNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Rechercher
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Section des résultats */}
      {hasSearched && !isLoading && (
        <>
          {request ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Détails de la demande</CardTitle>
                    <CardDescription>Demande #{request.request_number}</CardDescription>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusInfo(request.status).color} flex items-center gap-2`}
                  >
                    {getStatusInfo(request.status).icon}
                    {getStatusInfo(request.status).label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Informations personnelles */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informations personnelles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Nom :</span>
                      <p>{request.first_name} {request.last_name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        Email :
                      </span>
                      <p>{request.email}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        Téléphone :
                      </span>
                      <p>{request.phone_number}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Informations sur l'emplacement */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Emplacement de la station
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Gouvernorat :</span>
                        <p>{request.governorate}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Délégation :</span>
                        <p>{request.delegation}</p>
                      </div>
                      {request.latitude && request.longitude && (
                        <div>
                          <span className="font-medium text-gray-600">Coordonnées :</span>
                          <p>{request.latitude.toFixed(6)}, {request.longitude.toFixed(6)}</p>
                        </div>
                      )}
                    </div>
                    {request.latitude && request.longitude && (
                      <div className="border rounded-lg overflow-hidden">
                        <Map
                          latitude={request.latitude}
                          longitude={request.longitude}
                          zoom={14}
                          className="h-48"
                          showMarker={true}
                          markerColor="#3B82F6"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Chronologie de la demande */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Chronologie de la demande</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Soumise :</span>
                      <span>{request.created_at && formatDate(request.created_at)}</span>
                    </div>
                    {request.updated_at && request.updated_at !== request.created_at && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Dernière mise à jour :</span>
                        <span>{formatDate(request.updated_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message de statut */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Et après ?</h4>
                  {request.status === 'pending' && (
                    <p className="text-blue-800 text-sm">
                      Votre demande est en cours d'examen. Notre équipe évaluera votre candidature et vous répondra sous 5 à 7 jours ouvrables. Vous serez notifié par email dès qu'une décision sera prise.
                    </p>
                  )}
                  {request.status === 'approved' && (
                    <p className="text-green-800 text-sm">
                      Félicitations ! Votre demande de partenariat de station a été approuvée. Notre équipe vous contactera prochainement pour discuter des prochaines étapes d'intégration de votre station.
                    </p>
                  )}
                  {request.status === 'rejected' && (
                    <p className="text-red-800 text-sm">
                      Malheureusement, votre demande a été rejetée. Si vous pensez qu'il s'agit d'une erreur ou souhaitez discuter de la décision, veuillez contacter notre équipe d'assistance.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Demande introuvable</h3>
                <p className="text-gray-600">
                  Aucune demande trouvée avec le numéro fourni. Veuillez vérifier votre numéro de demande et réessayer.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
