'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, CheckCircle, ArrowRight, Search, MapPin } from 'lucide-react'
import RequestStatusChecker from '@/components/station-partnership/RequestStatusChecker'
import { useRouter } from 'next/navigation'

export default function StationPartnershipPage() {
  const router = useRouter()

  const handleApplyClick = () => {
    router.push('/station-partnership/request-creation')
  }

  const handleLoginClick = () => {
    router.push('/station-partnership/login')
  }

  return (
    <div className="min-h-screen relative bg-black">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black/80 to-blue-950/20" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px'
        }} />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="bg-black/80 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-white">
                  Louaj
                </h1>
              </div>
              <button
                onClick={() => router.push('/')}
                className="text-white hover:text-blue-400 transition-colors font-medium"
              >
                Back to Home
              </button>
            </div>
          </div>
        </nav>

        {/* Header Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 mb-8">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 font-medium text-sm">Station Partnership Program</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Join Our Transportation Network
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Become part of Tunisia's growing transportation network. Connect your station with thousands of travelers and grow your business.
            </p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-12">
              Why Partner With Us?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200">
                <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Reach More Customers</h3>
                <p className="text-gray-400 leading-relaxed">
                  Connect with thousands of travelers across Tunisia looking for reliable transportation options.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Digital Integration</h3>
                <p className="text-gray-400 leading-relaxed">
                  Modernize your station with our digital booking and management system.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200">
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Quality Assurance</h3>
                <p className="text-gray-400 leading-relaxed">
                  Maintain high service standards with our quality tracking and support system.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Partnership Requirements Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                Partnership Requirements
              </h2>
              <p className="text-gray-400 mb-8">
                Please ensure you meet the following requirements before applying:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-white font-medium">Valid Business License</h4>
                      <p className="text-gray-400 text-sm">
                        Must have a valid business registration in Tunisia
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-white font-medium">Physical Location</h4>
                      <p className="text-gray-400 text-sm">
                        Station must have a fixed physical location
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-white font-medium">Quality Standards</h4>
                      <p className="text-gray-400 text-sm">
                        Commitment to maintain service quality standards
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-white font-medium">Safety Compliance</h4>
                      <p className="text-gray-400 text-sm">
                        Meet safety regulations and insurance requirements
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-white font-medium">Technology Integration</h4>
                      <p className="text-gray-400 text-sm">
                        Willingness to integrate our digital platform
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-white font-medium">Customer Service</h4>
                      <p className="text-gray-400 text-sm">
                        Commitment to providing excellent customer service
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Status Check Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900/30">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                Check Your Application Status
              </h2>
              <p className="text-gray-400 mb-8">
                Enter your request number to check the status of your partnership application.
              </p>
              <RequestStatusChecker />
            </div>
          </div>
        </section>

        {/* Action Buttons Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">
              Ready to Get Started?
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleApplyClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-200"
              >
                <Building2 className="mr-2 h-5 w-5" />
                Apply for Partnership
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                onClick={handleLoginClick}
                variant="outline"
                className="border-white/20 text-blue-400 hover:bg-white/10 hover:text-white px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-200"
              >
                <Users className="mr-2 h-5 w-5 text-blue-400 hover:text-white" />
                Login to Partner Portal
              </Button>
            </div>

            <p className="text-gray-400 text-sm mt-6">
              Already in our program? Login to access your partner dashboard.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900/50 border-t border-white/10">
          <div className="max-w-6xl mx-auto text-center">
            <h3 className="text-xl font-semibold text-white mb-4">
              Questions About Partnership?
            </h3>
            <p className="text-gray-400 mb-6">
              Our partnership team is here to help you get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm text-gray-400">
              <div className="flex items-center justify-center gap-2">
                <span>📞</span>
                <span>Call us: +216 XX XXX XXX</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span>💬</span>
                <span>WhatsApp: +216 XX XXX XXX</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span>📧</span>
                <span>Email: partnerships@louaj.tn</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
