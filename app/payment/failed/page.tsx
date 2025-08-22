"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { XCircle, ArrowLeft, CreditCard, AlertTriangle, RefreshCw, Phone, Mail, HelpCircle } from "lucide-react";
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

interface FailedBookingDetails {
  paymentRef: string;
  error?: string;
  timestamp: string;
}

export default function PaymentFailedPage() {
  const [failedDetails, setFailedDetails] = useState<FailedBookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const paymentRef = searchParams.get('payment_ref');
    const error = searchParams.get('error');
    
    console.log('❌ Payment failed page loaded:', { paymentRef, error });

    if (paymentRef) {
      setFailedDetails({
        paymentRef,
        error: error || 'Payment processing failed',
        timestamp: new Date().toISOString()
      });
    }
    
    setLoading(false);
  }, [searchParams]);

  const handleTryAgain = () => {
    router.push('/book-trip');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleContactSupport = () => {
    // You can implement support contact functionality here
    console.log('Contact support clicked');
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <ParticleBackground />
        <Card className="w-full max-w-md backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-600/50">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mx-auto mb-4"></div>
            <p className="text-white">Processing payment status...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <ParticleBackground />
      
      <div className="relative z-10 max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <XCircle className="w-20 h-20 text-red-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Payment Failed
          </h1>
          <p className="text-gray-400 text-lg">
            Unfortunately, your payment could not be processed.
          </p>
        </div>

        {/* Main Error Card */}
        <Card className="mb-6 backdrop-blur-xl bg-gradient-to-br from-red-800/20 to-red-900/20 border border-red-600/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  Payment Processing Failed
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {failedDetails?.paymentRef && (
                    <>Payment Reference: <span className="font-mono text-white">{failedDetails.paymentRef}</span></>
                  )}
                </CardDescription>
              </div>
              <Badge className="bg-red-500/20 border-red-500/40 text-red-400 text-sm px-3 py-1">
                FAILED
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Error Details */}
              <div className="p-4 bg-black/20 rounded-lg border border-red-500/30">
                <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  Error Details
                </h3>
                <p className="text-gray-300">
                  {failedDetails?.error || 'An unexpected error occurred during payment processing.'}
                </p>
                {failedDetails?.timestamp && (
                  <p className="text-gray-400 text-sm mt-2">
                    Failed at: {formatDate(failedDetails.timestamp)}
                  </p>
                )}
              </div>

              {/* Common Reasons */}
              <div className="p-4 bg-black/20 rounded-lg">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-yellow-400" />
                  Common Reasons for Payment Failure
                </h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    Insufficient funds in your account
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    Card was declined by your bank
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    Incorrect payment information entered
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    Network connection issues during payment
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    Payment gateway temporary unavailability
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps Card */}
        <Card className="mb-6 backdrop-blur-xl bg-gradient-to-br from-blue-800/20 to-blue-900/20 border border-blue-600/50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              What You Can Do Next
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold mt-1">
                  1
                </div>
                <div>
                  <h4 className="text-white font-medium">Check Your Payment Method</h4>
                  <p className="text-gray-400 text-sm">
                    Verify that your card has sufficient funds and is not expired.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold mt-1">
                  2
                </div>
                <div>
                  <h4 className="text-white font-medium">Try a Different Payment Method</h4>
                  <p className="text-gray-400 text-sm">
                    Use an alternative card or payment option if available.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold mt-1">
                  3
                </div>
                <div>
                  <h4 className="text-white font-medium">Contact Your Bank</h4>
                  <p className="text-gray-400 text-sm">
                    Your bank may have blocked the transaction for security reasons.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold mt-1">
                  4
                </div>
                <div>
                  <h4 className="text-white font-medium">Try Again Later</h4>
                  <p className="text-gray-400 text-sm">
                    Wait a few minutes and attempt the booking again.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Contact Card */}
        <Card className="mb-6 backdrop-blur-xl bg-gradient-to-br from-purple-800/20 to-purple-900/20 border border-purple-600/50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Need Help?
            </h3>
            <p className="text-gray-300 mb-4">
              If you continue to experience issues, our customer support team is here to help.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-black/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4 text-green-400" />
                  <span className="text-gray-400 text-sm">Phone Support</span>
                </div>
                <p className="text-white font-mono">+216 XX XXX XXX</p>
                <p className="text-gray-400 text-xs">Available 24/7</p>
              </div>
              
              <div className="p-3 bg-black/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400 text-sm">Email Support</span>
                </div>
                <p className="text-white">support@tunimove.tn</p>
                <p className="text-gray-400 text-xs">Response within 2 hours</p>
              </div>
            </div>
            
            {failedDetails?.paymentRef && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  <strong>When contacting support, please provide this reference:</strong>
                </p>
                <p className="text-white font-mono text-sm mt-1">{failedDetails.paymentRef}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleTryAgain}
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Booking Again
            </Button>
            
            <Button 
              onClick={handleContactSupport}
              variant="outline"
              className="flex-1 h-12 border-purple-600 text-purple-400 hover:bg-purple-600/10"
            >
              <Phone className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </div>
          
          <Button 
            onClick={handleBackToDashboard}
            variant="outline"
            className="w-full h-12 border-slate-600 hover:bg-slate-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Security Notice */}
        <div className="mt-8 p-4 bg-slate-800/30 rounded-lg border border-slate-600/30">
          <p className="text-gray-400 text-xs text-center">
            🔒 Your payment information is secure and was not stored. No charges have been made to your account.
          </p>
        </div>
      </div>
    </div>
  );
}
