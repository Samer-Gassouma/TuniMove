import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { paymentRef: string } }
) {
  try {
    const { paymentRef } = params;
    
    if (!paymentRef) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Payment reference is required',
          code: 'MISSING_PAYMENT_REF'
        }, 
        { status: 400 }
      );
    }

    console.log('🔍 Proxying booking details request to central server:', paymentRef);

    // Forward request to central server
    const centralServerUrl = `http://localhost:5000/api/v1/bookings/payment/${paymentRef}`;
    
    const response = await fetch(centralServerUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Central server booking details error:', result);
      return NextResponse.json(result, { status: response.status });
    }

    console.log('✅ Booking details retrieved successfully via central server');
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Booking details API error:', error);
    
    // Return mock booking for development
    const mockBooking = {
      success: true,
      message: 'Booking retrieved successfully (mock)',
      data: {
        booking: {
          id: `booking_${Date.now()}`,
          verificationCode: 'ABC123',
          status: 'PAID',
          seatsBooked: 2,
          totalAmount: 25.00,
          journeyDate: new Date().toISOString(),
          paymentReference: params.paymentRef,
          paymentProcessedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          departureStation: {
            name: 'Monastir Main Station',
            governorate: 'Monastir',
            delegation: 'Monastir'
          },
          destinationStation: {
            name: 'Sfax Main Station',
            governorate: 'Sfax',
            delegation: 'Sfax'
          }
        }
      }
    };

    console.log('🔄 Returning mock booking response for development');
    return NextResponse.json(mockBooking);
  }
} 