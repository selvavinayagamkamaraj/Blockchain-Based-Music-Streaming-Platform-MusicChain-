import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

function MarketplacePage() {
  const { account, contract, isArtist } = useAuth();
  const [listedSongs, setListedSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Helper to format IPFS URLs
  const formatIpfsUrl = (ipfsUrl) => {
    if (!ipfsUrl) return null;
    if (ipfsUrl.startsWith("ipfs://")) {
      return `https://gateway.pinata.cloud/ipfs/${ipfsUrl.slice(7)}`;
    }
    return `https://gateway.pinata.cloud/ipfs/${ipfsUrl}`;
  };

  // ✅ Fetch all active listings from blockchain
  const fetchListedSongs = async () => {
    if (!contract) return;
    setLoading(true);

    try {
      const total = await contract.tokenCounter();
      const items = [];

      for (let i = 1; i <= Number(total); i++) {
        // get listing data
        let listing;
        try {
          listing = await contract.listings(i);
        } catch {
          continue; // skip if mapping lookup fails
        }

        if (!listing.active) continue;

        // fetch metadata
        const uri = await contract.uri(i);
        const res = await fetch(formatIpfsUrl(uri));
        if (!res.ok) continue;
        const meta = await res.json();

        // original artist info
        let artistAddress = "";
        try {
          const song = await contract.songDetails(i);
          artistAddress = song.originalArtist;
        } catch {
          artistAddress = "Unknown";
        }

        items.push({
          tokenId: Number(i),
          seller: listing.seller,
          name: meta.name || `Song #${i}`,
          artist: meta.artist || "Unknown Artist",
          genre: meta.genre || "N/A",
          imageUrl: formatIpfsUrl(meta.image),
          audioUrl: formatIpfsUrl(meta.animation_url),
          price: ethers.formatEther(listing.price),
          artistAddress,
        });
      }

      setListedSongs(items.reverse());
    } catch (err) {
      console.error("Error fetching marketplace songs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListedSongs();
  }, [contract]);

  // ✅ Buy song (for audience only)
  const handleBuy = async (tokenId, price) => {
    if (!contract) return;
    try {
      const tx = await contract.buyListedSong(tokenId, {
        value: ethers.parseEther(price),
      });
      await tx.wait();
      alert("🎉 Song purchased successfully!");
      fetchListedSongs();
    } catch (err) {
      console.error("Error buying song:", err);
      alert(`Failed to buy song: ${err.reason || err.message}`);
    }
  };

  return (
    <div className="dashboard-container min-h-screen bg-black text-white">
      <Navbar />

      <header className="text-center py-8">
        <h1 className="text-3xl font-bold mb-2">🎶 Marketplace</h1>
        <p className="text-gray-400">
          {isArtist
            ? "You can view all songs currently listed on the marketplace."
            : "Discover and buy music NFTs listed for resale."}
        </p>
      </header>

      <main className="px-8 pb-16">
        {loading ? (
          <p className="text-center text-gray-400">Loading marketplace...</p>
        ) : listedSongs.length === 0 ? (
          <p className="text-center text-gray-500">
            No songs listed for sale right now.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listedSongs.map((song) => {
              const isOwnListing =
                account &&
                song.seller.toLowerCase() === account.toLowerCase();

              return (
                <div
                  key={`${song.tokenId}-${song.seller}`}
                  className="bg-gray-900 p-4 rounded-xl shadow-md hover:shadow-lg transition"
                >
                  <img
                    src={
                      song.imageUrl ||
                      "https://placehold.co/300x300/191414/FFFFFF?text=Music"
                    }
                    alt={song.name}
                    className="rounded-lg mb-3"
                  />
                  <h3 className="text-xl font-semibold">{song.name}</h3>
                  <p className="text-gray-400 text-sm">
                    Artist: {song.artist}
                  </p>
                  <p className="text-gray-400 text-sm mb-1">
                    Seller: {song.seller.slice(0, 6)}...
                    {song.seller.slice(-4)}
                  </p>
                  <p className="text-yellow-400 font-medium mb-2">
                    💰 {song.price} ETH
                  </p>

                  {song.audioUrl && (
                    <audio controls className="w-full mt-2 rounded">
                      <source src={song.audioUrl} type="audio/mpeg" />
                    </audio>
                  )}

                  {/* Hide Buy button for artists or self-listings */}
                  {!isArtist && !isOwnListing && (
                    <button
                      onClick={() => handleBuy(song.tokenId, song.price)}
                      className="mt-3 w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-white font-semibold"
                    >
                      Buy Now
                    </button>
                  )}

                  {isOwnListing && (
                    <p className="mt-3 text-green-400 font-semibold text-center">
                      ✅ Your Listing
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default MarketplacePage;

