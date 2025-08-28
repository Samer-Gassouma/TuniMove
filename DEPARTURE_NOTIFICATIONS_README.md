# 🚌 Departure Notification System

## Overview
The TuniMove departure notification system provides real-time alerts to users about their upcoming trips. Users receive notifications at strategic intervals to ensure they arrive at the station on time.

## 🎯 Features

### 1. **Automatic Countdown Timer**
- Real-time countdown showing hours, minutes, and seconds until departure
- Visual urgency indicators (colors change based on time remaining)
- Pulsing animation when time is critical (<30 minutes)

### 2. **Smart Notification System**
- **1 Hour Reminder**: Early warning to start preparing
- **30 Minutes Reminder**: Urgent reminder to hurry to station
- **10 Minutes Reminder**: Critical alert - must be at station NOW

### 3. **Browser Notifications**
- Native browser notifications with custom icons
- Interactive notifications with action buttons
- Persistent notifications that require user interaction
- Auto-dismiss after 10 seconds

### 4. **Service Worker Integration**
- Background notification handling
- Offline notification support
- Push notification subscription capability
- Background sync for missed notifications

### 5. **User Preferences**
- Enable/disable specific reminder times
- Sound and vibration settings
- Notification permission management
- Settings persistence

## 🔧 Technical Implementation

### Components

#### 1. **CountdownTimer**
```tsx
<CountdownTimer 
  estimatedArrivalTime={booking.estimatedArrivalTime} 
  bookingId={booking.id}
  departureStation={booking.departureStation.name}
  destinationStation={booking.destinationStation.name}
/>
```

**Features:**
- Real-time countdown updates every second
- Automatic notification triggers at specified intervals
- Visual urgency indicators
- Event message logging to backend

#### 2. **NotificationPermissionRequest**
- Requests browser notification permission
- Registers service worker
- Sends test notification on success
- User-friendly permission flow

#### 3. **NotificationStatusIndicator**
- Shows current notification permission status
- Real-time status updates
- Visual feedback for enabled/disabled state

#### 4. **NotificationSettings**
- Toggle individual reminder times
- Sound and vibration preferences
- Settings persistence
- User control over notification behavior

### Services

#### 1. **NotificationService** (`/lib/notificationService.ts`)
- Singleton service for notification management
- Service worker registration
- Permission handling
- Notification sending with fallbacks

#### 2. **Service Worker** (`/public/sw.js`)
- Background notification handling
- Push notification support
- Offline notification queuing
- Background sync capabilities

### API Endpoints

#### 1. **Event Messages** (`/api/notifications/event`)
```typescript
POST /api/notifications/event
{
  "bookingId": "string",
  "eventType": "DEPARTURE_1HOUR" | "DEPARTURE_30MIN" | "DEPARTURE_10MIN",
  "message": "string",
  "timestamp": "ISO string"
}
```

**Event Types:**
- `DEPARTURE_1HOUR`: 1 hour before departure
- `DEPARTURE_30MIN`: 30 minutes before departure
- `DEPARTURE_10MIN`: 10 minutes before departure

## 📱 Notification Flow

### 1. **Permission Request**
1. User visits booking details page
2. System checks notification permission
3. If not granted, shows permission request button
4. User clicks to enable notifications
5. Service worker registers
6. Test notification sent

### 2. **Countdown Monitoring**
1. Countdown timer starts when page loads
2. System monitors time remaining every second
3. At specific intervals, notifications are triggered
4. Each notification type is sent only once per booking

### 3. **Notification Delivery**
1. Browser notification displayed
2. Event message sent to backend API
3. Notification logged for analytics
4. User can interact with notification

## 🎨 UI Components

### Countdown Display
- **Normal State**: Red/orange colors
- **Warning State** (≤60 min): Enhanced orange borders
- **Urgent State** (≤30 min): Enhanced red borders + pulsing animation

### Notification Elements
- **Permission Request**: Blue gradient with info icon
- **Status Indicator**: Green/red based on permission
- **Settings Panel**: Collapsible preferences interface

## 🔒 Security & Privacy

### Permission Handling
- Explicit user consent required
- No automatic permission requests
- Clear permission status display
- Easy permission management

### Data Protection
- Notifications only sent for user's own bookings
- Event messages logged for audit purposes
- No personal data in notification content
- Secure API endpoints with authentication

## 🚀 Future Enhancements

### 1. **Push Notifications**
- Server-sent push notifications
- VAPID key integration
- Cross-device notification sync

### 2. **SMS Integration**
- Fallback SMS notifications
- Phone number verification
- Carrier-specific optimizations

### 3. **Advanced Scheduling**
- Custom reminder times
- Timezone handling
- Calendar integration

### 4. **Analytics & Insights**
- Notification engagement metrics
- User behavior analysis
- Performance optimization

## 📋 Usage Instructions

### For Users
1. **Enable Notifications**: Click "Enable Notifications" button
2. **Grant Permission**: Allow notifications in browser popup
3. **Customize Settings**: Adjust reminder preferences
4. **Receive Alerts**: Get automatic departure reminders

### For Developers
1. **Import Service**: `import { notificationService } from "@/lib/notificationService"`
2. **Register Service Worker**: `await notificationService.registerServiceWorker()`
3. **Request Permission**: `await notificationService.requestPermission()`
4. **Send Notifications**: `await notificationService.sendNotification(title, body)`

## 🐛 Troubleshooting

### Common Issues
1. **Notifications not working**: Check browser permission settings
2. **Service worker not registering**: Ensure HTTPS or localhost
3. **Permission denied**: Clear browser data and try again
4. **Notifications delayed**: Check system notification settings

### Debug Mode
- Open browser console for detailed logs
- Check service worker status in DevTools
- Verify API endpoint responses
- Monitor notification permission state

## 📚 Dependencies

- **Next.js**: Framework and API routes
- **React**: Component library and hooks
- **TypeScript**: Type safety and interfaces
- **Service Worker API**: Background processing
- **Notification API**: Browser notifications
- **Push API**: Future push notification support

## 🔄 Browser Support

- **Chrome**: Full support (service worker + notifications)
- **Firefox**: Full support (service worker + notifications)
- **Safari**: Limited support (notifications only)
- **Edge**: Full support (service worker + notifications)
- **Mobile**: Partial support (varies by browser)

---

*This system ensures users never miss their departure times while providing a seamless and user-friendly experience.* 