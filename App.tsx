import React from 'react';
import CybersecurityBackground from './cybersecurity-background';
import './App.css';

function App() {
  return (
    <div className="App">
      {/* Background Effect */}
      <CybersecurityBackground 
        width={window.innerWidth}
        height={window.innerHeight}
        autoStart={true}
        onPhaseChange={(phase) => {
          console.log(`Phase changed to: ${phase}`);
        }}
      />
      
      {/* Your content goes here */}
      <div className="content">
        <header className="hero">
          <h1>Secure System Dashboard</h1>
          <p>Advanced cybersecurity monitoring in real-time</p>
        </header>
        
        <main className="main-content">
          <div className="card">
            <h2>System Status</h2>
            <p>All systems operational</p>
          </div>
          
          <div className="card">
            <h2>Threat Detection</h2>
            <p>Active monitoring enabled</p>
          </div>
          
          <div className="card">
            <h2>Security Agents</h2>
            <p>Ready for deployment</p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;