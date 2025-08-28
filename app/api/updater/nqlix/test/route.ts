import { NextResponse } from 'next/server';

export async function GET() {
  // This is a test endpoint to show the expected format
  const testResponse = {
    version: "0.0.4",
    notes: "This is a test release with automatic updates enabled",
    pub_date: "2025-01-20T00:00:00Z",
    platforms: {
      "windows-x86_64": {
        signature: "https://github.com/Samer-Gassouma/Nqlix/releases/download/v0.0.4/Nqlix_0.0.4_x64_en-US.msi.zip.sig",
        url: "https://github.com/Samer-Gassouma/Nqlix/releases/download/v0.0.4/Nqlix_0.0.4_x64_en-US.msi"
      }
    }
  };

  return NextResponse.json(testResponse, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  });
} 