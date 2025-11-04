import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function LoginPage() {
  const { connectWallet, loading } = useAuth();

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-logo">MusicChain</h1>
        <p className="subtitle">Your Music, Your Rules.</p>
        
        <button 
          className="connect-wallet-btn" 
          onClick={connectWallet} 
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Login with MetaMask'}
        </button>
        
        <div className="login-footer">
            <p>Don't have a wallet? <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">Get MetaMask</a></p>
            <Link to="/portfolio">Meet the Developers</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;