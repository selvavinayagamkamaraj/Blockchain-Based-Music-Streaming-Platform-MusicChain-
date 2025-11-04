import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { account, isArtist } = useAuth();

  return (
    <nav className="main-nav">
      {/* Logo */}
      <a
        href="/"
        onClick={(e) => {
          e.preventDefault();
          navigate("/");
        }}
        className="nav-logo"
      >
        🎵 MusicChain
      </a>

      <div className="nav-links">
        {/* ✅ Artist-only links */}
        {isArtist && (
          <NavLink
            to="/artist"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Artist Dashboard
          </NavLink>
        )}

        {/* ✅ Audience-only links */}
        {!isArtist && (
          <NavLink
            to="/audience"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Audience Dashboard
          </NavLink>
        )}

        {/* ✅ Shared links for both roles */}
        <NavLink
          to="/my-songs"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          My Songs
        </NavLink>

        <NavLink
          to="/marketplace"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Marketplace
        </NavLink>

        <NavLink
          to="/resale"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Resale
        </NavLink>

        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Transactions
        </NavLink>

        <NavLink
          to="/wallet-balance"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Wallet Balance
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Profile
        </NavLink>

        <NavLink
          to="/portfolio"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Portfolio
        </NavLink>

        {/* ✅ Show wallet address at the end */}
        {account && (
          <span className="wallet-address">
            💼 {account.slice(0, 6)}...{account.slice(-4)}
          </span>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
