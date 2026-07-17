'use client'

export default function GeospatialBackground() {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-[#faf9f6] overflow-hidden">
      {/* Ambient Caustic Glass Blobs */}
      <div 
        className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#fcead2] opacity-60 blur-[120px] animate-[pulse_10s_ease-in-out_infinite]"
        style={{ animationDelay: '0s' }}
      />
      <div 
        className="absolute top-[40%] -right-[10%] w-[50%] h-[55%] rounded-full bg-[#e3ebd5] opacity-50 blur-[130px] animate-[pulse_12s_ease-in-out_infinite]"
        style={{ animationDelay: '2s' }}
      />
      <div 
        className="absolute -bottom-[20%] left-[20%] w-[45%] h-[45%] rounded-full bg-[#e0f0f5] opacity-55 blur-[110px] animate-[pulse_8s_ease-in-out_infinite]"
        style={{ animationDelay: '4s' }}
      />

      {/* Ultra-subtle Map Lat/Long Grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            radial-gradient(#8b7d75 1px, transparent 1px),
            linear-gradient(to right, rgba(139, 125, 117, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(139, 125, 117, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px, 160px 160px, 160px 160px',
          backgroundPosition: 'center center',
        }}
      />

      {/* Tactile Paper Grain Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}

