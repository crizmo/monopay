# Monopay - Monopoly City Banking

A real-time, peer-to-peer banking application for Monopoly City. Zero backend, zero database - runs entirely in the browser using WebRTC via Trystero.

## Features

- **Peer-to-Peer**: Uses Trystero (Nostr signaling) for direct browser-to-browser connections
- **No Server Required**: No PeerJS cloud, no Firebase, no backend - just WebRTC
- **Real-time Sync**: Balances update instantly across all connected devices
- **QR Code Join**: Players scan a QR code or click a link to join
- **Monopoly City Theme**: City skyline visuals, property district colors, building icons
- **$36.7M Starting Balance**: Matches the actual Monopoly City board game
- **Quick Actions**: Pass GO (+$2M), Build Residential, Build Industrial, Stadium, Tax, etc.
- **Custom Transactions**: Any amount with a description
- **Transfer Funds**: Player-to-player transfers
- **Transaction History**: Full audit trail with search and filters
- **Animated Balances**: Smooth number animations with color flash on changes
- **Responsive**: Works on mobile and desktop
- **Dark Theme**: Night-city sky with gold Monopoly Tower accents

## Tech Stack

- **Vite** - Build tool
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Material UI (MUI v9)** - Component library
- **React Router** - Client-side routing
- **Trystero** - WebRTC peer-to-peer (Nostr signaling)
- **qrcode** - QR code generation
- **uuid** - Unique ID generation

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output is in `dist/` - deploy to any static host (Vercel, Netlify, GitHub Pages).

## How to Play

1. One player opens the app and clicks **Create Game**
2. Enter a room name, set the starting balance ($36.7M default), and click **Create Room**
3. Share the room code, link, or QR code with other players
4. Players click **Join Game**, enter the code and their name
5. The banker clicks **Start Game** when everyone is connected
6. The banker can add/remove money, transfer between players, and use quick actions
7. Players see their balance and transaction history in real-time

## Architecture

- **Host** stores all game state in memory in their browser
- **Clients** connect directly to the host via WebRTC (Trystero/Nostr)
- The host broadcasts state updates to all connected clients via typed actions
- If the host closes their browser, the game ends
- No data is sent to any server

## Project Structure

```
src/
  components/       # Reusable UI components (CitySkyline, PlayerCard, etc.)
  pages/            # Route-level page components
  hooks/            # Custom React hooks
  services/         # Game logic, QR, storage services
  theme/            # MUI dark theme + Monopoly City colors
  types/            # TypeScript interfaces and types
  utils/            # Formatting and helper utilities
```

## Deployment

### Vercel

1. Push to a Git repository
2. Import in Vercel
3. Framework preset: Vite
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy

No environment variables required.

## License

MIT
