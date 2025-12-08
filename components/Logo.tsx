
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 400 150" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#ff6b6b', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#c0392b', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>
    
    {/* Text with Christmas Font */}
    <text 
      x="200" 
      y="105" 
      textAnchor="middle" 
      fontFamily="'Mountains of Christmas', cursive" 
      fontSize="90" 
      fontWeight="700" 
      fill="url(#logoGrad)" 
      stroke="white" 
      strokeWidth="3"
      filter="url(#glow)"
      style={{ textShadow: '0px 5px 10px rgba(0,0,0,0.5)' }}
    >
      Sleigh Ride
    </text>
    
    {/* Decorative Holly/Snow accents */}
    <circle cx="365" cy="65" r="4" fill="#fbbf24" />
    <circle cx="375" cy="55" r="3" fill="#fbbf24" />
    <path d="M30,60 Q50,40 70,60" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.5" />
  </svg>
);

export default Logo;
