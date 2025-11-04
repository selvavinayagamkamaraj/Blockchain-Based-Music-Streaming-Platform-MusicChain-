// src/pages/MySongsPage.js
import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function MySongsPage() {
  const { account, contract, isArtist } = useAuth();
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Robust IPFS URL formatter
  const formatIpfsUrl = (url) => {
    if (!url || typeof url !== "string") return null;

    // Case 1: Already full HTTPS/HTTP link
    if (url.startsWith("https://") || url.startsWith("http://")) {
      return url;
    }

    // Case 2: ipfs://CID/path
    if (url.startsWith("ipfs://")) {
      return `https://blush-wooden-rabbit-24.mypinata.cloud/ipfs/${url.replace("ipfs://", "")}`;
    }

    // Case 3: raw CID
    if (/^[a-zA-Z0-9]{46,}$/.test(url)) {
      return `https://blush-wooden-rabbit-24.mypinata.cloud/ipfs/${url}`;
    }

    return url;
  };

  // ✅ Fetch Songs (uploaded or owned)
  const fetchSongs = useCallback(async () => {
    if (!contract || !account) return;
    setIsLoading(true);

    try {
      const total = await contract.tokenCounter();
      const items = [];

      for (let i = 1; i <= Number(total); i++) {
        const song = await contract.songDetails(i);
        const metadataUri = await contract.uri(i);
        const formatted = formatIpfsUrl(metadataUri);

        console.log("🔍 Fetching metadata from:", formatted);

        const res = await fetch(formatted);
        if (!res.ok) {
          console.warn(`⚠️ Failed to fetch metadata for token ${i}`);
          continue;
        }

        const meta = await res.json();

        const songData = {
          tokenId: i,
          name: meta.name || `Song #${i}`,
          artist: meta.artist || "Unknown Artist",
          genre: meta.genre || "N/A",
          imageUrl: formatIpfsUrl(meta.image),
          audio: meta.animation_url ? formatIpfsUrl(meta.animation_url) : null,
          originalArtist: song.originalArtist,
        };

        // Artist can always see their own songs
        if (isArtist && song.originalArtist.toLowerCase() === account.toLowerCase()) {
          items.push(songData);
          continue;
        }

        // Audience can only see owned songs
        const balance = await contract.balanceOf(account, i);
        if (balance > 0) items.push(songData);
      }

      setSongs(items.reverse());
    } catch (err) {
      console.error("❌ Error fetching songs:", err);
    } finally {
      setIsLoading(false);
    }
  }, [contract, account, isArtist]);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
      <Navbar />

      <header className="text-center pt-32 pb-8">
        <h1 className="text-4xl font-extrabold text-[#1db954] mb-2">
          {isArtist ? "🎵 My Uploaded Songs" : "🎶 My Purchased Songs"}
        </h1>
        <p className="text-gray-400 text-lg">
          {isArtist
            ? "Listen to the songs you’ve created — whether sold or not."
            : "Enjoy your owned music NFTs — stream directly from IPFS!"}
        </p>
      </header>

      <main className="px-8 pb-16 max-w-6xl mx-auto">
        {isLoading ? (
          <p className="text-center text-gray-400">Loading your songs...</p>
        ) : songs.length === 0 ? (
          <p className="text-center text-gray-500">
            {isArtist
              ? "You haven’t created any songs yet."
              : "You don’t own any songs yet."}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {songs.map((song) => (
              <div
                key={song.tokenId}
                className="bg-gray-900/90 backdrop-blur-md border border-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition"
              >
                <img
                  src={
                    song.imageUrl ||
                    "https://placehold.co/300x300/191414/FFFFFF?text=Music"
                  }
                  alt={song.name}
                  className="rounded-lg mb-3 w-full h-56 object-cover"
                />
                <h3 className="text-xl font-semibold mb-1">{song.name}</h3>
                <p className="text-gray-400 text-sm">Artist: {song.artist}</p>
                <p className="text-gray-400 text-sm mb-2">Genre: {song.genre}</p>

                {song.audio ? (
                  <audio controls className="w-full mt-2 rounded">
                    <source src={song.audio} type="audio/mpeg" />
                    Your browser does not support the audio tag.
                  </audio>
                ) : (
                  <p className="text-gray-500 text-sm italic">
                    No audio file available.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
