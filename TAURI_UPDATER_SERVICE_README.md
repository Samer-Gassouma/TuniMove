# Tauri Updater Service for Nqlix

## Overview

This service provides a bridge between GitHub releases and Tauri's updater system. It fetches GitHub release data and formats it according to Tauri's expected format as documented in the [Tauri v1 updater guide](https://v1.tauri.app/v1/guides/distribution/updater/).

## How It Works

### 1. GitHub Release Data
The service fetches the latest release from: `https://api.github.com/repos/Samer-Gassouma/Nqlix/releases/latest`

### 2. Tauri Updater Format
According to the Tauri documentation, the response must follow this format:

```json
{
  "version": "0.0.4",
  "notes": "Release notes here",
  "pub_date": "2025-01-20T00:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "SIGNATURE_URL",
      "url": "INSTALLER_URL"
    }
  }
}
```

### 3. Automatic Formatting
The service automatically:
- Removes the 'v' prefix from version tags
- Finds MSI and NSIS installers
- Locates corresponding signature files
- Formats the response according to Tauri's requirements

## API Endpoints

### Main Updater Endpoint
```
GET /api/updater/nqlix
```
**Purpose**: Provides the actual updater data for Tauri applications

**Response**: Tauri-compatible JSON format with platform-specific update information

### Test Endpoint
```
GET /api/updater/nqlix/test
```
**Purpose**: Shows the expected format for debugging

**Response**: Sample response showing the structure Tauri expects

## Configuration

### Nqlix Tauri Configuration
Update your `tauri.conf.json`:

```json
"updater": {
  "active": true,
  "endpoints": [
    "https://your-tunimove-domain.com/api/updater/nqlix"
  ],
  "dialog": true,
  "pubkey": "YOUR_PUBLIC_KEY"
}
```

### Environment Variables
Make sure your TuniMove deployment has access to GitHub's API.

## Deployment

### 1. Deploy TuniMove
Deploy your TuniMove application to your hosting platform (Vercel, Netlify, etc.)

### 2. Update Nqlix Configuration
Replace `https://your-tunimove-domain.com` with your actual domain in the Nqlix `tauri.conf.json`

### 3. Test the Endpoint
Visit `https://your-domain.com/api/updater/nqlix/test` to verify the format

## GitHub Actions Integration

### 1. Build with Updater Files
Ensure your GitHub Actions workflow generates the required files:
- `.msi` or `.exe` installers
- `.msi.zip.sig` or `.nsis.zip.sig` signature files

### 2. Release Process
1. Update version in `Cargo.toml` and `tauri.conf.json`
2. Commit and tag: `git tag v0.0.4 && git push origin v0.0.4`
3. GitHub Actions builds and creates release
4. TuniMove updater service automatically picks up the new release
5. Nqlix applications receive update notifications

## File Structure

```
TuniMove/
├── app/
│   └── api/
│       └── updater/
│           └── nqlix/
│               ├── route.ts          # Main updater endpoint
│               └── test/
│                   └── route.ts      # Test endpoint
└── TAURI_UPDATER_SERVICE_README.md   # This file
```

## Benefits

✅ **Automatic Formatting**: No manual JSON creation needed  
✅ **Real-time Updates**: Always serves the latest GitHub release  
✅ **Tauri Compatible**: Follows exact format requirements  
✅ **Caching**: 5-minute cache for performance  
✅ **Error Handling**: Graceful fallbacks and error responses  
✅ **Platform Detection**: Automatically finds Windows installers  

## Testing

### 1. Test the Endpoint
```bash
curl https://your-domain.com/api/updater/nqlix/test
```

### 2. Test with Real Data
```bash
curl https://your-domain.com/api/updater/nqlix
```

### 3. Verify Tauri Compatibility
The response should match the format shown in the Tauri documentation.

## Troubleshooting

### Common Issues

1. **No platforms found**: Ensure GitHub release has MSI/NSIS installers and signature files
2. **CORS errors**: The endpoint is designed for server-to-server communication
3. **Cache issues**: Endpoint caches for 5 minutes, check if data is stale

### Debug Steps

1. Check the test endpoint for format validation
2. Verify GitHub release has required assets
3. Check browser console for any errors
4. Verify the domain in Nqlix configuration

## Next Steps

1. **Deploy TuniMove** to your hosting platform
2. **Update Nqlix configuration** with the correct domain
3. **Test the updater service** endpoints
4. **Make a new release** to test the full update system
5. **Verify automatic updates** work in Nqlix applications 