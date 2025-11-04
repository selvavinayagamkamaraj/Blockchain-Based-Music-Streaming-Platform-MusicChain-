import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function ResalePage() {
  const { account, contract, isArtist } = useAuth();
  const [ownedSongs, setOwnedSongs] = useState([]);
  const [priceInputs, setPriceInputs] = useState({});
  const [loading, setLoading] = useState(false);

  // --- Format IPFS URLs ---
  const formatIpfsUrl = (ipfsUrl) => {
    if (!ipfsUrl) return null;
    if (ipfsUrl.startsWith("ipfs://")) {
      return `https://gateway.pinata.cloud/ipfs/${ipfsUrl.split("ipfs://")[1]}`;
    }
    return `https://gateway.pinata.cloud/ipfs/${ipfsUrl}`;
  };

  // --- Fetch owned songs ---
  const fetchOwned = async () => {
    if (!contract || !account) return;
    setLoading(true);

    try {
      const total = await contract.tokenCounter();
      const items = [];

      for (let i = 1; i <= Number(total); i++) {
        const balance = await contract.balanceOf(account, i);
        if (balance > 0) {
          const uri = await contract.uri(i);
          const res = await fetch(formatIpfsUrl(uri));
          if (!res.ok) continue;
          const meta = await res.json();

          items.push({
            tokenId: i,
            name: meta.name || `Song #${i}`,
            image: formatIpfsUrl(meta.image),
            audio: meta.animation_url ? formatIpfsUrl(meta.animation_url) : null,
          });
        }
      }

      setOwnedSongs(items.reverse());
    } catch (err) {
      console.error("Error fetching owned songs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwned();
  }, [contract, account]);

  // --- Handle resale ---
  const handleResell = async (tokenId) => {
    if (!contract) return;
    try {
      const priceEth = priceInputs[tokenId];
      if (!priceEth || isNaN(priceEth) || Number(priceEth) <= 0) {
        alert("⚠️ Enter a valid resale price in ETH.");
        return;
      }

      const priceWei = ethers.parseEther(priceEth.toString());
      const tx = await contract.listSongForSale(tokenId, priceWei);
      await tx.wait();

      alert("✅ Song listed for resale successfully!");
      setPriceInputs((prev) => ({ ...prev, [tokenId]: "" }));
      fetchOwned();
    } catch (err) {
      console.error("Error listing song for resale:", err);
      alert(err.reason || "❌ Transaction failed. Check console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6 text-yellow-400 text-center">
          🔁 Resell Your Songs
        </h1>

        {isArtist && (
          <p className="text-center text-gray-400 mb-6">
            (Artists cannot resell their own creations. This page is for users who purchased songs.)
          </p>
        )}

        {loading ? (
          <p className="text-center text-gray-400">Loading your songs...</p>
        ) : ownedSongs.length === 0 ? (
          <p className="text-center text-gray-500">
            You don’t own any songs available for resale.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ownedSongs.map((song) => (
              <div
                key={song.tokenId}
                className="bg-gray-900 p-4 rounded-xl shadow-lg hover:shadow-xl transition"
              >
                <img
                  src={
                    song.image ||
                    "https://placehold.co/300x300/191414/FFFFFF?text=Music"
                  }
                  alt={song.name}
                  className="rounded-lg mb-3"
                />
                <h3 className="text-lg font-semibold mb-2">{song.name}</h3>

                {!isArtist && (
                  <>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="Set price in ETH"
                      value={priceInputs[song.tokenId] || ""}
                      onChange={(e) =>
                        setPriceInputs({
                          ...priceInputs,
                          [song.tokenId]: e.target.value,
                        })
                      }
                      className="w-full p-2 rounded bg-gray-800 text-white mb-3"
                    />
                    <button
                      onClick={() => handleResell(song.tokenId)}
                      className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold"
                    >
                      List for Sale
                    </button>
                  </>
                )}

                {song.audio && (
                  <audio controls className="w-full mt-3">
                    <source src={song.audio} type="audio/mpeg" />
                  </audio>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

