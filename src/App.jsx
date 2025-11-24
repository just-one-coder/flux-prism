import React, { useState, useEffect } from 'react';
import { useWeb3 } from './hooks/useWeb3';
import Header from './components/Layout/Header';
import Home from './pages/Home';
import Register from './pages/Register';
import Verify from './pages/Verify';
import Dashboard from './pages/Dashboard';
import Gallery from './pages/Gallery';
import './styles/globals.css';

function App() {
  const { 
    account, 
    provider, 
    signer, 
    contract, 
    isConnected, 
    isConnecting,
    isMetaMaskInstalled, // Add this
    connectWallet, 
    disconnectWallet 
  } = useWeb3();
  
  const [currentPage, setCurrentPage] = useState('home');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Check system theme preference
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light');
    }
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const renderPage = () => {
    const commonProps = {
      account,
      provider,
      signer,
      contract,
      isConnected,
      theme
    };

    switch (currentPage) {
      case 'register':
        return <Register {...commonProps} />;
      case 'verify':
        return <Verify {...commonProps} />;
      case 'dashboard':
        return <Dashboard {...commonProps} />;
      case 'gallery':
        return <Gallery {...commonProps} setCurrentPage={setCurrentPage} />;
      default:
        return <Home {...commonProps} setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-gray-100'
    }`}>
      <Header 
        account={account} 
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
        isConnected={isConnected}
        isConnecting={isConnecting}
        isMetaMaskInstalled={isMetaMaskInstalled} // Add this prop
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <main className="container mx-auto px-4 py-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;