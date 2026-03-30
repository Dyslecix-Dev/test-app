import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "My App";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// TODO: update the app name, description, and styling to match your brand
export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000",
        color: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ fontSize: 72, fontWeight: 700 }}>My App</div>
      <div style={{ fontSize: 28, color: "#999", marginTop: 16 }}>My App description</div>
    </div>,
    { ...size },
  );
}
