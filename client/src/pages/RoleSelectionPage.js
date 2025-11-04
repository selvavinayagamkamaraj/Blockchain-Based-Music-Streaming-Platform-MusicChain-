import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar'; // Assuming Navbar is used here

function RoleSelectionPage() {
  const navigate = useNavigate();
  const { isArtist, account } = useAuth();

  // If the user somehow gets here without connecting, guide them back.
  if (!account) {
    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Please connect your wallet first.</h1>
                <button className="connect-wallet-btn" style={{marginTop: '30px'}} onClick={() => navigate('/')}>Back to Login</button>
            </div>
        </div>
    );
  }

  return (
    <div>
        <Navbar />
        <div className="login-container" style={{paddingTop: '80px', height: 'auto', minHeight: 'calc(100vh - 80px)'}}>
            <div className="login-box">
                <h1>Choose Your Role</h1>
                <p className="subtitle">Welcome, {account.substring(0, 6)}...{account.substring(38)}</p>
                
                <div style={{marginBottom: '30px'}}>
                    Your verified role is: <strong>{isArtist ? "Artist" : "Audience"}</strong>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {/* Artist button is disabled if not an artist */}
                    <button 
                      className="role-button artist"
                      onClick={() => navigate('/artist')} 
                      disabled={!isArtist}
                      title={!isArtist ? "This option is only for registered artists" : "Go to your artist dashboard"}
                    >
                      Enter as Artist
                    </button>
                    
                    <button 
                      className="role-button audience" // Style might need adjustment in CSS if different from connect button
                      onClick={() => navigate('/audience')}
                    >
                      Enter as Audience
                    </button>
                </div>
                {!isArtist && <p style={{marginTop: '20px', fontSize: '0.9rem', color: '#b3b3b3'}}>Note: The Artist Dashboard is only available to wallet addresses that have staked 0.1 ETH.</p>}
            </div>
        </div>
    </div>
  );
}

export default RoleSelectionPage;