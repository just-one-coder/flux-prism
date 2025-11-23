// components/Debug/DebugEnv.jsx
import React from 'react';

const DebugEnv = () => {
  const envVars = {
    VITE_CONTRACT_ADDRESS: import.meta.env.VITE_CONTRACT_ADDRESS,
    VITE_PINATA_JWT: import.meta.env.VITE_PINATA_JWT ? '***' + import.meta.env.VITE_PINATA_JWT.slice(-4) : 'Not set',
    VITE_ALCHEMY_SEPOLIA_URL: import.meta.env.VITE_ALCHEMY_SEPOLIA_URL ? 'Set' : 'Not set',
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000 
    }}>
      <h4>Environment Variables Debug:</h4>
      <pre>{JSON.stringify(envVars, null, 2)}</pre>
    </div>
  );
};

export default DebugEnv;