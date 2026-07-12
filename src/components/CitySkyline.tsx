import { Box } from '@mui/material';

interface CitySkylineProps {
  height?: number;
  opacity?: number;
}

export function CitySkyline({ height = 200, opacity = 0.3 }: CitySkylineProps) {
  return (
    <Box
      sx={{
        width: '100%',
        height,
        opacity,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <svg
        viewBox="0 0 1200 200"
        preserveAspectRatio="xMidYMax slice"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <linearGradient id="skyGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1A237E" stopOpacity="0" />
            <stop offset="100%" stopColor="#FFD700" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        <rect width="1200" height="200" fill="url(#skyGlow)" />

        {/* Background buildings */}
        <g fill="#0D1B2A">
          <rect x="50" y="120" width="40" height="80" rx="2" />
          <rect x="100" y="90" width="35" height="110" rx="2" />
          <rect x="145" y="100" width="50" height="100" rx="2" />
          <rect x="210" y="70" width="30" height="130" rx="2" />
          <rect x="250" y="85" width="45" height="115" rx="2" />
          <rect x="310" y="60" width="35" height="140" rx="2" />
          <rect x="355" y="75" width="40" height="125" rx="2" />
          <rect x="410" y="50" width="50" height="150" rx="2" />
          <rect x="470" y="65" width="35" height="135" rx="2" />
          <rect x="520" y="40" width="45" height="160" rx="2" />
          <rect x="575" y="55" width="40" height="145" rx="2" />
          <rect x="630" y="35" width="50" height="165" rx="2" />
          <rect x="690" y="50" width="35" height="150" rx="2" />
          <rect x="735" y="30" width="45" height="170" rx="2" />
          <rect x="790" y="45" width="40" height="155" rx="2" />
          <rect x="845" y="55" width="50" height="145" rx="2" />
          <rect x="910" y="70" width="35" height="130" rx="2" />
          <rect x="955" y="80" width="45" height="120" rx="2" />
          <rect x="1010" y="90" width="40" height="110" rx="2" />
          <rect x="1060" y="100" width="50" height="100" rx="2" />
          <rect x="1120" y="110" width="35" height="90" rx="2" />
        </g>

        {/* Monopoly Tower (center, taller, golden windows) */}
        <g>
          <rect x="580" y="10" width="40" height="190" rx="3" fill="#0D1B2A" />
          <rect x="575" y="5" width="50" height="15" rx="2" fill="#FFD700" opacity="0.6" />
          {/* Golden windows */}
          <rect x="585" y="25" width="6" height="6" fill="#FFD700" opacity="0.8" />
          <rect x="595" y="25" width="6" height="6" fill="#FFD700" opacity="0.6" />
          <rect x="605" y="25" width="6" height="6" fill="#FFD700" opacity="0.9" />
          <rect x="585" y="40" width="6" height="6" fill="#FFD700" opacity="0.7" />
          <rect x="595" y="40" width="6" height="6" fill="#FFD700" opacity="0.5" />
          <rect x="605" y="40" width="6" height="6" fill="#FFD700" opacity="0.8" />
          <rect x="585" y="55" width="6" height="6" fill="#FFD700" opacity="0.9" />
          <rect x="595" y="55" width="6" height="6" fill="#FFD700" opacity="0.6" />
          <rect x="605" y="55" width="6" height="6" fill="#FFD700" opacity="0.7" />
          <rect x="585" y="70" width="6" height="6" fill="#FFD700" opacity="0.5" />
          <rect x="595" y="70" width="6" height="6" fill="#FFD700" opacity="0.8" />
          <rect x="605" y="70" width="6" height="6" fill="#FFD700" opacity="0.6" />
          <rect x="585" y="85" width="6" height="6" fill="#FFD700" opacity="0.7" />
          <rect x="595" y="85" width="6" height="6" fill="#FFD700" opacity="0.9" />
          <rect x="605" y="85" width="6" height="6" fill="#FFD700" opacity="0.5" />
          {/* "M" on tower */}
          <text x="600" y="100" textAnchor="middle" fill="#FFD700" fontSize="14" fontWeight="bold" fontFamily="serif" opacity="0.8">M</text>
        </g>

        {/* Windows on buildings */}
        <g fill="#FFD700" opacity="0.3">
          <rect x="55" y="130" width="4" height="4" />
          <rect x="65" y="130" width="4" height="4" />
          <rect x="75" y="130" width="4" height="4" />
          <rect x="55" y="145" width="4" height="4" />
          <rect x="65" y="145" width="4" height="4" />
          <rect x="75" y="145" width="4" height="4" />
          <rect x="55" y="160" width="4" height="4" />
          <rect x="65" y="160" width="4" height="4" />
          <rect x="75" y="160" width="4" height="4" />

          <rect x="105" y="100" width="4" height="4" />
          <rect x="115" y="100" width="4" height="4" />
          <rect x="125" y="100" width="4" height="4" />
          <rect x="105" y="115" width="4" height="4" />
          <rect x="115" y="115" width="4" height="4" />
          <rect x="125" y="115" width="4" height="4" />
          <rect x="105" y="130" width="4" height="4" />
          <rect x="115" y="130" width="4" height="4" />
          <rect x="125" y="130" width="4" height="4" />

          <rect x="420" y="60" width="5" height="5" />
          <rect x="435" y="60" width="5" height="5" />
          <rect x="445" y="60" width="5" height="5" />
          <rect x="420" y="78" width="5" height="5" />
          <rect x="435" y="78" width="5" height="5" />
          <rect x="445" y="78" width="5" height="5" />
          <rect x="420" y="96" width="5" height="5" />
          <rect x="435" y="96" width="5" height="5" />
          <rect x="445" y="96" width="5" height="5" />
          <rect x="420" y="114" width="5" height="5" />
          <rect x="435" y="114" width="5" height="5" />
          <rect x="445" y="114" width="5" height="5" />

          <rect x="530" y="50" width="5" height="5" />
          <rect x="545" y="50" width="5" height="5" />
          <rect x="530" y="68" width="5" height="5" />
          <rect x="545" y="68" width="5" height="5" />
          <rect x="530" y="86" width="5" height="5" />
          <rect x="545" y="86" width="5" height="5" />
          <rect x="530" y="104" width="5" height="5" />
          <rect x="545" y="104" width="5" height="5" />

          <rect x="640" y="45" width="5" height="5" />
          <rect x="655" y="45" width="5" height="5" />
          <rect x="665" y="45" width="5" height="5" />
          <rect x="640" y="63" width="5" height="5" />
          <rect x="655" y="63" width="5" height="5" />
          <rect x="665" y="63" width="5" height="5" />
          <rect x="640" y="81" width="5" height="5" />
          <rect x="655" y="81" width="5" height="5" />
          <rect x="665" y="81" width="5" height="5" />
          <rect x="640" y="99" width="5" height="5" />
          <rect x="655" y="99" width="5" height="5" />
          <rect x="665" y="99" width="5" height="5" />

          <rect x="745" y="40" width="5" height="5" />
          <rect x="760" y="40" width="5" height="5" />
          <rect x="745" y="58" width="5" height="5" />
          <rect x="760" y="58" width="5" height="5" />
          <rect x="745" y="76" width="5" height="5" />
          <rect x="760" y="76" width="5" height="5" />
          <rect x="745" y="94" width="5" height="5" />
          <rect x="760" y="94" width="5" height="5" />
        </g>

        {/* Property color strips at bottom */}
        <rect x="0" y="196" width="150" height="4" fill="#1A237E" />
        <rect x="150" y="196" width="150" height="4" fill="#1B5E20" />
        <rect x="300" y="196" width="150" height="4" fill="#01579B" />
        <rect x="450" y="196" width="150" height="4" fill="#4A148C" />
        <rect x="600" y="196" width="150" height="4" fill="#BF360C" />
        <rect x="750" y="196" width="150" height="4" fill="#B71C1C" />
        <rect x="900" y="196" width="150" height="4" fill="#F57F17" />
        <rect x="1050" y="196" width="150" height="4" fill="#3E2723" />
      </svg>
    </Box>
  );
}
