// Header.jsx
import React from 'react';
import { Sun, Moon, Home, Plus, Search, User, GalleryVertical, LogOut, Wallet, Download } from 'lucide-react';

const Header = ({ 
  account, 
  connectWallet, 
  disconnectWallet,
  isConnected,
  isConnecting,
  isMetaMaskInstalled, // Add this prop
  currentPage, 
  setCurrentPage, 
  theme, 
  toggleTheme 
}) => {
  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'gallery', label: 'Gallery', icon: GalleryVertical },
    { id: 'register', label: 'Register', icon: Plus },
    { id: 'verify', label: 'Verify', icon: Search },
    { id: 'dashboard', label: 'Dashboard', icon: User },
  ];

  const handleWalletAction = () => {
    if (isConnected) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  };

  const handleInstallMetaMask = () => {
    window.open('https://metamask.io/download/', '_blank');
  };

  return (
    <header className={`border-b backdrop-blur-lg sticky top-0 z-50 transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-slate-900/90 border-slate-800' 
        : 'bg-white/90 border-gray-200'
    }`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              theme === 'dark' 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-100 text-blue-600'
            }`}>
              <span className="font-bold text-lg">P</span>
            </div>
            <div>
              <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                PRISM
              </h1>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Plagiarism Resistant Integrity System for Media
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? theme === 'dark'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-600'
                      : theme === 'dark'
                        ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                theme === 'dark' 
                  ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    theme === 'dark' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-green-100 text-green-700 border border-green-200'
                  }`}>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-mono text-sm">
                      {truncateAddress(account)}
                    </span>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                    title="Disconnect Wallet"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                /* Show different button based on MetaMask installation status */
                isMetaMaskInstalled ? (
                  <button
                    onClick={handleWalletAction}
                    disabled={isConnecting}
                    className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      theme === 'dark'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isConnecting ? (
                      <>
                        <div className="spinner border-white border-2 w-4 h-4"></div>
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Wallet size={18} />
                        <span>Connect Wallet</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleInstallMetaMask}
                    className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      theme === 'dark'
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                    } hover:scale-105 active:scale-95`}
                  >
                    <Download size={18} />
                    <span>Install MetaMask</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center justify-center space-x-4 mt-4 overflow-x-auto pb-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex flex-col items-center p-2 rounded-lg min-w-16 transition-all duration-200 ${
                  isActive
                    ? theme === 'dark'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-600'
                    : theme === 'dark'
                      ? 'text-slate-400 hover:text-white'
                      : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Header;