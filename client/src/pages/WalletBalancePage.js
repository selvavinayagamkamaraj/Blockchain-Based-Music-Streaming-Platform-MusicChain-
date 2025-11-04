import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Link } from "react-router-dom"; // Import Link
import { useAuth } from "../context/AuthContext";
// import Navbar from "../components/Navbar"; // <-- REMOVED! Layout.js handles this.

export default function WalletBalancePage() {
  const { account } = useAuth();
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!account || !window.ethereum) return;
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const bal = await provider.getBalance(account);
        setBalance(ethers.formatEther(bal));
      } catch (err) {
        console.error("Error fetching balance:", err);
      }
    };
    fetchBalance();
  }, [account]);

  return (
    // This div is now the main page container.
    // It will be rendered inside your Layout.js and be
    // perfectly centered and aligned.
    <div className="max-w-6xl mx-auto px-6 md:px-10 pb-24 flex flex-col items-center justify-center min-h-[calc(100vh_-_7rem)]">
      
      {/* The "Google" Title */}
      <h1 className="text-5xl font-bold text-gray-200 mb-8 text-center">
        <span className="text-[#1db954]">Music</span>Chain Wallet
      </h1>

      {/* The "Search Bar" Container - Simplified and No Icons */}
      <div className="w-full max-w-xl bg-gray-900 border border-gray-700/50 rounded-full shadow-lg flex items-center justify-center px-6 py-3.5 mb-8">
        
        {/* Centered Balance Display */}
        <div className="flex-grow text-center">
          {balance ? (
            <span className="text-2xl font-bold text-[#1db954] tracking-wider">
              {parseFloat(balance).toFixed(5)} ETH
            </span>
          ) : (
            <span className="text-lg text-gray-400">Loading balance...</span>
          )}
        </div>
        
      </div>

      {/* The "Search Buttons" */}
      <div className="flex space-x-4 mb-16">
        <Link
          to="/transactions"
          className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium py-2 px-6 rounded-full transition duration-300"
        >
          View Transactions
        </Link>
        <Link
          to="/profile"
          className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium py-2 px-6 rounded-full transition duration-300"
        >
          My Profile
        </Link>
      </div>

      {/* The Connected Account Address */}
      {account && (
        <div className="text-center text-gray-500 text-sm">
          <p>Connected Wallet</p>
          <p className="font-mono text-gray-400">{account}</p>
        </div>
      )}
    </div>
  );
}

