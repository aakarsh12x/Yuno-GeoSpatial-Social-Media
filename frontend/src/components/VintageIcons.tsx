import React from 'react'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
}

// A beautiful, fine-line multi-pointed cartographic starburst (compass star)
export function CelestialStar({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Outer fine diamonds/accents */}
      <path d="M12 2 L12 22" />
      <path d="M2 12 L22 12" />
      <path d="M5 5 L19 19" />
      <path d="M5 19 L19 5" />
      {/* Inner diamond core */}
      <polygon points="12,9 15,12 12,15 9,12" fill="currentColor" fillOpacity="0.1" />
      {/* Central orbit ring */}
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    </svg>
  )
}

// A hand-drawn minimalist vintage starburst cluster (no Lucide rounded shapes)
export function VintageSparkle({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Principal star */}
      <path d="M10 2 L10 12 M5 7 L15 7" />
      <circle cx="10" cy="7" r="1.5" fill="currentColor" />
      
      {/* Secondary minor star */}
      <path d="M18 13 L18 21 M14 17 L22 17" />
      <circle cx="18" cy="17" r="1" fill="currentColor" />

      {/* Connection thread/orbit dotted line */}
      <path d="M10 12 Q13 15 14 17" strokeDasharray="2 2" />
    </svg>
  )
}

// Antique Astrolabe / Compass Seal
export function AstrolabeIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" strokeDasharray="1.5 1.5" />
      <path d="M12 3 V21" />
      <path d="M3 12 H21" />
      <path d="M8 8 L16 16" />
      <path d="M8 16 L16 8" />
      <polygon points="12,7 13.5,12 12,17 10.5,12" fill="currentColor" fillOpacity="0.15" />
    </svg>
  )
}

// Vintage Cottage/Cabin Home Icon
export function VintageHome({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <polygon points="12,3 21,10 21,21 3,21 3,10" />
      <path d="M17 5 V8" />
      <path d="M9 21 V13 H15 V21" />
      <path d="M12 13 V21" />
      <circle cx="12" cy="8.5" r="1.5" />
    </svg>
  )
}

// Vintage Message Scroll Icon
export function VintageMessage({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M6 19 C6 17.5 4.5 16 3 16 H19 C20.5 16 22 17.5 22 19" />
      <path d="M6 19 C6 20.5 4.5 22 3 22" />
      <rect x="3" y="3" width="16" height="13" rx="1" />
      <path d="M6 7 H16" />
      <path d="M6 10 H13" />
      <circle cx="15.5" cy="11.5" r="1" fill="currentColor" />
    </svg>
  )
}

// Vintage Spark (Cross Needle Starburst)
export function VintageSpark({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 2 L12 22 M2 12 L22 12" />
      <circle cx="12" cy="12" r="4.5" strokeDasharray="1.5 1.5" />
      <path d="M7.5 7.5 L16.5 16.5" />
      <path d="M7.5 16.5 L16.5 7.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  )
}

// Vintage Cameo Silhouette User Profile Icon
export function VintageUser({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <ellipse cx="12" cy="12" rx="7.5" ry="9" />
      <circle cx="12" cy="8.5" r="2.5" />
      <path d="M6 18.5 C6 15 9 14 12 14 C15 14 18 15 18 18.5" />
      <path d="M9 21 H15" />
    </svg>
  )
}

// Vintage Clockwork Watch Settings Icon
export function VintageSettings({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M12 2 V4 M12 20 V22 M2 12 H4 M20 12 H22" />
      <path d="M5 5 L6.5 6.5 M17.5 17.5 L19 19 M5 19 L6.5 17.5 M17.5 6.5 L19 5" />
      <polygon points="12,8 14,12 12,14 10,12" fill="currentColor" fillOpacity="0.2" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  )
}

// Vintage Skeleton Key Logout Icon
export function VintageLogout({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="6.5" cy="12" r="3" />
      <circle cx="6.5" cy="12" r="1" />
      <path d="M9.5 12 H20.5" />
      <path d="M17 12 V15.5 H19.5 V12 M13.5 12 V14.5 H15 V12" />
    </svg>
  )
}

// Vintage Hand-Bell Notification Icon
export function VintageBell({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M6 19 H18 C18 19 17 14 17 11 C17 8 15 5 12 5 C9 5 7 8 7 11 C7 14 6 19 6 19" />
      <path d="M12 5 V2 M10 2 H14" />
      <circle cx="12" cy="20.5" r="1.5" fill="currentColor" />
    </svg>
  )
}

// Vintage Menu Hamburger Icon
export function VintageMenu({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M3 6 H21" />
      <path d="M3 12 H18 M20 12 H21" strokeDasharray="1 1" />
      <path d="M3 18 H21" />
    </svg>
  )
}
