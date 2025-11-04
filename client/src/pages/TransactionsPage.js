import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function TransactionsPage() {
  const { account, contract, isArtist } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const formatIpfsUrl = (ipfsUrl) =>
    ipfsUrl?.startsWith("ipfs://")
      ? `https://gateway.pinata.cloud/ipfs/${ipfsUrl.split("ipfs://")[1]}`
      : `https://gateway.pinata.cloud/ipfs/${ipfsUrl}`;

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!contract || !account) return;
      setLoading(true);
      try {
        const soldFilter = contract.filters.SongSold();
        const createdFilter = contract.filters.SongCreated();

        const soldEvents = await contract.queryFilter(soldFilter);
        const createdEvents = await contract.queryFilter(createdFilter);

        const all = [];

        for (const e of soldEvents) {
          const { tokenId, seller, buyer, price, royaltyReceiver, royaltyAmount } = e.args;
          const uri = await contract.uri(tokenId);
          const res = await fetch(formatIpfsUrl(uri));
          const meta = await res.json();

          let type = "";
          if (buyer.toLowerCase() === account.toLowerCase()) type = "Bought";
          else if (seller.toLowerCase() === account.toLowerCase()) type = "Sold";
          else if (isArtist && royaltyReceiver?.toLowerCase() === account.toLowerCase())
            type = "Royalty Earned";
          else continue;

          const block = await e.getBlock();
          const date = new Date(block.timestamp * 1000).toLocaleString();

          all.push({
            type,
            songName: meta.name || `Song #${tokenId}`,
            tokenId: Number(tokenId),
            price: ethers.formatEther(price),
            royalty: royaltyAmount ? ethers.formatEther(royaltyAmount) : "0",
            seller,
            buyer,
            date,
          });
        }

        for (const e of createdEvents) {
          const { tokenId, artist } = e.args;
          if (artist.toLowerCase() !== account.toLowerCase()) continue;

          const uri = await contract.uri(tokenId);
          const res = await fetch(formatIpfsUrl(uri));
          const meta = await res.json();

          all.push({
            type: "Created",
            songName: meta.name || `Song #${tokenId}`,
            tokenId: Number(tokenId),
            price: "-",
            royalty: "-",
            seller: "-",
            buyer: "-",
            date: "—",
          });
        }

        setTransactions(all.reverse());
      } catch (err) {
        console.error("Error loading transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [contract, account, isArtist]);

  const badgeClass = (type) => {
    switch (type) {
      case "Bought":
        return "bg-green-500/15 text-green-400 border border-green-600/40";
      case "Sold":
        return "bg-blue-500/15 text-blue-400 border border-blue-600/40";
      case "Royalty Earned":
        return "bg-purple-500/15 text-purple-400 border border-purple-600/40";
      case "Created":
        return "bg-yellow-500/15 text-yellow-400 border border-yellow-600/40";
      default:
        return "bg-gray-700 text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0d0d] via-[#121212] to-black text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-28 pb-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1db954] mb-3 tracking-wide drop-shadow-lg">
            Transaction History
          </h1>
          <p className="text-gray-400 text-lg">
            Your complete history of <span className="text-[#1db954] font-semibold">NFT creations</span>, sales, and royalties.
          </p>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-center text-gray-400 text-lg">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">No transactions found.</p>
        ) : (
          <div className="overflow-x-auto bg-[#181818]/90 border border-gray-800 rounded-2xl shadow-xl backdrop-blur-sm">
            <table className="w-full border-collapse text-sm md:text-base">
              <thead className="bg-[#1b1b1b] text-[#1db954] uppercase text-sm tracking-wide">
                <tr>
                  <th className="py-4 px-6 text-left">Type</th>
                  <th className="py-4 px-6 text-left">Song</th>
                  <th className="py-4 px-6 text-center">Price (ETH)</th>
                  <th className="py-4 px-6 text-center">Royalty (ETH)</th>
                  <th className="py-4 px-6 text-center">Seller</th>
                  <th className="py-4 px-6 text-center">Buyer</th>
                  <th className="py-4 px-6 text-center">Date</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((tx, i) => (
                  <tr
                    key={i}
                    className={`transition duration-300 ${
                      i % 2 === 0 ? "bg-[#121212]" : "bg-[#181818]"
                    } hover:bg-[#1e1e1e]`}
                  >
                    <td className="py-3 px-6 text-left">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClass(
                          tx.type
                        )}`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-6 font-medium text-gray-100">{tx.songName}</td>
                    <td className="py-3 px-6 text-center text-gray-300">{tx.price}</td>
                    <td className="py-3 px-6 text-center text-gray-300">{tx.royalty}</td>
                    <td className="py-3 px-6 text-center text-gray-400 font-mono text-sm">
                      {tx.seller !== "-"
                        ? `${tx.seller.slice(0, 6)}...${tx.seller.slice(-4)}`
                        : "-"}
                    </td>
                    <td className="py-3 px-6 text-center text-gray-400 font-mono text-sm">
                      {tx.buyer !== "-"
                        ? `${tx.buyer.slice(0, 6)}...${tx.buyer.slice(-4)}`
                        : "-"}
                    </td>
                    <td className="py-3 px-6 text-center text-gray-400">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
