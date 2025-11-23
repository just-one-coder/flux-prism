import React, { useState, useEffect } from 'react';
import { GalleryVertical, User, Calendar, Copy, ExternalLink, FileText } from 'lucide-react';

const Dashboard = ({ account, contract, theme }) => {
  const [artworks, setArtworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState(null);

  useEffect(() => {
    if (account && contract) {
      loadUserArtworks();
    }
  }, [account, contract]);

  const loadUserArtworks = async () => {
    if (!contract || !account) return;
    
    try {
      setIsLoading(true);
      const artworkHashes = await contract.getUserArtworks(account);
      
      const artworkDetails = await Promise.all(
        artworkHashes.map(async (hash) => {
          const details = await contract.getArtworkDetails(hash);
          return {
            contentHash: hash,
            owner: details.owner,
            ipfsHash: details.ipfsHash,
            timestamp: new Date(Number(details.timestamp) * 1000),
            title: details.title,
            description: details.description
          };
        })
      );

      setArtworks(artworkDetails);
    } catch (error) {
      console.error('Error loading artworks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text, hash) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const truncateHash = (hash) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  if (!account) {
    return (
      <div className={`text-center py-16 rounded-2xl ${
        theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'
      }`}>
        <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 className={`text-2xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Connect Your Wallet
        </h2>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          Please connect your wallet to view your dashboard
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          My Dashboard
        </h1>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          Manage and view your registered artworks
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`rounded-2xl p-6 ${
          theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        } border`}>
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
            }`}>
              <GalleryVertical className="w-6 h-6" />
            </div>
            <div>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Total Artworks</p>
              <p className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {artworks.length}
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl p-6 ${
          theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        } border`}>
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
            }`}>
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Wallet Address</p>
              <p className="font-mono text-sm break-all">
                {truncateHash(account)}
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl p-6 ${
          theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        } border`}>
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              theme === 'dark' ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
            }`}>
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>First Registration</p>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {artworks.length > 0 
                  ? artworks[artworks.length - 1].timestamp.toLocaleDateString()
                  : 'No artworks'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Artworks Grid */}
      <div>
        <h2 className={`text-xl font-semibold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          My Artworks
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`rounded-2xl p-6 animate-pulse ${
                  theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-200'
                }`}
              >
                <div className={`w-full h-48 rounded-lg mb-4 ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                }`}></div>
                <div className={`h-4 rounded mb-2 ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                }`}></div>
                <div className={`h-3 rounded w-2/3 ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                }`}></div>
              </div>
            ))}
          </div>
        ) : artworks.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl ${
            theme === 'dark' ? 'bg-gray-800/50' : 'bg-white border border-gray-200'
          }`}>
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className={`text-xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              No Artworks Registered
            </h3>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              You haven't registered any artworks yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks.map((artwork, index) => (
              <div
                key={index}
                className={`rounded-2xl p-4 border transition-all duration-200 hover:scale-105 ${
                  theme === 'dark' 
                    ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="mb-4">
                  <img
                    src={`https://gateway.pinata.cloud/ipfs/${artwork.ipfsHash.split('/').pop()}`}
                    alt={artwork.title}
                    className="w-full h-48 object-cover rounded-xl"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                    }}
                  />
                </div>
                
                <h3 className={`font-semibold mb-2 truncate ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {artwork.title}
                </h3>
                
                <p className={`text-sm mb-3 line-clamp-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {artwork.description || 'No description'}
                </p>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
                      Registered:
                    </span>
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {artwork.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
                      Hash:
                    </span>
                    <button
                      onClick={() => copyToClipboard(artwork.contentHash, artwork.contentHash)}
                      className="flex items-center space-x-1 text-blue-500 hover:text-blue-600"
                    >
                      <span>{truncateHash(artwork.contentHash)}</span>
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>

                  {copiedHash === artwork.contentHash && (
                    <div className={`text-center py-1 rounded ${
                      theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                    }`}>
                      Copied!
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 mt-4">
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${artwork.ipfsHash.split('/').pop()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-lg text-sm transition-colors ${
                      theme === 'dark'
                        ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    }`}
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;