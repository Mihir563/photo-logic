import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const width = parseInt(searchParams.get("width") || "300");
  const height = parseInt(searchParams.get("height") || "200");

  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="animatedGradient" cx="50%" cy="50%" r="100%">
        <stop offset="0%" stop-color="#e0f7fa">
          <animate attributeName="stop-color" values="#e0f7fa;#c5cae9;#1e3c72;#0f2027;#e0f7fa" dur="14s" repeatCount="indefinite" />
        </stop>
        <stop offset="100%" stop-color="#0f2027">
          <animate attributeName="stop-color" values="#0f2027;#203a43;#2c5364;#c5cae9;#0f2027" dur="14s" repeatCount="indefinite" />
        </stop>
      </radialGradient>

      <filter id="textGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <rect width="100%" height="100%" fill="url(#animatedGradient)" rx="12" ry="12" />

    <text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle"
      font-size="24" fill="#ffffffdd" font-family="Futura, sans-serif"
      filter="url(#textGlow)">
      📸 No image found
    </text>

    <text x="50%" y="${
      height - 32
    }" text-anchor="middle" font-size="13" fill="#ffffffaa"
      font-family="Futura, sans-serif" opacity="0.6">
    </text>
  </svg>
  `;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store",
    },
  });
}
