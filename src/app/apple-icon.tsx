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
          background: "linear-gradient(145deg, #12100e 0%, #241f1b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 40,
          color: "#e08a58",
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
