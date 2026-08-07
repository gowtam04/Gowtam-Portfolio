import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 120,
          background: "linear-gradient(145deg, #0b1218 0%, #1a2430 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 40,
          color: "#3db8d4",
          fontFamily: "system-ui, sans-serif",
          fontWeight: 700,
        }}
      >
        G
      </div>
    ),
    {
      ...size,
    }
  );
}
