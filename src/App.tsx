import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { HomePage } from './pages/HomePage';
import { CreateGamePage } from './pages/CreateGamePage';
import { JoinGamePage } from './pages/JoinGamePage';
import { BankerDashboardPage } from './pages/BankerDashboardPage';
import { PlayerDashboardPage } from './pages/PlayerDashboardPage';
import { TransactionHistoryPage } from './pages/TransactionHistoryPage';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateGamePage />} />
          <Route path="/join" element={<JoinGamePage />} />
          <Route path="/banker" element={<BankerDashboardPage />} />
          <Route path="/player" element={<PlayerDashboardPage />} />
          <Route path="/transactions" element={<TransactionHistoryPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
