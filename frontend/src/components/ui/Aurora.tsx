import React from 'react';

interface AuroraProps {
  colorStops?: string[];
  blend?: number;
  amplitude?: number;
  speed?: number;
}

export default function Aurora({
  colorStops = ["#D4453A", "#EEB68A", "#5D4037"],
  blend = 0.6,
  amplitude = 1.0,
  speed = 1.0,
}: AuroraProps) {
  return (
    <div className="aurora-wrapper pointer-events-none">
      <div className="aurora-gradient"></div>
      <div className="aurora-noise"></div>
      <style jsx>{`
        .aurora-wrapper {
          position: absolute;
          inset: 0;
          overflow: hidden;
          background: #1A0F0A;
          z-index: 0;
        }
        .aurora-gradient {
          position: absolute;
          width: 200vw;
          height: 200vh;
          top: -50vh;
          left: -50vw;
          background-image: 
            radial-gradient(circle at 15% 50%, rgba(212, 69, 58, 0.45) 0%, transparent 40%),
            radial-gradient(circle at 85% 30%, rgba(238, 182, 138, 0.35) 0%, transparent 40%),
            radial-gradient(circle at 50% 80%, rgba(93, 64, 55, 0.5) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(139, 126, 116, 0.3) 0%, transparent 40%);
          animation: auroraAnimation ${20 / speed}s ease-in-out infinite alternate;
          filter: blur(100px);
          opacity: ${blend};
          transform: scale(${amplitude});
        }
        .aurora-noise {
          position: absolute;
          inset: 0;
          opacity: 0.05;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
          mix-blend-mode: overlay;
        }
        @keyframes auroraAnimation {
          0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
          33% {
            transform: translate(8%, -6%) scale(1.05) rotate(2deg);
          }
          66% {
            transform: translate(-6%, 8%) scale(0.95) rotate(-2deg);
          }
          100% {
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}
