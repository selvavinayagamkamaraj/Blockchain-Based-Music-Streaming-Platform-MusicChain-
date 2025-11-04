// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import contractInfo from "../contractInfo.json";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isArtist, setIsArtist] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const contractAddress = contractInfo.address;
  const contractABI = contractInfo.abi;

  /** ✅ Check if current wallet is an artist */
  const checkUserRole = useCallback(async (userAccount, contractInstance) => {
    if (!userAccount || !contractInstance) return false;
    try {
      const status = await contractInstance.isArtist(userAccount);
      setIsArtist(status);
      return status;
    } catch (err) {
      console.error("Error checking role:", err);
      setIsArtist(false);
      return false;
    }
  }, []);

  /** ✅ Connect wallet */
  const connectWallet = useCallback(async () => {
    setLoading(true);
    try {
      if (!window.ethereum) {
        alert("🦊 Please install MetaMask first.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const userAccount = accounts[0];
      const instance = new ethers.Contract(contractAddress, contractABI, signer);

      setAccount(userAccount);
      setContract(instance);

      window.contract = instance;
      window.account = userAccount;

      console.log("✅ Connected:", userAccount);
      console.log("✅ Contract:", contractAddress);

      await checkUserRole(userAccount, instance);

      navigate("/select-role");
    } catch (err) {
      console.error("Wallet connection error:", err);
    } finally {
      setLoading(false);
    }
  }, [contractAddress, contractABI, checkUserRole, navigate]);

  /** ✅ Auto reconnect if wallet already connected */
  useEffect(() => {
    const autoReconnect = async () => {
      if (window.ethereum?.selectedAddress && !account) {
        await connectWallet();
      }
    };
    autoReconnect();
  }, [account, connectWallet]);

  /** ✅ Detect account change in MetaMask */
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        // MetaMask disconnected
        console.warn("⚠️ MetaMask disconnected");
        setAccount(null);
        setIsArtist(false);
        setContract(null);
        navigate("/");
      } else {
        const newAccount = accounts[0];
        console.log("🔄 Account switched:", newAccount);

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const newContract = new ethers.Contract(contractAddress, contractABI, signer);

        setAccount(newAccount);
        setContract(newContract);

        window.contract = newContract;
        window.account = newAccount;

        const status = await checkUserRole(newAccount, newContract);
        if (status) navigate("/artist");
        else navigate("/audience");
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () => window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
  }, [contractAddress, contractABI, checkUserRole, navigate]);

  /** ✅ Detect network change */
  useEffect(() => {
    if (!window.ethereum) return;
    const handleChainChanged = () => {
      console.log("🔁 Network changed — reloading app...");
      window.location.reload();
    };
    window.ethereum.on("chainChanged", handleChainChanged);
    return () => window.ethereum.removeListener("chainChanged", handleChainChanged);
  }, []);

  const value = {
    account,
    contract,
    isArtist,
    loading,
    connectWallet,
    checkUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
