import type { CSSProperties } from "react"

const sockPalettes = [
  { fill: "#fdfcf6", detail: "#d7684f" },
  { fill: "#f4c75e", detail: "#253e38" },
  { fill: "#d7684f", detail: "#fdfcf6" },
  { fill: "#7fa99c", detail: "#fdfcf6" },
]

const floatingSocks = [
  { left: 2, top: 9, size: 52, x: 170, y: 20, angle: -17, spin: 18, duration: 12.4, delay: -2.1, opacity: 0.66, palette: 0 },
  { left: 8, top: 63, size: 42, x: -140, y: -30, angle: 12, spin: -22, duration: 10.2, delay: -4.8, opacity: 0.52, palette: 2 },
  { left: 16, top: 30, size: 61, x: 120, y: -24, angle: -7, spin: 15, duration: 13.6, delay: -1.3, opacity: 0.58, palette: 1 },
  { left: 23, top: 76, size: 38, x: -175, y: -26, angle: 25, spin: -18, duration: 11.8, delay: -3.7, opacity: 0.46, palette: 3 },
  { left: 29, top: 7, size: 44, x: 145, y: 26, angle: 8, spin: 20, duration: 12.1, delay: -5.2, opacity: 0.42, palette: 2 },
  { left: 36, top: 58, size: 35, x: -110, y: 22, angle: -22, spin: 14, duration: 9.5, delay: -2.9, opacity: 0.3, palette: 0 },
  { left: 43, top: 13, size: 40, x: 190, y: -18, angle: 18, spin: -16, duration: 14.2, delay: -6.1, opacity: 0.28, palette: 3 },
  { left: 49, top: 73, size: 34, x: -135, y: -24, angle: -11, spin: 17, duration: 10.8, delay: -1.7, opacity: 0.26, palette: 1 },
  { left: 56, top: 5, size: 47, x: 125, y: 30, angle: -26, spin: 21, duration: 12.7, delay: -4.3, opacity: 0.3, palette: 0 },
  { left: 62, top: 61, size: 39, x: -165, y: 20, angle: 16, spin: -20, duration: 11.9, delay: -2.5, opacity: 0.34, palette: 2 },
  { left: 68, top: 20, size: 58, x: 115, y: -16, angle: 7, spin: 17, duration: 13.9, delay: -6.7, opacity: 0.54, palette: 3 },
  { left: 76, top: 70, size: 45, x: -190, y: -31, angle: -19, spin: -15, duration: 12.4, delay: -3.2, opacity: 0.5, palette: 1 },
  { left: 82, top: 8, size: 40, x: 150, y: 24, angle: 23, spin: -23, duration: 11.2, delay: -5.6, opacity: 0.48, palette: 2 },
  { left: 88, top: 42, size: 62, x: -155, y: 20, angle: -10, spin: 18, duration: 13.4, delay: -0.9, opacity: 0.62, palette: 0 },
  { left: 95, top: 72, size: 37, x: -125, y: -22, angle: 17, spin: -19, duration: 10.1, delay: -4.6, opacity: 0.55, palette: 3 },
]

export default function PromiseBand() {
  return (
    <section className="relative isolate flex min-h-72 w-full items-center justify-center overflow-hidden bg-[#cbd9d2] px-5 py-14 text-center text-[#142d27] md:min-h-80 md:py-16">
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        {floatingSocks.map((sock, index) => {
          const palette = sockPalettes[sock.palette]
          const style = {
            left: `${sock.left}%`,
            top: `${sock.top}%`,
            width: `${sock.size}px`,
            opacity: sock.opacity,
            "--sock-x": `${sock.x}px`,
            "--sock-y": `${sock.y}px`,
            "--sock-bend-x": `${Math.round(sock.x * 0.45)}px`,
            "--sock-bend-y": `${Math.round(sock.y * 0.55)}px`,
            "--sock-angle": `${sock.angle}deg`,
            "--sock-mid-angle": `${sock.angle - sock.spin * 0.45}deg`,
            "--sock-end-angle": `${sock.angle + sock.spin}deg`,
            "--sock-duration": `${sock.duration}s`,
            "--sock-delay": `${sock.delay}s`,
          } as CSSProperties

          return (
            <svg
              key={index}
              className="promise-floating-sock absolute h-auto"
              style={style}
              viewBox="0 0 110 145"
            >
              <path
                d="M 25 7 H 66 V 73 C 66 83 72 89 82 93 L 97 100 C 108 105 112 118 106 128 C 100 138 87 142 76 136 L 43 119 C 31 113 24 101 25 88 V 7 Z"
                fill={palette.fill}
                stroke="#253e38"
                strokeWidth="3.2"
                strokeLinejoin="round"
              />
              <path
                d="M 27 20 H 64 M 27 31 H 64"
                fill="none"
                stroke={palette.detail}
                strokeWidth="6"
              />
              <path
                d="M 34 51 H 56 M 34 61 H 56"
                fill="none"
                stroke={palette.detail}
                strokeLinecap="round"
                strokeWidth="3.5"
              />
              <path
                d="M 84 94 L 98 100 C 108 105 112 116 108 126 C 97 127 88 123 82 115 C 78 108 79 100 84 94 Z"
                fill={palette.detail}
                opacity="0.9"
              />
              <path
                d="M 26 85 C 36 84 45 89 48 98 C 51 105 49 113 43 119 C 31 113 24 101 25 88 Z"
                fill={palette.detail}
                opacity="0.9"
              />
            </svg>
          )
        })}
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-1/2 w-[min(96vw,58rem)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(203,217,210,1)_0%,rgba(203,217,210,0.97)_42%,rgba(203,217,210,0)_78%)]"
      />

      <div className="relative z-10 max-w-3xl px-3 py-6">
        <div className="mb-3 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-[#47655d]/45" />
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#47655d] md:text-xs">
            The Kofora promise
          </p>
          <span className="h-px w-8 bg-[#47655d]/45" />
        </div>
        <h2 className="text-3xl font-black uppercase leading-[0.92] tracking-[-0.04em] md:text-5xl">
          100% Comfort, Guaranteed
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm font-medium leading-relaxed text-[#253E38]/80 md:text-lg">
          Made to feel right from the first wear and every one after.
        </p>
      </div>

      <style>{`
        @keyframes promise-sock-float {
          0% {
            transform: translate3d(0, 0, 0) rotate(var(--sock-angle));
          }
          48% {
            transform: translate3d(
              var(--sock-bend-x),
              var(--sock-bend-y),
              0
            ) rotate(var(--sock-mid-angle));
          }
          100% {
            transform: translate3d(var(--sock-x), var(--sock-y), 0)
              rotate(var(--sock-end-angle));
          }
        }

        .promise-floating-sock {
          animation: promise-sock-float var(--sock-duration) ease-in-out
            var(--sock-delay) infinite alternate;
          transform: rotate(var(--sock-angle));
          transform-origin: center;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .promise-floating-sock {
            animation: none;
          }
        }
      `}</style>
    </section>
  )
}
