# TuniMove GitHub Releases Setup Guide

## Overview

This guide explains how the automatic release system works for the TuniMove web application using GitHub Actions.

## How It Works

### 1. Version Management
- The version is managed in `package.json`
- When you want to release an update, increment the version number
- The version format should follow semantic versioning (e.g., `1.0.0`, `1.0.1`, `1.1.0`)

### 2. GitHub Actions Workflow
- Located at `.github/workflows/release.yml`
- Triggers automatically when you push a tag starting with "v" (e.g., `v1.0.1`)
- Builds the Next.js application
- Creates a GitHub release with the built artifacts

### 3. Release Process
- Automatically builds the application using `pnpm build`
- Includes all necessary files for deployment
- Creates a GitHub release with comprehensive release notes

## Release Process

### Step 1: Update Version
```bash
# Update version in package.json
# Example: "version": "1.0.1"
```

### Step 2: Commit and Tag
```bash
git add .
git commit -m "Release version 1.0.1"
git tag v1.0.1
git push origin main
git push origin v1.0.1
```

### Step 3: Automatic Build
- GitHub Actions automatically builds the application
- Creates optimized production build
- Generates release artifacts
- Creates a GitHub release with all files

### Step 4: Deployment
- The built application can be deployed to your hosting platform
- All necessary files are included in the release
- Easy to automate deployment from GitHub releases

## Configuration Files

### package.json
```json
{
  "name": "tunimove",
  "version": "1.0.0",  // Update this for each release
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

### .github/workflows/release.yml
- Automatically triggers on version tags
- Builds the application using pnpm
- Creates GitHub releases with all artifacts

## Included Files in Release

The release includes:
- `.next/**` - Built application files
- `public/**` - Static assets
- `package.json` - Dependencies and scripts
- `pnpm-lock.yaml` - Locked dependency versions
- Configuration files (next.config.ts, tsconfig.json, etc.)

## Benefits

1. **Automated Releases**: No manual intervention needed
2. **Version Tracking**: Clear version history on GitHub
3. **Easy Deployment**: All files needed for deployment are included
4. **Rollback Support**: Easy to rollback to previous versions
5. **Release Notes**: Automatic generation of release documentation

## Next Steps

1. Test the release process with a minor version bump
2. Set up automatic deployment from GitHub releases
3. Configure your hosting platform to use the release artifacts
4. Consider setting up automated testing before releases

## Deployment Integration

You can integrate this with various hosting platforms:
- **Vercel**: Connect your GitHub repository for automatic deployments
- **Netlify**: Use GitHub releases as deployment source
- **Custom Server**: Download and deploy from GitHub releases
- **Docker**: Build containers from release artifacts 