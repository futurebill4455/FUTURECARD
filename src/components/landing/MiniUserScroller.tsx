"use client";

export type ScrollerGesture = "idle" | "reach" | "swipe" | "read";
export type LookZone = "top" | "mid" | "gallery" | "low";

const LOOK_ROTATE: Record<LookZone, number> = {
  top: -3,
  mid: 1,
  gallery: 5,
  low: 8,
};

const ARM_ROTATE: Record<ScrollerGesture, number> = {
  idle: 10,
  read: 6,
  reach: -8,
  swipe: -8,
};

export function MiniUserScroller({
  gesture,
  look,
  swipeKey,
  reduced = false,
}: {
  gesture: ScrollerGesture;
  look: LookZone;
  swipeKey: number;
  reduced?: boolean;
}) {
  const arm = reduced ? ARM_ROTATE.idle : ARM_ROTATE[gesture];
  const head = reduced ? LOOK_ROTATE.top : LOOK_ROTATE[look];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-2 right-[-2%] z-20 w-[8.75rem] origin-bottom-right sm:w-[10.75rem] md:w-[12rem] lg:w-[13.25rem]"
    >
      <svg
        viewBox="0 0 240 300"
        className="h-auto w-full drop-shadow-[0_16px_22px_rgba(0,0,0,0.48)]"
      >
        <ellipse cx="128" cy="286" rx="70" ry="11" fill="rgba(2,6,23,0.5)" />

        {/* chair — grounds the figure so they don’t float */}
        <path d="M102 186 L196 186 L190 202 L108 202 Z" fill="#1e293b" />
        <rect x="114" y="200" width="11" height="78" rx="4" fill="#0f172a" />
        <rect x="176" y="200" width="11" height="78" rx="4" fill="#0f172a" />
        <path d="M178 118 L204 186 L186 194 L164 128 Z" fill="#334155" />
        <path d="M164 128 L186 194 L176 198 L156 134 Z" fill="#1e293b" />

        {/* seated figure, slight forward lean toward the card */}
        <g style={{ transform: "rotate(-5deg)", transformOrigin: "142px 190px" }}>
          {/* thighs on the seat */}
          <path
            d="M78 188 C98 176 150 174 188 186 L184 208 C146 198 102 202 76 212 Z"
            fill="#111827"
          />
          {/* near shin + shoe */}
          <path d="M76 208 L58 262 L80 266 L92 212 Z" fill="#0f172a" />
          <ellipse cx="66" cy="266" rx="18" ry="7" fill="#134e4a" />
          {/* far shin + shoe */}
          <path d="M184 206 L192 262 L212 264 L198 208 Z" fill="#0f172a" />
          <ellipse cx="204" cy="264" rx="16" ry="6.5" fill="#134e4a" />

          {/* torso with tiny breathing */}
          <g
            className={reduced ? undefined : "origin-[140px_150px] animate-hero-breathe"}
            style={{ transformOrigin: "140px 150px" }}
          >
            <path
              d="M104 114 C96 140 100 172 118 192 L168 186 C182 166 184 136 174 112 C156 100 120 102 104 114 Z"
              fill="#0f766e"
            />
            <path
              d="M114 118 C128 108 162 108 170 120 L166 168 C146 178 124 174 116 156 Z"
              fill="#14b8a6"
            />
            <rect x="132" y="136" width="20" height="32" rx="3" fill="#0e7490" opacity="0.5" />
          </g>

          {/* relaxed far arm on the lap */}
          <path
            d="M168 126 C192 138 200 168 188 198"
            fill="none"
            stroke="#f0c7a8"
            strokeWidth="13"
            strokeLinecap="round"
          />
          <ellipse cx="186" cy="204" rx="9" ry="8" fill="#f0c7a8" />

          {/* interacting arm */}
          <g
            key={swipeKey}
            className={
              !reduced && gesture === "swipe" ? "animate-hero-swipe-once" : undefined
            }
            style={{
              transformOrigin: "112px 128px",
              transformBox: "view-box",
              transform: reduced || gesture === "swipe" ? undefined : `rotate(${arm}deg)`,
              transition: reduced
                ? "none"
                : "transform 780ms cubic-bezier(0.45, 0.05, 0.2, 1)",
            }}
          >
            <path
              d="M112 128 C72 136 42 156 32 188"
              fill="none"
              stroke="#f0c7a8"
              strokeWidth="13"
              strokeLinecap="round"
            />
            <ellipse cx="28" cy="194" rx="12" ry="10" fill="#f0c7a8" />
            <path
              d="M20 188 C10 184 8 198 18 204"
              fill="none"
              stroke="#e8b894"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
          </g>

          {/* head / gaze */}
          <g
            style={{
              transform: `rotate(${head}deg)`,
              transformOrigin: "136px 102px",
              transition: reduced
                ? "none"
                : "transform 1400ms cubic-bezier(0.45, 0.05, 0.25, 1)",
            }}
          >
            <rect x="128" y="96" width="17" height="20" rx="7" fill="#f3d0b5" />
            <circle cx="130" cy="80" r="28" fill="#f3d0b5" />
            <path d="M104 76 C110 46 150 42 158 78 C144 64 116 62 104 76" fill="#1e293b" />
            <ellipse cx="120" cy="82" rx="3.4" ry="3.8" fill="#0f172a" />
            <ellipse cx="138" cy="82" rx="3.4" ry="3.8" fill="#0f172a" />
            <circle cx="121.2" cy="80.6" r="1" fill="#fff" />
            <circle cx="139.2" cy="80.6" r="1" fill="#fff" />
            <path
              d="M122 94 Q132 98 142 94"
              fill="none"
              stroke="#b45309"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
