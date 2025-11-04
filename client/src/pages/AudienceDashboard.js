import { useState, useEffect, useCallback } from "react"; // <-- Import useCallback
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

function AudienceDashboard() {
  const { account, contract, isArtist, checkUserRole } = useAuth();
  const navigate = useNavigate();

  const [listedSongs, setListedSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [balance, setBalance] = useState(null);

  const formatIpfsUrl = (ipfsUrl) => {
    if (!ipfsUrl || typeof ipfsUrl !== "string") return null;
    if (ipfsUrl.startsWith("ipfs://")) {
      return `https://gateway.pinata.cloud/ipfs/${ipfsUrl.split("ipfs://")[1]}`;
    }
    return `https://gateway.pinata.cloud/ipfs/${ipfsUrl}`;
  };

  // ✅ Wrapped fetchListedSongs in useCallback to fix useEffect dependency
  const fetchListedSongs = useCallback(async () => {
    if (!contract) return;
    setIsLoading(true);
    try {
      const listedEvents = await contract.queryFilter("SongListed");
      const items = [];
      for (const e of listedEvents) {
        const { tokenId, seller, price } = e.args;
        const listing = await contract.listings(tokenId, seller).catch(() => null);
        if (!listing || !listing.active) continue;
        const uri = await contract.uri(tokenId);
        const res = await fetch(formatIpfsUrl(uri));
        const meta = await res.json();
        items.push({
          tokenId: Number(tokenId),
          seller,
          name: meta.name || `Song #${tokenId}`,
          artist: meta.artist || "Unknown Artist",
          genre: meta.genre || "N/A",
          imageUrl: formatIpfsUrl(meta.image),
          priceETH: ethers.formatEther(price),
        });
      }
      setListedSongs(items.reverse());
    } catch (err) {
      console.error("Error fetching listed songs:", err);
    } finally {
      setIsLoading(false);
    }
  }, [contract]); // <-- Added contract as dependency

  useEffect(() => {
    if (contract) { // Check if contract exists before fetching
      fetchListedSongs();
    }
  }, [contract, fetchListedSongs]); // <-- Added fetchListedSongs

  useEffect(() => {
    if (!account) return;
    (async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const bal = await provider.getBalance(account);
      setBalance(ethers.formatEther(bal));
    })();
  }, [account]);

  const handleStake = async () => {
    if (!window.ethereum) return alert("MetaMask not detected!");
    setIsStaking(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const connected = contract.connect(signer);
      const tx = await connected.stakeToBecomeArtist({
        value: ethers.parseEther("0.1"),
      });
      await tx.wait();
      alert("🎨 You are now an Artist!");
      await checkUserRole(account, connected); // Assuming checkUserRole is passed from context
      navigate("/artist");
    } catch (error) {
      console.error("Error staking:", error);
      alert(`❌ Staking failed: ${error.reason || "Transaction reverted"}`);
    } finally {
      setIsStaking(false);
    }
  };

  const handleBuy = async (tokenId, seller, price) => {
    if (!contract) return;
    try {
      // Need a signer to send a transaction
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const connected = contract.connect(signer);
      const tx = await connected.buyListedSong(tokenId, seller, {
        value: ethers.parseEther(price),
      });
      await tx.wait();
      alert("✅ Song purchased successfully!");
      fetchListedSongs();
    } catch (err) {
      console.error("Error buying song:", err);
      alert(`Purchase failed: ${err.reason || "Check console for details."}`);
    }
  };

  return (
    // This is your main layout div that matches your Marketplace
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
      <Navbar />

      {/* This is the padding div that fixes the alignment */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-32 pb-24">
        {/* Wallet Summary */}
        {/* You had an empty tag here, I've removed it */}

        <header className="text-center mb-12">
          {/* CORRECTED THE TITLE */}
          <h1 className="text-4xl font-extrabold text-[#1db954] mb-2">
            🎧 Audience Dashboard
          </h1>
          <p className="text-gray-400">
            Discover and collect unique music NFTs from talented artists.
          </p>
        </header>

        {/* Become Artist Card */}
        {!isArtist && account && (
          <div className="flex justify-center mb-10">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-2xl shadow-lg w-full max-w-md text-center">
              <h2 className="text-3xl font-bold mb-2 text white">Become an Artist 🎨</h2>
              <p className="text-gray-200 mb-4">
                Stake <span className="font-bold">0.1 ETH</span> to start uploading
                and selling your own music NFTs.
              </p>
              <button
                onClick={handleStake}
                disabled={isStaking}
                className={`px-6 py-3 rounded-xl font-semibold text-lg transition-colors ${
                  isStaking
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#1db954] hover:bg-[#1ed760] text-black"
                }`}
              >
                {isStaking
                  ? "Processing..."
                  : "🎵 Stake 0.1 ETH to Become an Artist"}
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
  );
}

// THIS IS THE LINE THAT WAS MISSING AND CAUSED YOUR ERROR
export default AudienceDashboard;

