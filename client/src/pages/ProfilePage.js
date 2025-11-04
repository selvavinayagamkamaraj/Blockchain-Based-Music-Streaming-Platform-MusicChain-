// ✅ src/pages/ProfilePage.js

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import EditProfileModal from "../components/EditProfileModal";

export default function ProfilePage() {
  const { account, contract, isArtist } = useAuth();
  const [balance, setBalance] = useState("Loading...");
  const [songCount, setSongCount] = useState(0);
  const [displayName, setDisplayName] = useState("Your Display Name");
  const [bio, setBio] = useState("Tell us something about yourself!");
  const [isEditing, setIsEditing] = useState(false);

  // ✅ Fetch wallet balance
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

  // ✅ Fetch total songs (using tokenCounter)
  useEffect(() => {
    const fetchSongCount = async () => {
      if (!contract) return;
      try {
        const count = await contract.tokenCounter();
        setSongCount(Number(count));
      } catch (err) {
        console.error("Error fetching song count:", err);
      }
    };
    fetchSongCount();
  }, [contract]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0d0d0d] to-black text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 md:px-10 pb-24 pt-32">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1db954] mb-3">
            Your Profile
          </h1>
          <p className="text-gray-400 text-lg">
            Manage your blockchain identity and view your activity.
          </p>
        </header>

        {/* Profile Card */}
        <div className="bg-[#111]/80 backdrop-blur-md border border-gray-800 rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Section 1: On-Chain Info */}
          <div className="mb-8 pb-8 border-b border-gray-800">
            <h2 className="text-2xl font-semibold text-gray-200 mb-6">
              On-Chain Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Wallet Address
                </label>
                <p className="text-lg text-gray-300 font-mono break-all">
                  {account || "Not connected"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Current Role
                </label>
                <p className="text-lg text-gray-300">
                  {isArtist ? "Artist 🎨" : "Audience 🎧"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Balance
                </label>
                <p className="text-lg text-[#1db954] font-bold">
                  {balance === "Loading..."
                    ? "Loading..."
                    : `${parseFloat(balance).toFixed(5)} ETH`}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Total Songs Minted
                </label>
                <p className="text-lg text-gray-300">{songCount}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Editable Profile */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-200 mb-6">
              Public Profile
            </h2>

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-500">
                Display Name
              </label>
              <p className="text-lg text-gray-300">{displayName}</p>
            </div>

            <div className="mb-8">
              <label className="text-sm font-medium text-gray-500">Bio</label>
              <p className="text-lg text-gray-300 italic">{bio}</p>
            </div>

            <div className="text-left">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-[#1db954] hover:bg-[#1ed760] text-black font-semibold py-2 px-6 rounded-lg transition-all"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Edit Modal */}
      {isEditing && (
        <EditProfileModal
          onClose={() => setIsEditing(false)}
          onSave={(name, bioText) => {
            setDisplayName(name);
            setBio(bioText);
            setIsEditing(false);
          }}
          currentName={displayName}
          currentBio={bio}
        />
      )}
    </div>
  );
}
