import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ArtistDashboard from "./pages/ArtistDashboard";
import AudienceDashboard from "./pages/AudienceDashboard";
import PortfolioPage from "./pages/PortfolioPage";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleSelectionPage from "./pages/RoleSelectionPage";
import MarketplacePage from "./pages/MarketplacePage";
import MySongsPage from "./pages/MySongsPage";
import ResalePage from "./pages/ResalePage";
import TransactionsPage from "./pages/TransactionsPage";
import WalletBalancePage from "./pages/WalletBalancePage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/select-role" element={<RoleSelectionPage />} />
      <Route path="/portfolio" element={<PortfolioPage />} />

      {/* --- Artist-only Routes --- */}
      <Route
        path="/artist"
        element={
          <ProtectedRoute requireArtist>
            <ArtistDashboard />
          </ProtectedRoute>
        }
      />

      {/* --- Common Pages (for both Artist & Audience) --- */}
      <Route
        path="/my-songs"
        element={
          <ProtectedRoute>
            <MySongsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/marketplace"
        element={
          <ProtectedRoute>
            <MarketplacePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <TransactionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wallet-balance"
        element={
          <ProtectedRoute>
            <WalletBalancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* --- Audience-only Routes --- */}
      <Route
        path="/audience"
        element={
          <ProtectedRoute>
            <AudienceDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resale"
        element={
          <ProtectedRoute>
            <ResalePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

// THIS IS THE LINE THAT WAS MISSING AND CAUSED YOUR ERROR
export default App;

