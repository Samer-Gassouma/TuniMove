# Admin Requests Page - Station Partnership Management

## Overview
The admin requests page allows administrators to view, review, and manage station partnership requests submitted by potential partners. This page provides a comprehensive interface for reviewing all request details including personal information, CIN documents, and location data.

## Features

### 1. Request List View
- **Comprehensive List**: Shows all partnership requests with key information
- **Status Indicators**: Color-coded badges for pending, approved, and rejected requests
- **Quick Information**: Displays name, email, phone, location, and request number
- **Timestamp**: Shows when requests were created and last updated

### 2. Interactive Map
- **Location Visualization**: Mapbox integration showing all request locations
- **Status-based Markers**: Different colored markers for each request status
- **Interactive Popups**: Click markers to see request details
- **Geographic Context**: Helps admins understand the geographic distribution of requests

### 3. Detailed Request Modal
- **Complete Information**: Full request details including all form fields
- **Document Preview**: CIN front and back images (if uploaded)
- **Location Details**: Precise coordinates and delegation/governorate information
- **Status Management**: Approve or reject pending requests

### 4. Status Management
- **Approve Requests**: Change status from pending to approved
- **Reject Requests**: Change status from pending to rejected
- **Real-time Updates**: Status changes are immediately reflected in the UI
- **Audit Trail**: All status changes are tracked with timestamps

## Access

### URL
```
/admin/requests
```

### Navigation
- From admin dashboard: Click "View Partnership Requests" button
- Direct URL access (requires admin authentication)

### Authentication
- Requires valid admin session
- Redirects to login if not authenticated
- Role-based access control (ADMIN role required)

## API Endpoints

### GET /api/station-partnership/admin
- **Purpose**: Fetch all partnership requests
- **Response**: Array of request objects with full details
- **Authentication**: Required

### PATCH /api/station-partnership/admin
- **Purpose**: Update request status
- **Body**: `{ requestNumber: string, status: 'approved' | 'rejected' }`
- **Response**: Updated request object
- **Authentication**: Required

## Database Schema

The page works with the `station_partnership_requests` table:

```sql
CREATE TABLE station_partnership_requests (
    id UUID PRIMARY KEY,
    request_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    governorate VARCHAR(255) NOT NULL,
    delegation VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    cin_front_url TEXT,
    cin_back_url TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

## Mapbox Integration

### Configuration
- Uses Mapbox GL JS for interactive maps
- Access token configured in the component
- Default center: Tunisia (10.1815, 36.8065)
- Default zoom: 6 (country level)

### Features
- **Markers**: Color-coded by request status
- **Popups**: Click markers for quick request info
- **Responsive**: Map resizes with container
- **Error Handling**: Graceful fallback for map loading issues

## Usage Workflow

### 1. Review Requests
1. Navigate to `/admin/requests`
2. View the list of all partnership requests
3. Use the map to see geographic distribution
4. Click on any request to view full details

### 2. Evaluate Requests
1. Review personal information and contact details
2. Check CIN documents (front and back)
3. Verify location coordinates on the map
4. Assess the suitability of the location

### 3. Make Decision
1. For pending requests, choose Approve or Reject
2. Status changes are immediately applied
3. Request list updates in real-time
4. All changes are logged with timestamps

## Future Enhancements

### Planned Features
- **Bulk Operations**: Approve/reject multiple requests at once
- **Advanced Filtering**: Filter by status, date, location, etc.
- **Export Functionality**: Download request data as CSV/PDF
- **Notification System**: Email notifications for status changes
- **Comment System**: Add internal notes to requests
- **Workflow Management**: Multi-step approval process

### Integration Points
- **Station Creation**: Auto-create stations for approved requests
- **User Management**: Create partner accounts for approved requests
- **Communication**: Send approval/rejection emails to applicants
- **Analytics**: Track approval rates and processing times

## Technical Notes

### Dependencies
- Next.js 15.4.1
- React 19.1.0
- Mapbox GL JS 3.14.0
- Supabase client for database operations
- Tailwind CSS for styling

### Performance
- Lazy loading of map components
- Efficient marker management
- Optimized database queries
- Responsive design for mobile devices

### Security
- Row-level security (RLS) enabled
- Admin role verification
- Input validation and sanitization
- Secure file storage with Supabase

## Troubleshooting

### Common Issues
1. **Map not loading**: Check Mapbox access token
2. **Authentication errors**: Verify admin role and session
3. **Image loading issues**: Check Supabase storage permissions
4. **Status update failures**: Verify database connection

### Debug Information
- Check browser console for errors
- Verify API endpoint responses
- Confirm database table structure
- Check Supabase storage bucket configuration 