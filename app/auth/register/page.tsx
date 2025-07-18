"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Phone, Lock, User, Mail, ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    phoneNumber: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    email: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: Registration, 2: Phone Verification
  const [verificationCode, setVerificationCode] = useState("");
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/v1/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formData.phoneNumber,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
          email: formData.email || undefined, // Send only if provided
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Move to phone verification step
        setStep(2);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/v1/users/verify-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formData.phoneNumber,
          verificationCode: verificationCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Phone verified successfully, redirect to login
        router.push('/auth/login?message=Account created successfully. Please sign in.');
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    try {
      await fetch('/api/v1/users/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formData.phoneNumber,
        }),
      });
    } catch (error) {
      console.error('Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen relative bg-black">
      {/* Particle Background */}
      <div className="fixed inset-0 z-0">
        <ParticleBackground 
          particleColor="rgba(34, 197, 94, 0.6)"
          connectionColor="rgba(34, 197, 94, 0.2)"
        />
      </div>

      {/* Background Gradient */}
      <div className="fixed inset-0 z-1 bg-gradient-to-br from-green-900/30 via-slate-900/50 to-blue-900/30" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-3 sm:p-6">
        <Card className="w-full max-w-md backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-600/50 shadow-2xl">
          {step === 1 ? (
            <>
              <CardHeader className="text-center p-4 sm:p-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <UserPlus className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                
                <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent">
                  Create Account
                </CardTitle>
                <CardDescription className="text-gray-400 text-base sm:text-lg">
                  Join TuniMove and start your journey
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {error && (
                    <div className="p-3 sm:p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        First Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="text"
                          name="firstName"
                          placeholder="First name"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="h-11 sm:h-12 pl-12 text-base sm:text-lg bg-slate-800/50 border-slate-600 focus:border-green-400 text-white placeholder-gray-400"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Last Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="text"
                          name="lastName"
                          placeholder="Last name"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="h-11 sm:h-12 pl-12 text-base sm:text-lg bg-slate-800/50 border-slate-600 focus:border-green-400 text-white placeholder-gray-400"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="tel"
                        name="phoneNumber"
                        placeholder="+216 XX XXX XXX"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="h-11 sm:h-12 pl-12 text-base sm:text-lg bg-slate-800/50 border-slate-600 focus:border-green-400 text-white placeholder-gray-400"
                        required
                      />
                    </div>
                  </div>

                  {/* Email (Optional) */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Email Address <span className="text-gray-500">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="h-11 sm:h-12 pl-12 text-base sm:text-lg bg-slate-800/50 border-slate-600 focus:border-green-400 text-white placeholder-gray-400"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="h-11 sm:h-12 pl-12 pr-12 text-base sm:text-lg bg-slate-800/50 border-slate-600 focus:border-green-400 text-white placeholder-gray-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="h-11 sm:h-12 pl-12 pr-12 text-base sm:text-lg bg-slate-800/50 border-slate-600 focus:border-green-400 text-white placeholder-gray-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-11 sm:h-12 text-base sm:text-lg font-semibold rounded-xl bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-xl"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Create Account
                      </>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-4 sm:my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-slate-900 px-4 text-gray-400">Already have an account?</span>
                  </div>
                </div>

                {/* Login Link */}
                <Link href="/auth/login">
                  <Button 
                    variant="outline"
                    className="w-full h-11 sm:h-12 text-base sm:text-lg font-semibold rounded-xl border-2 border-slate-600 text-gray-300 hover:bg-slate-800 hover:text-white hover:border-slate-500 transition-all duration-300"
                  >
                    Sign In Instead
                  </Button>
                </Link>
              </CardContent>
            </>
          ) : (
            <>
              {/* Phone Verification Step */}
              <CardHeader className="text-center p-4 sm:p-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                
                <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent">
                  Verify Phone
                </CardTitle>
                <CardDescription className="text-gray-400 text-base sm:text-lg">
                  Enter the code sent to {formData.phoneNumber}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 sm:p-6">
                <form onSubmit={handleVerification} className="space-y-4 sm:space-y-6">
                  {error && (
                    <div className="p-3 sm:p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Verification Code
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="h-11 sm:h-12 text-base sm:text-lg text-center bg-slate-800/50 border-slate-600 focus:border-green-400 text-white placeholder-gray-400"
                      maxLength={6}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-11 sm:h-12 text-base sm:text-lg font-semibold rounded-xl bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-xl"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Verify & Complete
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={resendCode}
                      className="text-green-400 hover:text-green-300 transition-colors text-sm"
                    >
                      Didn't receive code? Resend
                    </button>
                  </div>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
} 