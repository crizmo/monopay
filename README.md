# MonoPay - Serverless Monopoly City Electronic Trading Unit & Dice Banker App

MonoPay is a high-performance, real-time, peer-to-peer web application designed to serve as the ultimate banking companion and electronic trading unit emulator for **Monopoly City** (and traditional Monopoly board games). 

Designed to completely eliminate physical paper money, calculator errors, and sluggish gameplay, MonoPay coordinates transactions, balance tallies, and board game actions serverlessly. By utilizing WebRTC, clients connect directly from browser-to-browser with zero database storage, user sign-ups, or cloud servers.

---

## 🎲 Core Features & SEO Highlights

### 1. Monopoly City Electronic Trading Unit Emulator
MonoPay features a high-fidelity digital emulation of the physical **Monopoly City Trading Unit** device:
* **Deal / Auction Dome**: Central button featuring the red & blue handshake logo that triggers a **50-second auction countdown**. The surrounding translucent ring pulses red, mimicking the physical LED lights.
* **Building Roll Selector**: Emulates the corrugated side rolling switch. It cycles light indicators around the outer ring sector numbers (`1`, `2`, `3`) or the Railroad track symbol (`🚂`) to determine block construction capacities.
* **Synthesized Audio signals**: Authentic retro 8-bit sound effects (rolling tick-tocks, dual-tone success chimes, and emergency siren alarms for timed-out auctions) generated entirely on-screen using the browser's Web Audio API.

### 2. Built-in Monopoly Dice Roller
No physical dice available? Banker controls include a built-in double 6-sided dice roller with realistic rolling animations, dot face renderings, and auto-sum calculation indicators.

### 3. Serverless WebRTC Mesh Connection
Uses Trystero with custom-configured WebSocket (`wss://`) torrent matchmaking trackers and Google public STUN servers for robust NAT traversal. Connecting 3+ players simultaneously is instant, seamless, and secure.

### 4. Browser Refresh Auto-Restoration
If a player or banker accidentally reloads their page, a custom session hook automatically detects active routes, recovers the lobby parameters from `localStorage`, and re-connects the WebRTC channels without terminating the ongoing session.

### 5. Advanced Ledgers & Transaction Ledger
* **Animated Balances**: Balance values count up or down dynamically with flashing color cues (green for credit, red for debit).
* **Transaction Ledger**: Search, audit, and filter the complete chronological history of credits, debits, and transfers.
* **Flexible Banker Controls**: Easily issue player rewards (Pass GO salary, stadium investments, rent credits) and custom player penalties (industrial building expenses, custom tax debits).

---

## 🛠️ Technology Stack

* **Vite** — Lightning-fast development environment and bundler.
* **React 19** — Next-generation rendering framework for snappy UI updates.
* **TypeScript** — Absolute type safety across WebRTC packets and actions.
* **Material UI (MUI v9)** — Component system customized with dark metallic styling, grid structures, and responsive layouts.
* **Trystero** — Serverless WebRTC signaling using public WebSocket networks.
* **Web Audio API** — High-speed browser synthesis for retro game sounds.
* **React Router** — SP Routing for `/create`, `/join`, `/banker`, and `/player`.

---

## 🚀 Getting Started Locally

To launch MonoPay on your local machine, run:

```bash
# Clone the repository
git clone https://github.com/crizmo/monopay.git
cd monopay

# Install dependencies
npm install

# Start local hot-reloading dev server
npm run dev
```

The app will start at `http://localhost:5173`. Open multiple tabs or share your local IP to connect multiple players!

---

## 📦 Building & Production Release

To compile a highly optimized static build for production hosting (Vercel, Netlify, or GitHub Pages):

```bash
npm run build
```

The production assets will be outputted to the `dist/` directory, ready to be hosted on any static platform.

---

## 📖 How to Use MonoPay

### Setup & Joining
1. **The Banker**: Opens the app, clicks **Create Lobby**, sets the Room Name (e.g. *Sunday Night City*), and adjusts the starting balance (Default `$36.7M` for Monopoly City).
2. **Invite Players**: The Banker displays the Room QR code, link, or Room ID to participants.
3. **The Players**: Click **Join Lobby**, enter the room code, input their custom player name, and click join.
4. **Game Start**: Once all players have joined, the Banker clicks **Start Game** to take everyone to the dashboard.

### Performing Actions
* **Paying the Bank**: Players click **Pay Bank** in their "Your Actions" card. The dialog closes automatically upon transfer completion.
* **Sending Money**: Click **Send Money**, pick the target player, enter the custom amount, and click Send.
* **Operating the Trading Unit**: The Banker scrolls to "Banker Controls", uses the side slider to spin building limits (1-3, Railroad), and clicks the handshake button to initiate auction bid limits.

---

## 📂 Project Architecture

```
monopay/
├── public/                 # Static assets & icons
├── src/
│   ├── components/         # Reusable widgets (TradingUnit, AnimatedBalance, PlayerCard)
│   ├── pages/              # Route views (HomePage, CreateGamePage, GameDashboardPage)
│   ├── services/           # RoomService (P2P channels) & GameService (states)
│   ├── theme/              # Custom dark-slate color design system & fonts
│   ├── types/              # TS interface structures for game events & balances
│   └── utils/              # Money formats & helper calculations
├── index.html              # Entry DOM containing main SEO tag injection
├── vite.config.ts          # Vite compilation config
└── package.json            # Script runs & dependencies manifest
```

