import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function ArtistDashboard() {
  const { account, contract, isArtist, checkUserRole } = useAuth();
  const navigate = useNavigate();

  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [artistSongs, setArtistSongs] = useState([]);
  const [ipfsMetadataHash, setIpfsMetadataHash] = useState("");
  const [royaltyPercentage, setRoyaltyPercentage] = useState("");
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [songToSell, setSongToSell] = useState(null);
  const [sellPrice, setSellPrice] = useState("");
  const [isListing, setIsListing] = useState(false);

  // ✅ Helper for IPFS URLs
  const formatIpfsUrl = (ipfsUrl) => {
    if (!ipfsUrl || typeof ipfsUrl !== "string") return null;
    if (ipfsUrl.startsWith("ipfs://")) {
      return `https://gateway.pinata.cloud/ipfs/${ipfsUrl.split("ipfs://")[1]}`;
    }
    return `https://gateway.pinata.cloud/ipfs/${ipfsUrl}`;
  };

  // ✅ Universal safe listing fetcher
  const getListing = async (tokenId, seller) => {
    if (!contract) return { active: false, price: 0 };
    try {
      // Try 2-arg version
      return await contract.listings(tokenId, seller);
    } catch {
      try {
        // Fallback to 1-arg version
        return await contract.listings(tokenId);
      } catch {
        return { active: false, price: 0 };
      }
    }
  };

  // ✅ Fetch artist-owned songs
  const fetchArtistSongs = useCallback(async () => {
    if (!contract || !account) return;
    setIsLoading(true);
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

          const listing = await getListing(i, account);
          items.push({
            tokenId: i,
            name: meta.name || `Song #${i}`,
            imageUrl: formatIpfsUrl(meta.image),
            isListed: listing.active,
            priceETH: listing.active
              ? ethers.formatEther(listing.price)
              : null,
          });
        }
      }
      setArtistSongs(items.reverse());
    } catch (error) {
      console.error("Error fetching artist songs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [contract, account]);

  useEffect(() => {
    if (!contract || !account) return;
    fetchArtistSongs();
    (async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const bal = await provider.getBalance(account);
      setBalance(ethers.formatEther(bal));
    })();
  }, [contract, account, fetchArtistSongs]);

  // ✅ Create new song
  const handleCreateSong = async (e) => {
    e.preventDefault();
    if (!contract || !ipfsMetadataHash || !royaltyPercentage) return;
    setIsCreating(true);
    try {
      const royaltyInBP = parseInt(royaltyPercentage) * 100;
      const tx = await contract.createSong(ipfsMetadataHash, royaltyInBP);
      await tx.wait();
      alert("✅ Song created successfully!");
      setIpfsMetadataHash("");
      setRoyaltyPercentage("");
      fetchArtistSongs();
    } catch (error) {
      console.error("Error creating song:", error);
      alert(error.reason || "Transaction failed");
    } finally {
      setIsCreating(false);
    }
  };

  // ✅ Open modal
  const handleOpenSellModal = (song) => {
    setSongToSell(song);
    setSellPrice("");
    setSellModalOpen(true);
  };

  // ✅ List song for sale
  const handleListSong = async (e) => {
    e.preventDefault();
    if (!contract || !songToSell || !sellPrice) return;
    setIsListing(true);
    try {
      const priceWei = ethers.parseEther(sellPrice.toString());
      const tx = await contract.listSongForSale(songToSell.tokenId, priceWei);
      await tx.wait();
      alert(`🎵 ${songToSell.name} listed for sale at ${sellPrice} ETH`);
      setSellModalOpen(false);
      fetchArtistSongs();
    } catch (error) {
      console.error("Error listing song:", error);
      alert(error.reason || "Listing failed.");
    } finally {
      setIsListing(false);
    }
  };

  // ✅ Unstake artist
  const handleUnstake = async () => {
    if (!contract) return;
    if (
      !window.confirm(
        "Are you sure you want to retire as an artist? 0.1 ETH will be refunded."
      )
    )
      return;
    try {
      const tx = await contract.unstakeAndRetire();
      await tx.wait();
      alert("You have retired as an artist.");
      await checkUserRole();
      navigate("/audience");
    } catch (error) {
      console.error("Error unstaking:", error);
      alert(error.reason || "Unstaking failed.");
    }
  };

  return (
    <div className="dashboard-container bg-black text-white min-h-screen">
      <Navbar />
      <header className="text-center py-6">
        <h1 className="text-3xl font-bold mb-2">🎨 Artist Dashboard</h1>
        {account && (
          <p className="text-gray-300">
            {account.slice(0, 6)}...{account.slice(-4)} |{" "}
            {balance ? `${parseFloat(balance).toFixed(4)} ETH` : "Loading..."}
          </p>
        )}
      </header>

      {isArtist && (
        <div className="text-center mb-6">
          <button
            onClick={handleUnstake}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold"
          >
            Unstake & Retire
          </button>
        </div>
      )}

      <main className="px-8">
        {/* Create Song */}
        <div className="bg-gray-900 p-6 rounded-xl mb-8">
          <h2 className="text-xl font-semibold mb-3">Create New Song NFT</h2>
          <form onSubmit={handleCreateSong}>
            <input
              type="text"
              placeholder="IPFS Metadata CID"
              value={ipfsMetadataHash}
              onChange={(e) => setIpfsMetadataHash(e.target.value)}
              className="w-full p-2 mb-3 rounded bg-gray-800 text-white"
              required
            />
            <input
              type="number"
              placeholder="Royalty % (e.g. 10)"
              value={royaltyPercentage}
              onChange={(e) => setRoyaltyPercentage(e.target.value)}
              className="w-full p-2 mb-3 rounded bg-gray-800 text-white"
              required
            />
            <button
              type="submit"
              disabled={isCreating}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold"
            >
              {isCreating ? "Creating..." : "Create Song"}
            </button>
          </form>
        </div>

        {/* Artist Songs */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Uploaded Songs</h2>
          {isLoading ? (
            <p>Loading your songs...</p>
          ) : artistSongs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {artistSongs.map((song) => (
                <div key={song.tokenId} className="bg-gray-800 p-4 rounded-xl">
                  <img
                    src={
                      song.imageUrl ||
                      "https://placehold.co/300x300/191414/FFFFFF?text=Music"
                    }
                    alt={song.name}
                    className="rounded-lg mb-3"
                  />
                  <h3 className="text-lg font-semibold">{song.name}</h3>
                  <p className="text-gray-400">
                    {song.isListed
                      ? `Listed for ${song.priceETH} ETH`
                      : "❌ Not listed"}
                  </p>
                  {!song.isListed && (
                    <button
                      onClick={() => handleOpenSellModal(song)}
                      className="mt-3 w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-white"
                    >
                      List for Sale
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>You haven’t created any songs yet.</p>
          )}
        </div>
      </main>

      {/* Sell Modal */}
      {sellModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center">
          <div className="bg-gray-900 p-6 rounded-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">List Song for Sale</h2>
            <form onSubmit={handleListSong}>
              <p className="mb-3">Song: {songToSell?.name}</p>
              <input
                type="number"
                step="0.001"
                placeholder="Price in ETH"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                className="w-full p-2 mb-4 rounded bg-gray-800 text-white"
                required
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSellModalOpen(false)}
                  className="bg-gray-600 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isListing}
                  className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold"
                >
                  {isListing ? "Listing..." : "List Song"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArtistDashboard;
