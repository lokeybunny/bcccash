export const BCCLogo = ({ className = "" }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer envelope shape */}
      <path
        d="M4 8C4 6.89543 4.89543 6 6 6H26C27.1046 6 28 6.89543 28 8V24C28 25.1046 27.1046 26 26 26H6C4.89543 26 4 25.1046 4 24V8Z"
        fill="url(#bcc-gradient)"
        fillOpacity="0.15"
        stroke="url(#bcc-gradient)"
        strokeWidth="1.5"
      />
      {/* Envelope flap / arrow pointing down */}
      <path
        d="M4 9L14.5858 16.5858C15.3668 17.3668 16.6332 17.3668 17.4142 16.5858L28 9"
        stroke="url(#bcc-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Inner circle - crypto/coin element */}
      <circle
        cx="16"
        cy="18"
        r="5"
        fill="url(#bcc-gradient)"
        fillOpacity="0.3"
        stroke="url(#bcc-gradient)"
        strokeWidth="1.5"
      />
      {/* B monogram inside circle */}
      <path
        d="M14 15.5V20.5M14 18H16.5C17.3284 18 18 17.3284 18 16.5V16.5C18 15.6716 17.3284 15 16.5 15H14M14 18H16.5C17.3284 18 18 18.6716 18 19.5V19.5C18 20.3284 17.3284 21 16.5 21H14"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="bcc-gradient"
          x1="4"
          y1="6"
          x2="28"
          y2="26"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="hsl(270, 80%, 65%)" />
          <stop offset="0.5" stopColor="hsl(200, 80%, 55%)" />
          <stop offset="1" stopColor="hsl(170, 80%, 50%)" />
        </linearGradient>
      </defs>
    </svg>
  );
};
