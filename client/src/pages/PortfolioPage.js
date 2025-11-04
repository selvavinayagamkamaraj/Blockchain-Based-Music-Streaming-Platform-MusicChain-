import React from 'react';
import Navbar from '../components/Navbar'; // Make sure this path is correct

function PortfolioPage() {
  const teamMembers = [
    { name: 'GIRINATH', imageUrl: '/images/girinath.jpg' },
    { name: 'Selva Vinayagam Kamaraj', imageUrl: '/images/selva.jpg' },
    { name: 'Abhinand S', imageUrl: '/images/abhinand.jpg' },
    { name: 'Shahil Yousuf S', imageUrl: '/images/shahil.jpg' },
    { name: 'Hariprem K', imageUrl: '/images/hariprem.jpg' }
  ];

  return (
    <>
      <Navbar />
      {/* This 'dashboard-container' class from App.css fixes the layout */}
      <div className="dashboard-container">
        
        {/* This 'dashboard-header' class centers your title */}
        <header className="dashboard-header">
          <h1>Our Team</h1>
          <p>The minds behind MusicChain.</p>
        </header>

        {/* This 'team-horizontal-row' class will create the row layout */}
        <main className="team-horizontal-row">
          
          {teamMembers.map((member, index) => (
            // This 'team-card' class styles each member
            <div key={index} className="team-card">
              <img 
                src={member.imageUrl} 
                alt={member.name} 
                // This 'team-photo' class makes the image a small circle
                className="team-photo" 
              />
              <h3>{member.name}</h3>
            </div>
          ))}
          
        </main>
      </div>
    </>
  );
}

export default PortfolioPage;

