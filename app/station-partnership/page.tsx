'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Search, Users, CheckCircle } from 'lucide-react'
import StationPartnershipForm from '@/components/station-partnership/StationPartnershipForm'
import RequestStatusChecker from '@/components/station-partnership/RequestStatusChecker'

export default function StationPartnershipPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Programme de Partenariat des Stations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Rejoignez le réseau croissant de stations de transport de TuniMove à travers la Tunisie.
            Connectez votre station à des milliers de voyageurs et développez votre activité.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Visibilité Accrue</h3>
              <p className="text-gray-600 text-sm">
                Touchez des milliers de voyageurs recherchant des options de transport à travers la Tunisie.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Intégration Digitale</h3>
              <p className="text-gray-600 text-sm">
                Modernisez votre station avec notre système de réservation et de gestion digital.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Garantie de Qualité</h3>
              <p className="text-gray-600 text-sm">
                Maintenez des standards de service élevés grâce à notre système de suivi et d'assistance qualité.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="apply" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="apply" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Postuler Maintenant
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Vérifier le Statut
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="apply" className="mt-0">
            <div className="space-y-6">
              {/* Requirements Card */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Conditions de Partenariat</CardTitle>
                  <CardDescription>
                    Veuillez vous assurer de remplir les conditions suivantes avant de postuler :
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium">Licence d'Exploitation Valide</h4>
                          <p className="text-sm text-gray-600">
                            Vous devez disposer d'un registre commercial valide en Tunisie
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium">Emplacement Physique</h4>
                          <p className="text-sm text-gray-600">
                            La station doit avoir un emplacement physique fixe
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium">Standards de Qualité</h4>
                          <p className="text-sm text-gray-600">
                            Engagement à maintenir des standards de qualité de service
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium">Conformité Sécurité</h4>
                          <p className="text-sm text-gray-600">
                            Respect des réglementations de sécurité et exigences d'assurance
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium">Intégration Technologique</h4>
                          <p className="text-sm text-gray-600">
                            Volonté d'intégrer notre plateforme digitale
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium">Service Client</h4>
                          <p className="text-sm text-gray-600">
                            Engagement à fournir un excellent service client
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Application Form */}
              <StationPartnershipForm />
            </div>
          </TabsContent>
          
          <TabsContent value="status" className="mt-0">
            <RequestStatusChecker />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-gray-600">
            Des questions sur le programme de partenariat ?{' '}
            <a href="mailto:partnerships@tunimove.tn" className="text-blue-600 hover:text-blue-500">
              Contactez notre équipe partenariat
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
