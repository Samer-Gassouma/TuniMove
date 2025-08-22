'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Upload, MapPin, CheckCircle, RotateCcw, X, Eye } from 'lucide-react'
import Map from '@/components/map/Map'
import ImagePreviewModal from '@/components/ui/image-preview-modal'
import { TunisiaMunicipalityService, type Governorate, type Delegation } from '@/lib/tunisia-municipality'
import { StationPartnershipService } from '@/lib/station-partnership'

const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().min(8, 'Phone number must be at least 8 digits'),
  governorate: z.string().min(1, 'Please select a governorate'),
  delegation: z.string().min(1, 'Please select a delegation'),
  cinFront: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    'File size must be less than 5MB'
  ),
  cinBack: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    'File size must be less than 5MB'
  ),
})

type FormData = z.infer<typeof formSchema>

export default function StationPartnershipForm() {
  const [governorates, setGovernorates] = useState<Governorate[]>([])
  const [selectedGovernorate, setSelectedGovernorate] = useState<Governorate | null>(null)
  const [delegations, setDelegations] = useState<Delegation[]>([])
  const [selectedDelegation, setSelectedDelegation] = useState<Delegation | null>(null)
  const [mapLocation, setMapLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [customLocation, setCustomLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [isLocationCustomized, setIsLocationCustomized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [requestNumber, setRequestNumber] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [cinFrontPreview, setCinFrontPreview] = useState<string | null>(null)
  const [cinBackPreview, setCinBackPreview] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState<{ front: boolean; back: boolean }>({
    front: false,
    back: false
  })
  const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; imageUrl: string; title: string }>({
    isOpen: false,
    imageUrl: '',
    title: ''
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  })

  const watchedGovernorate = watch('governorate')
  const watchedDelegation = watch('delegation')

  // Load governorates on component mount
  useEffect(() => {
    const loadGovernorates = async () => {
      try {
        const data = await TunisiaMunicipalityService.getAllMunicipalities()
        setGovernorates(data)
      } catch (error) {
        console.error('Failed to load governorates:', error)
        setError('Failed to load location data. Please refresh the page.')
      }
    }
    loadGovernorates()
  }, [])

  // Update delegations when governorate changes
  useEffect(() => {
    if (watchedGovernorate && governorates.length > 0) {
      const governorate = governorates.find(gov => gov.Value === watchedGovernorate)
      if (governorate) {
        setSelectedGovernorate(governorate)
        setDelegations(governorate.Delegations)
        setValue('delegation', '') // Reset delegation selection
        setSelectedDelegation(null)
        setMapLocation(null)
      }
    }
  }, [watchedGovernorate, governorates, setValue])

  // Update map location when delegation changes
  useEffect(() => {
    if (watchedDelegation && selectedGovernorate) {
      const delegation = delegations.find(del => del.Value === watchedDelegation)
      if (delegation) {
        setSelectedDelegation(delegation)
        const newLocation = {
          latitude: delegation.Latitude,
          longitude: delegation.Longitude
        }
        setMapLocation(newLocation)
        setCustomLocation(null)
        setIsLocationCustomized(false)
      }
    }
  }, [watchedDelegation, selectedGovernorate, delegations])

  // Handle marker drag
  const handleMarkerDrag = (lat: number, lng: number) => {
    setCustomLocation({ latitude: lat, longitude: lng })
    setIsLocationCustomized(true)
  }

  // Handle map click
  const handleMapClick = (lat: number, lng: number) => {
    setCustomLocation({ latitude: lat, longitude: lng })
    setIsLocationCustomized(true)
  }

  // Reset to original location
  const resetToOriginalLocation = () => {
    setCustomLocation(null)
    setIsLocationCustomized(false)
  }

  // Get the current display location (custom or original)
  const currentLocation = customLocation || mapLocation

  // Handle file upload and preview
  const handleFileUpload = (file: File, type: 'front' | 'back') => {
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setError(`Invalid file type for CIN ${type}. Please upload a JPEG, PNG, or WebP image.`)
        return
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(`File size too large for CIN ${type}. Maximum size is 5MB.`)
        return
      }

      // Clear any previous error
      setError('')
      
      // Set loading state
      if (type === 'front') {
        setImageLoading(prev => ({ ...prev, front: true }))
      } else {
        setImageLoading(prev => ({ ...prev, back: true }))
      }
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      
      if (type === 'front') {
        // Clean up previous preview
        if (cinFrontPreview) {
          URL.revokeObjectURL(cinFrontPreview)
        }
        setCinFrontPreview(previewUrl)
        setValue('cinFront', file)
      } else {
        // Clean up previous preview
        if (cinBackPreview) {
          URL.revokeObjectURL(cinBackPreview)
        }
        setCinBackPreview(previewUrl)
        setValue('cinBack', file)
      }
    }
  }

  // Remove file preview
  const removeFilePreview = (type: 'front' | 'back') => {
    if (type === 'front') {
      if (cinFrontPreview) {
        URL.revokeObjectURL(cinFrontPreview)
        setCinFrontPreview(null)
      }
      setImageLoading(prev => ({ ...prev, front: false }))
      setValue('cinFront', undefined as any)
    } else {
      if (cinBackPreview) {
        URL.revokeObjectURL(cinBackPreview)
        setCinBackPreview(null)
      }
      setImageLoading(prev => ({ ...prev, back: false }))
      setValue('cinBack', undefined as any)
    }
  }

  // Open preview modal
  const openPreviewModal = (imageUrl: string, title: string) => {
    setPreviewModal({ isOpen: true, imageUrl, title })
  }

  // Close preview modal
  const closePreviewModal = () => {
    setPreviewModal({ isOpen: false, imageUrl: '', title: '' })
  }

  // Cleanup preview URLs on component unmount
  useEffect(() => {
    return () => {
      if (cinFrontPreview) URL.revokeObjectURL(cinFrontPreview)
      if (cinBackPreview) URL.revokeObjectURL(cinBackPreview)
    }
  }, [cinFrontPreview, cinBackPreview])

  const onSubmit = async (data: FormData) => {
    if (!currentLocation) {
      setError('Please select both governorate and delegation to determine the location.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Generate request number
      const newRequestNumber = StationPartnershipService.generateRequestNumber()
      
      // Upload CIN images
      const { frontUrl, backUrl } = await StationPartnershipService.uploadCinImages(
        newRequestNumber,
        data.cinFront,
        data.cinBack
      )

      // Create the request
      await StationPartnershipService.createRequest({
        request_number: newRequestNumber,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone_number: data.phoneNumber,
        governorate: data.governorate,
        delegation: data.delegation,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        cin_front_url: frontUrl,
        cin_back_url: backUrl
      })

      setRequestNumber(newRequestNumber)
      setIsSubmitted(true)
      
      // Clear previews and reset form
      if (cinFrontPreview) {
        URL.revokeObjectURL(cinFrontPreview)
        setCinFrontPreview(null)
      }
      if (cinBackPreview) {
        URL.revokeObjectURL(cinBackPreview)
        setCinBackPreview(null)
      }
      setImageLoading({ front: false, back: false })
      
      reset()
    } catch (error) {
      console.error('Error submitting form:', error)
      setError('Failed to submit request. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">Demande soumise avec succès !</CardTitle>
          <CardDescription>
            Votre demande de partenariat de station a été soumise pour examen.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Numéro de demande :</p>
            <p className="text-xl font-bold text-blue-600">{requestNumber}</p>
            <p className="text-sm text-gray-500 mt-2">
              Veuillez sauvegarder ce numéro pour suivre le statut de votre demande.
            </p>
          </div>
          <div className="my-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /></svg>
              <span className="text-base text-green-700 font-semibold">Nous vous contacterons sous 2 à 3 jours ouvrables.</span>
            </div>
            <p className="text-sm text-gray-500">Notre équipe vous contactera via les coordonnées fournies.</p>
          </div>
          <div className="mt-8">
            <h4 className="text-lg font-semibold text-green-700 mb-3">Contactez-nous</h4>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="mailto:support@tunimove.com"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium shadow hover:scale-105 transition-transform"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12l-4-4-4 4m8 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6" /></svg>
                Email
              </a>
              <a
                href="tel:+21612345678"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium shadow hover:scale-105 transition-transform"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 10a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2zm10-10a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 10a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                Téléphone
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-3">Pour toute demande urgente, veuillez utiliser les options de contact ci-dessus.</p>
          </div>
          <Button 
            onClick={() => {
              setIsSubmitted(false)
              setRequestNumber('')
              setCinFrontPreview(null)
              setCinBackPreview(null)
              setImageLoading({ front: false, back: false })
            }}
            variant="outline"
            className="mt-4"
          >
            Soumettre une autre demande
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Station Partnership Request</CardTitle>
        <CardDescription>
          Join our transportation network by submitting a partnership request for your station.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  placeholder="Enter your first name"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  placeholder="Enter your last name"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  {...register('phoneNumber')}
                  placeholder="Enter your phone number"
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-600">{errors.phoneNumber.message}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* CIN Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Identity Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cinFront">CIN Front</Label>
                {cinFrontPreview ? (
                  <div className="relative border-2 border-blue-300 rounded-lg p-2 bg-blue-50">
                    <div className="relative group">
                      <div className="w-full h-32 bg-gray-100 rounded overflow-hidden">
                        <img 
                          src={cinFrontPreview} 
                          alt="CIN Front Preview" 
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => openPreviewModal(cinFrontPreview, 'CIN Front')}
                          onLoad={() => setImageLoading(prev => ({ ...prev, front: false }))}
                          onError={(e) => {
                            console.error('Error loading front image:', e)
                            setError('Failed to load CIN front image. Please try uploading again.')
                            removeFilePreview('front')
                          }}
                          style={{ 
                            display: imageLoading.front ? 'none' : 'block',
                            minHeight: '128px',
                            backgroundColor: '#f3f4f6'
                          }}
                        />
                        {imageLoading.front && (
                          <div className="w-full h-full flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            openPreviewModal(cinFrontPreview, 'CIN Front')
                          }}
                          className="opacity-0 group-hover:opacity-100 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-all duration-200"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFilePreview('front')
                          }}
                          className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      ✅ CIN Front uploaded successfully
                    </p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <Upload className="mx-auto w-8 h-8 text-gray-400 mb-2" />
                    <Input
                      id="cinFront"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleFileUpload(file, 'front')
                        }
                      }}
                    />
                    <Label htmlFor="cinFront" className="cursor-pointer">
                      <span className="text-sm text-blue-600 hover:text-blue-500">
                        Upload CIN Front Image
                      </span>
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">Max file size: 5MB (JPEG, PNG, WebP)</p>
                  </div>
                )}
                {errors.cinFront && (
                  <p className="text-sm text-red-600">{errors.cinFront.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cinBack">CIN Back</Label>
                {cinBackPreview ? (
                  <div className="relative border-2 border-blue-300 rounded-lg p-2 bg-blue-50">
                    <div className="relative group">
                      <div className="w-full h-32 bg-gray-100 rounded overflow-hidden">
                        <img 
                          src={cinBackPreview} 
                          alt="CIN Back Preview" 
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => openPreviewModal(cinBackPreview, 'CIN Back')}
                          onLoad={() => setImageLoading(prev => ({ ...prev, back: false }))}
                          onError={(e) => {
                            console.error('Error loading back image:', e)
                            setError('Failed to load CIN back image. Please try uploading again.')
                            removeFilePreview('back')
                          }}
                          style={{ 
                            display: imageLoading.back ? 'none' : 'block',
                            minHeight: '128px',
                            backgroundColor: '#f3f4f6'
                          }}
                        />
                        {imageLoading.back && (
                          <div className="w-full h-full flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            openPreviewModal(cinBackPreview, 'CIN Back')
                          }}
                          className="opacity-0 group-hover:opacity-100 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-all duration-200"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFilePreview('back')
                          }}
                          className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      ✅ CIN Back uploaded successfully
                    </p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <Upload className="mx-auto w-8 h-8 text-gray-400 mb-2" />
                    <Input
                      id="cinBack"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleFileUpload(file, 'back')
                        }
                      }}
                    />
                    <Label htmlFor="cinBack" className="cursor-pointer">
                      <span className="text-sm text-blue-600 hover:text-blue-500">
                        Upload CIN Back Image
                      </span>
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">Max file size: 5MB (JPEG, PNG, WebP)</p>
                  </div>
                )}
                {errors.cinBack && (
                  <p className="text-sm text-red-600">{errors.cinBack.message}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Location Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Station Location
              <span className="text-sm font-normal text-gray-500">(Click or drag to customize)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="governorate">Governorate</Label>
                <Select onValueChange={(value) => setValue('governorate', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select governorate" />
                  </SelectTrigger>
                  <SelectContent>
                    {governorates.map((gov) => (
                      <SelectItem key={gov.Value} value={gov.Value}>
                        {gov.Name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.governorate && (
                  <p className="text-sm text-red-600">{errors.governorate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="delegation">Delegation</Label>
                <Select 
                  onValueChange={(value) => setValue('delegation', value)}
                  disabled={!selectedGovernorate}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select delegation" />
                  </SelectTrigger>
                  <SelectContent>
                    {delegations.map((del, index) => (
                      <SelectItem key={`${del.Value}-${index}`} value={del.Value}>
                        {del.Name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.delegation && (
                  <p className="text-sm text-red-600">{errors.delegation.message}</p>
                )}
              </div>
            </div>

            {/* Map */}
            {currentLocation && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Station Location Preview</Label>
                  {isLocationCustomized && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={resetToOriginalLocation}
                      className="text-xs"
                    >
                      Reset to Original
                    </Button>
                  )}
                </div>
                <div className="mt-2 border rounded-lg overflow-hidden">
                  <Map
                    latitude={currentLocation.latitude}
                    longitude={currentLocation.longitude}
                    zoom={14}
                    className="h-64"
                    showMarker={true}
                    markerColor="#3B82F6"
                    draggable={true}
                    clickable={true}
                    onMarkerDrag={handleMarkerDrag}
                    onMapClick={handleMapClick}
                  />
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-500">
                    Location: {selectedDelegation?.Name}, {selectedGovernorate?.Name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Coordinates: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                  </p>
                  {isLocationCustomized && (
                    <p className="text-xs text-blue-600 font-medium">
                      📍 Location has been customized by dragging the marker
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Tip: Drag the marker or click anywhere on the map to set your station's exact location
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting Request...
              </>
            ) : (
              'Submit Partnership Request'
            )}
          </Button>
        </form>
      </CardContent>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={previewModal.isOpen}
        imageUrl={previewModal.imageUrl}
        imageTitle={previewModal.title}
        onClose={closePreviewModal}
      />
    </Card>
  )
}
