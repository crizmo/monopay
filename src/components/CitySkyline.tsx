import { Box } from '@mui/material';

interface CitySkylineProps {
  height?: number;
  opacity?: number;
}

export function CitySkyline({ height = 220, opacity = 0.5 }: CitySkylineProps) {
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
        viewBox="0 0 1200 220"
        preserveAspectRatio="xMidYMax slice"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <linearGradient id="skyGlowLight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E3F2FD" stopOpacity="0" />
            <stop offset="100%" stopColor="#BBDEFB" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="buildingGrad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#78909C" />
            <stop offset="100%" stopColor="#546E7A" />
          </linearGradient>
          <linearGradient id="buildingGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#90A4AE" />
            <stop offset="100%" stopColor="#607D8B" />
          </linearGradient>
        </defs>

        <rect width="1200" height="220" fill="url(#skyGlowLight)" />

        {/* Background buildings */}
        <g>
          <rect x="30" y="140" width="45" height="80" rx="3" fill="url(#buildingGrad2)" />
          <rect x="85" y="100" width="38" height="120" rx="3" fill="url(#buildingGrad1)" />
          <rect x="133" y="115" width="52" height="105" rx="3" fill="url(#buildingGrad2)" />
          <rect x="195" y="80" width="34" height="140" rx="3" fill="url(#buildingGrad1)" />
          <rect x="240" y="95" width="48" height="125" rx="3" fill="url(#buildingGrad2)" />
          <rect x="300" y="65" width="38" height="155" rx="3" fill="url(#buildingGrad1)" />
          <rect x="348" y="82" width="44" height="138" rx="3" fill="url(#buildingGrad2)" />
          <rect x="405" y="50" width="52" height="170" rx="3" fill="url(#buildingGrad1)" />
          <rect x="468" y="70" width="38" height="150" rx="3" fill="url(#buildingGrad2)" />
          <rect x="518" y="40" width="48" height="180" rx="3" fill="url(#buildingGrad1)" />
          <rect x="578" y="58" width="42" height="162" rx="3" fill="url(#buildingGrad2)" />

          {/* Monopoly Tower - center, tallest, with gold top */}
          <rect x="630" y="15" width="44" height="205" rx="4" fill="#455A64" />
          <rect x="625" y="8" width="54" height="18" rx="4" fill="#F9A825" />
          <text x="652" y="22" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold" fontFamily="serif">M</text>

          <rect x="688" y="50" width="38" height="170" rx="3" fill="url(#buildingGrad1)" />
          <rect x="736" y="35" width="50" height="185" rx="3" fill="url(#buildingGrad2)" />
          <rect x="796" y="52" width="42" height="168" rx="3" fill="url(#buildingGrad1)" />
          <rect x="848" y="62" width="52" height="158" rx="3" fill="url(#buildingGrad2)" />
          <rect x="912" y="78" width="38" height="142" rx="3" fill="url(#buildingGrad1)" />
          <rect x="960" y="90" width="48" height="130" rx="3" fill="url(#buildingGrad2)" />
          <rect x="1018" y="100" width="42" height="120" rx="3" fill="url(#buildingGrad1)" />
          <rect x="1070" y="112" width="52" height="108" rx="3" fill="url(#buildingGrad2)" />
          <rect x="1132" y="125" width="38" height="95" rx="3" fill="url(#buildingGrad1)" />
        </g>

        {/* Windows on buildings */}
        <g fill="#FFD54F" opacity="0.7">
          {/* Tower windows */}
          <rect x="638" y="35" width="5" height="5" rx="1" />
          <rect x="650" y="35" width="5" height="5" rx="1" />
          <rect x="662" y="35" width="5" height="5" rx="1" />
          <rect x="638" y="50" width="5" height="5" rx="1" />
          <rect x="650" y="50" width="5" height="5" rx="1" />
          <rect x="662" y="50" width="5" height="5" rx="1" />
          <rect x="638" y="65" width="5" height="5" rx="1" />
          <rect x="650" y="65" width="5" height="5" rx="1" />
          <rect x="662" y="65" width="5" height="5" rx="1" />
          <rect x="638" y="80" width="5" height="5" rx="1" />
          <rect x="650" y="80" width="5" height="5" rx="1" />
          <rect x="662" y="80" width="5" height="5" rx="1" />
          <rect x="638" y="95" width="5" height="5" rx="1" />
          <rect x="650" y="95" width="5" height="5" rx="1" />
          <rect x="662" y="95" width="5" height="5" rx="1" />

          {/* Building windows left */}
          <rect x="415" y="65" width="4" height="4" rx="1" />
          <rect x="430" y="65" width="4" height="4" rx="1" />
          <rect x="440" y="65" width="4" height="4" rx="1" />
          <rect x="415" y="80" width="4" height="4" rx="1" />
          <rect x="430" y="80" width="4" height="4" rx="1" />
          <rect x="440" y="80" width="4" height="4" rx="1" />
          <rect x="415" y="95" width="4" height="4" rx="1" />
          <rect x="430" y="95" width="4" height="4" rx="1" />
          <rect x="440" y="95" width="4" height="4" rx="1" />

          <rect x="528" y="55" width="4" height="4" rx="1" />
          <rect x="543" y="55" width="4" height="4" rx="1" />
          <rect x="528" y="70" width="4" height="4" rx="1" />
          <rect x="543" y="70" width="4" height="4" rx="1" />
          <rect x="528" y="85" width="4" height="4" rx="1" />
          <rect x="543" y="85" width="4" height="4" rx="1" />

          {/* Building windows right */}
          <rect x="746" y="50" width="4" height="4" rx="1" />
          <rect x="762" y="50" width="4" height="4" rx="1" />
          <rect x="774" y="50" width="4" height="4" rx="1" />
          <rect x="746" y="65" width="4" height="4" rx="1" />
          <rect x="762" y="65" width="4" height="4" rx="1" />
          <rect x="774" y="65" width="4" height="4" rx="1" />
          <rect x="746" y="80" width="4" height="4" rx="1" />
          <rect x="762" y="80" width="4" height="4" rx="1" />
          <rect x="774" y="80" width="4" height="4" rx="1" />

          <rect x="858" y="75" width="4" height="4" rx="1" />
          <rect x="874" y="75" width="4" height="4" rx="1" />
          <rect x="888" y="75" width="4" height="4" rx="1" />
          <rect x="858" y="90" width="4" height="4" rx="1" />
          <rect x="874" y="90" width="4" height="4" rx="1" />
          <rect x="888" y="90" width="4" height="4" rx="1" />
        </g>

        {/* Property color strip at the bottom - like a Monopoly board edge */}
        <rect x="0" y="215" width="150" height="5" fill="#1565C0" />
        <rect x="150" y="215" width="150" height="5" fill="#2E7D32" />
        <rect x="300" y="215" width="150" height="5" fill="#0288D1" />
        <rect x="450" y="215" width="150" height="5" fill="#7B1FA2" />
        <rect x="600" y="215" width="150" height="5" fill="#E65100" />
        <rect x="750" y="215" width="150" height="5" fill="#C62828" />
        <rect x="900" y="215" width="150" height="5" fill="#F9A825" />
        <rect x="1050" y="215" width="150" height="5" fill="#5D4037" />
      </svg>
    </Box>
  );
}
