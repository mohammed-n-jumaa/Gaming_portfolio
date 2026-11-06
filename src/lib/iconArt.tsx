import { ImageResponse } from "next/og";
import { PORTRAIT } from "./content";

// Head box on the 800×800 source photo (hair to chin): x 230–590, y 85–445
const FACE = { x: 230, y: 85, size: 360 };

/** Tab / home-screen icon: the face cropped from PORTRAIT inside an accent ring. Rendered at build time. */
export function faceIcon(px: number) {
  const ring = Math.max(2, Math.round(px * 0.07));
  const inner = px - ring * 2;
  const scale = inner / FACE.size;
  return new ImageResponse(
    (
      <div
        style={{
          width: px,
          height: px,
          borderRadius: "50%",
          background: "#d100d1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: inner,
            height: inner,
            borderRadius: "50%",
            overflow: "hidden",
            background: "#ffffff",
            display: "flex",
            position: "relative",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PORTRAIT}
            width={800 * scale}
            height={800 * scale}
            style={{ position: "absolute", left: -FACE.x * scale, top: -FACE.y * scale }}
            alt=""
          />
        </div>
      </div>
    ),
    { width: px, height: px }
  );
}
