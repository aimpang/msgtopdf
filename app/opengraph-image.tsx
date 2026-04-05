import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MSG to PDF — Convert Outlook .MSG Files Instantly";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 50%, #1e1b4b 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "linear-gradient(135deg, #3b82f6, #6366f1, #7c3aed)",
            marginBottom: 32,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            width="40"
            height="40"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
            <path d="M14 3v5h5" />
            <path d="M9 13h6" />
            <path d="M9 17h4" />
          </svg>
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            textAlign: "center",
            lineHeight: 1.15,
          }}
        >
          MSG to PDF
        </div>
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.7)",
            marginTop: 16,
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          Convert Outlook .MSG files to clean PDFs instantly.
          No Outlook needed.
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 40,
            fontSize: 16,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          <span>Free tier available</span>
          <span>·</span>
          <span>No installs</span>
          <span>·</span>
          <span>Works in your browser</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
