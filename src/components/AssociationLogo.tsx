import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  textSize?: 'sm' | 'md' | 'lg';
  theme?: 'color' | 'mono' | 'white';
}

export default function AssociationLogo({ 
  className = "w-12 h-12", 
  showText = false, 
  textSize = "md",
  theme = "color"
}: LogoProps) {
  // Define colors based on theme
  const isMono = theme === 'mono';
  const isWhite = theme === 'white';

  const textColor = isWhite ? 'text-white' : isMono ? 'text-slate-800' : 'text-slate-900';
  const subTextColor = isWhite ? 'text-white/60' : isMono ? 'text-slate-500' : 'text-blue-600';
  const gnbSubColor = isWhite ? 'text-white/70' : 'text-gray-400';

  // SVG internal colors
  const primaryBlue = isWhite ? '#ffffff' : isMono ? '#475569' : '#1e3a8a';
  const sunYellow = isWhite ? 'rgba(255,255,255,0.2)' : isMono ? '#cbd5e1' : '#facc15';
  const sunRays = isWhite ? 'rgba(255,255,255,0.3)' : isMono ? '#94a3b8' : '#eab308';
  const hillGold = isWhite ? 'rgba(255,255,255,0.15)' : isMono ? '#e2e8f0' : '#f59e0b';
  const climberColor = isWhite ? '#ffffff' : isMono ? '#334155' : '#2b1e1a';
  const helperColor = isWhite ? '#cbd5e1' : isMono ? '#64748b' : '#16a34a';

  return (
    <div className="flex items-center gap-3">
      {/* High Fidelity Official Logo SVG */}
      <svg 
        viewBox="0 0 200 200" 
        className={`${className} overflow-visible select-none`}
        aria-label="사단법인 북한이탈주민 중앙회 로고"
      >
        <defs>
          {/* Path for Arched Text on Top (Left to Right, Clockwise) */}
          <path 
            id="text-path-top" 
            d="M 22 100 A 78 78 0 0 1 178 100" 
            fill="none" 
            stroke="none"
          />
          {/* Path for Arched Text on Bottom (Right to Left, Counter-Clockwise to keep it upright) */}
          {/* Drawing from left to right on the lower half to keep standard gravity readability require M 22 100 A 78 78 0 0 0 178 100 */}
          <path 
            id="text-path-bottom" 
            d="M 182 100 A 82 82 0 0 1 18 100" 
            fill="none" 
            stroke="none"
          />
          {/* Glow filter for Sun */}
          <filter id="sun-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Circular Outer Outline / Boundary */}
        <circle 
          cx="100" 
          cy="100" 
          r="92" 
          fill="none" 
          stroke={primaryBlue} 
          strokeWidth="1.5" 
          strokeDasharray={isWhite ? "none" : "none"}
          className="opacity-20"
        />

        {/* Circular Inner Outline */}
        <circle 
          cx="100" 
          cy="100" 
          r="66" 
          fill="none" 
          stroke={primaryBlue} 
          strokeWidth="1.2" 
          className="opacity-15"
        />

        {/* 1. SUN IN BACKGROUND */}
        <g id="sun-element">
          {/* Rays radiating outward */}
          {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180].map((angle) => {
            // Convert angle to radians for calculation
            const rad = ((angle - 180) * Math.PI) / 180;
            const x1 = 100 + Math.cos(rad) * 32;
            const y1 = 105 + Math.sin(rad) * 32;
            const x2 = 100 + Math.cos(rad) * 58;
            const y2 = 105 + Math.sin(rad) * 58;
            return (
              <line 
                key={angle}
                x1={x1} 
                y1={y1} 
                x2={x2} 
                y2={y2} 
                stroke={sunRays} 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            );
          })}
          {/* Sun Body */}
          <circle 
            cx="100" 
            cy="105" 
            r="32" 
            fill={sunYellow} 
            filter={isWhite ? "none" : "url(#sun-glow)"}
          />
        </g>

        {/* 2. GOLDEN SLOPE/HILL */}
        <path 
          d="M 50 135 C 75 125, 95 120, 115 130 C 130 138, 140 134, 150 128 L 150 145 H 50 Z" 
          fill={hillGold} 
        />

        {/* 3. FIGURES (CLIMBER & SUPPORTER) */}
        {/* Helper/Supporter (Green figure on Right, standing on peak, reaching down) */}
        <g id="supporter-figure" strokeLinecap="round" strokeLinejoin="round">
          {/* Head */}
          <circle cx="113" cy="85" r="7.5" fill={helperColor} />
          {/* Body/Torso & Leg */}
          <path 
            d="M 112 92 C 117 95, 128 102, 128 112 L 132 135 C 131 135, 127 131, 125 121 L 118 105" 
            fill="none" 
            stroke={helperColor} 
            strokeWidth="7" 
          />
          {/* Left Leg (standing stable) */}
          <path 
            d="M 124 100 C 121 110, 115 120, 110 130" 
            fill="none" 
            stroke={helperColor} 
            strokeWidth="7.5" 
          />
          {/* Left Arm (holding hand of climber) */}
          <path 
            d="M 108 94 C 103 98, 98 104, 98 104" 
            fill="none" 
            stroke={helperColor} 
            strokeWidth="5" 
          />
        </g>

        {/* Climber (Dark figure on Left, climbing up, reaching one hand to the partner) */}
        <g id="climber-figure" strokeLinecap="round" strokeLinejoin="round">
          {/* Head */}
          <circle cx="88" cy="112" r="7.2" fill={climberColor} />
          {/* Body / Torso */}
          <path 
            d="M 88 118 C 84 122, 75 130, 80 142" 
            fill="none" 
            stroke={climberColor} 
            strokeWidth="7.5" 
          />
          {/* Back/Leg 1 */}
          <path 
            d="M 83 125 C 75 132, 65 140, 60 145" 
            fill="none" 
            stroke={climberColor} 
            strokeWidth="7.5" 
          />
          {/* Holding Arm (reaching hand up to grasp green figure's hand) */}
          <path 
            d="M 91 115 C 95 110, 98 104, 98 104" 
            fill="none" 
            stroke={climberColor} 
            strokeWidth="5" 
          />
          {/* Other Arm (balancing behind) */}
          <path 
            d="M 85 120 C 81 123, 76 128, 77 132" 
            fill="none" 
            stroke={climberColor} 
            strokeWidth="4.5" 
          />
        </g>

        {/* Handshake/Grasp Connection Point (White circle/glow to symbolize hope/connection) */}
        <circle cx="98" cy="104" r="2.5" fill="#ffffff" />

        {/* 4. CIRCULAR TEXT OUTSIDE */}
        {/* Top Text: 사단법인 북한이탈주민 중앙회 */}
        <text 
          fill={primaryBlue} 
          fontFamily="system-ui, -apple-system, sans-serif" 
          fontSize="13" 
          fontWeight="bold" 
          letterSpacing="0.8"
        >
          <textPath href="#text-path-top" startOffset="50%" textAnchor="middle">
            사단법인 북한이탈주민 중앙회
          </textPath>
        </text>

        {/* Bottom Text: Central Association of North Korean Freeman */}
        <text 
          fill={primaryBlue} 
          fontFamily="system-ui, -apple-system, sans-serif" 
          fontSize="10" 
          fontWeight="bold" 
          letterSpacing="0.3"
        >
          <textPath href="#text-path-bottom" startOffset="50%" textAnchor="middle">
            Central Association of North Korean Freeman
          </textPath>
        </text>

        {/* 5. DIAMONDS ON LEFT & RIGHT */}
        {/* Left Diamond */}
        <polygon points="18,100 22,96 26,100 22,104" fill={primaryBlue} />
        {/* Right Diamond */}
        <polygon points="182,100 178,96 174,100 178,104" fill={primaryBlue} />
      </svg>

      {/* Optional Beautiful Organisation Text Representation next to logo */}
      {showText && (
        <div className="flex flex-col select-none">
          <span className={`text-[10px] ${gnbSubColor} font-black tracking-widest uppercase leading-none`}>
            사단법인
          </span>
          <h1 className={`font-extrabold tracking-tight ${textColor} whitespace-nowrap mt-0.5 font-sans ${
            textSize === 'sm' ? 'text-xs sm:text-sm' : 
            textSize === 'md' ? 'text-sm xs:text-base' : 
            'text-lg sm:text-xl'
          }`}>
            북한이탈주민중앙회
          </h1>
        </div>
      )}
    </div>
  );
}
