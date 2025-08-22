# Station Partnership Setup

This directory contains the implementation for the Station Partnership feature in TuniMove. This feature allows new stations to submit partnership requests to join the TuniMove transportation network.

## Features

- ✅ Station partnership request form with validation
- ✅ CIN document upload (front and back) to Supabase storage
- ✅ Tunisia municipality integration for location selection
- ✅ Interactive map display using Mapbox
- ✅ Request status tracking system
- ✅ File storage organized by request number
- ✅ Real-time location mapping based on governorate/delegation

## Components

### 1. `StationPartnershipForm.tsx`
Main form component for submitting partnership requests. Includes:
- Personal information fields (name, email, phone)
- CIN document upload functionality
- Location selection (governorate/delegation)
- Interactive map preview
- Form validation using Zod schema

### 2. `RequestStatusChecker.tsx`
Component for checking the status of submitted requests. Features:
- Request lookup by request number
- Status display with visual indicators
- Request details and timeline
- Interactive map showing station location

### 3. `Map.tsx`
Reusable Mapbox component for displaying locations with markers.

## Services

### 1. `tunisia-municipality.ts`
Service for integrating with the Tunisia Municipality API:
- Fetch all governorates and delegations
- Filter by governorate or delegation
- Get coordinates for specific locations
- Find nearby municipalities

### 2. `station-partnership.ts`
Service for handling partnership requests:
- Generate unique request numbers
- Upload CIN images to Supabase storage
- Create and manage partnership requests
- Status tracking and updates

### 3. `supabase.ts`
Supabase client configuration with type definitions.

## Database Setup

Run the following SQL script in your Supabase SQL editor:

```sql
-- See scripts/setup-station-partnership.sql for complete setup
```

## Environment Variables

Add the following to your `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ajqixxzshkegeavcvmou.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1Ijoic2FtZXIyNCIsImEiOiJjbThlMTN6Z2gybDhnMmxyN3FsbHFrbDl0In0...
```

## API Endpoints

### POST `/api/station-partnership`
Create a new station partnership request.

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string", 
  "email": "string",
  "phoneNumber": "string",
  "governorate": "string",
  "delegation": "string",
  "latitude": number,
  "longitude": number
}
```

### GET `/api/station-partnership?requestNumber=SPR-123...`
Get a specific partnership request by request number.

### POST `/api/station-partnership/upload`
Upload CIN images for a partnership request.

**Form Data:**
- `requestNumber`: string
- `frontImage`: File
- `backImage`: File

## Usage

1. Navigate to `/station-partnership`
2. Fill out the partnership request form
3. Upload CIN documents (front and back)
4. Select governorate and delegation
5. Review location on the map
6. Submit the request
7. Use the request number to track status

## External APIs

### Tunisia Municipality API
Base URL: `https://tn-municipality-api.vercel.app`

**Endpoints:**
- `GET /api/municipalities` - Get all municipalities
- `GET /api/municipalities?name={governorate}` - Filter by governorate
- `GET /api/municipalities?delegation={delegation}` - Filter by delegation

### Mapbox
Used for interactive maps and location display.

## File Structure

```
/components/station-partnership/
  ├── StationPartnershipForm.tsx
  └── RequestStatusChecker.tsx

/components/map/
  └── Map.tsx

/lib/
  ├── supabase.ts
  ├── tunisia-municipality.ts
  └── station-partnership.ts

/app/station-partnership/
  └── page.tsx

/app/api/station-partnership/
  ├── route.ts
  └── upload/route.ts

/scripts/
  └── setup-station-partnership.sql
```

## Dependencies

- `@supabase/supabase-js` - Supabase client
- `mapbox-gl` - Mapbox integration
- `react-map-gl` - React Mapbox wrapper
- `@radix-ui/react-tabs` - Tab component
- `react-hook-form` - Form handling
- `zod` - Schema validation
- `@hookform/resolvers` - Zod integration

## Status Flow

1. **Pending** - Initial status when request is submitted
2. **Approved** - Request has been approved by admin
3. **Rejected** - Request has been rejected

## Security

- Row Level Security (RLS) enabled on Supabase tables
- File upload restrictions (5MB max, image types only)
- Input validation on both client and server side
- Public read access for checking request status

## Future Enhancements

- Admin dashboard for managing requests
- Email notifications for status changes
- Batch approval/rejection functionality
- Integration with station onboarding process
- Advanced search and filtering for admin panel
