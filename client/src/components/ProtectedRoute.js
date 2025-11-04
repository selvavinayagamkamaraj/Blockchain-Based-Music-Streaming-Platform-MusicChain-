import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requireArtist = false }) => {
  const { account, isArtist, loading } = useAuth();
  const location = useLocation();

  // --- While checking wallet connection ---
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Checking authentication...
      </div>
    );
  }

  // --- If MetaMask not connected ---
  if (!account) {
    return <Navigate to="/" replace />;
  }

  // --- Restrict artist-only routes ---
  if (requireArtist && !isArtist) {
    console.warn("Access denied: Audience trying to access artist-only page.");
    return <Navigate to="/audience" replace />;
  }

  // --- Optional redirect: prevent artists from opening audience-only route ---
  // But DO NOT block pages like `/my-songs`, `/marketplace`, `/transactions`
  const audienceOnlyPages = ["/audience"];
  if (isArtist && audienceOnlyPages.includes(location.pathname)) {
    console.warn("Redirecting artist from audience page to their dashboard.");
    return <Navigate to="/artist" replace />;
  }

  // --- Authorized: render the component ---
  return children;
};

export default ProtectedRoute;
