import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid3X3, List, Eye, User, Calendar, Loader, RefreshCw } from 'lucide-react';
import { getReadOnlyContract } from '../utils/contract';

const Gallery = ({ theme, setCurrentPage }) => {
  const [artworks, setArtworks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to extract IPFS hash from various formats
  const extractIPFSHash = (ipfsString) => {
    if (!ipfsString) return '';
    
    // If it's already just a hash (starts with Qm)
    if (ipfsString.startsWith('Qm')) {
      return ipfsString;
    }
    
    // If it contains IPFS gateway URL, extract the hash
    if (ipfsString.includes('/ipfs/')) {
      return ipfsString.split('/ipfs/')[1];
    }
    
    // If it's a full URL but without /ipfs/ path
    if (ipfsString.includes('gateway.pinata.cloud')) {
      const parts = ipfsString.split('/');
      return parts[parts.length - 1];
    }
    
    // Return as is if we can't determine
    return ipfsString;
  };

  // Fetch all artworks from the blockchain
  const fetchAllArtworks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching artworks from blockchain...');
      const contract = getReadOnlyContract();
      
      // Get all artwork hashes
      console.log('Calling getAllArtworks...');
      const allArtworkHashes = await contract.getAllArtworks();
      console.log('Artwork hashes received:', allArtworkHashes);
      
      if (!allArtworkHashes || allArtworkHashes.length === 0) {
        console.log('No artworks found on blockchain, using mock data');
        setArtworks(getMockArtworks());
        setLoading(false);
        return;
      }

      // Fetch details for each artwork
      console.log(`Fetching details for ${allArtworkHashes.length} artworks...`);
      const artworkPromises = allArtworkHashes.map(async (contentHash, index) => {
        try {
          console.log(`Fetching details for artwork ${index + 1}:`, contentHash);
          const details = await contract.getArtworkDetails(contentHash);
          console.log(`Artwork ${index + 1} details:`, details);
          
          // Extract clean IPFS hash and build correct URL
          const cleanIPFSHash = extractIPFSHash(details.ipfsHash);
          const imageUrl = `https://gateway.pinata.cloud/ipfs/${cleanIPFSHash}`;
          
          return {
            id: contentHash,
            title: details.title || 'Untitled',
            description: details.description || 'No description',
            image: imageUrl,
            owner: details.owner,
            timestamp: new Date(Number(details.timestamp) * 1000),
            contentHash: details.contentHash,
            ipfsHash: cleanIPFSHash
          };
        } catch (err) {
          console.error(`Error fetching details for artwork ${contentHash}:`, err);
          return null;
        }
      });

      const artworksData = await Promise.all(artworkPromises);
      const validArtworks = artworksData.filter(artwork => artwork !== null);
      
      console.log('Valid artworks:', validArtworks);
      setArtworks(validArtworks);
      
    } catch (err) {
      console.error('Error fetching artworks:', err);
      setError(`Failed to load artworks: ${err.message}`);
      
      // Fallback to mock data if blockchain fetch fails
      console.log('Falling back to mock data');
      setArtworks(getMockArtworks());
    } finally {
      setLoading(false);
    }
  };

  // Mock data fallback - UPDATED to use correct image URLs
  const getMockArtworks = () => {
    return [
      {
        id: "0x1",
        title: "Digital Sunset",
        description: "A beautiful AI-generated sunset landscape",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        owner: "0x742d35Cc6634C0532925a3b8D1234567890abc",
        timestamp: new Date('2024-01-15'),
        contentHash: "0x123",
        ipfsHash: "QmExample1"
      },
      {
        id: "0x2",
        title: "Abstract Dreams",
        description: "Colorful abstract digital painting",
        image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
        owner: "0x892d35Cc6634C0532925a3b8D1234567890def",
        timestamp: new Date('2024-01-18'),
        contentHash: "0x456",
        ipfsHash: "QmExample2"
      },
      {
        id: "0x3",
        title: "Cyber City",
        description: "Futuristic cityscape with neon lights",
        image: "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?w=400&h=300&fit=crop",
        owner: "0x342d35Cc6634C0532925a3b8D1234567890ghi",
        timestamp: new Date('2024-01-25'),
        contentHash: "0x789",
        ipfsHash: "QmExample3"
      },
      {
        id: "0x4",
        title: "Neural Networks",
        description: "Digital visualization of artificial intelligence and neural connections",
        image: "https://plus.unsplash.com/premium_photo-1683121710572-7723bd2e235d?w=400&h=300&fit=crop",
        owner: "0x342d35Cc6634C0532925a3b8D1234567890jkl",
        timestamp: new Date('2024-01-20'),
        contentHash: "0x790",
        ipfsHash: "QmExample4"
      }
    ];
  };

  useEffect(() => {
    fetchAllArtworks();
  }, []);

  const filteredArtworks = artworks.filter(artwork =>
    artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artwork.description.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.timestamp - a.timestamp;
      case 'oldest':
        return a.timestamp - b.timestamp;
      default:
        return 0;
    }
  });

  const truncateAddress = (addr) => {
    if (!addr) return 'Unknown';
    if (addr.length < 10) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center items-center py-20">
          <Loader className="animate-spin text-blue-500" size={32} />
          <span className={`ml-3 text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Loading artworks from blockchain...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Art Gallery
          </h1>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Discover amazing digital artworks from our community ({artworks.length} artworks)
          </p>
        </div>
        <button
          onClick={fetchAllArtworks}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            theme === 'dark' 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className={`mb-6 p-4 rounded-lg ${
          theme === 'dark' ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-700'
        }`}>
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-4 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className={`rounded-2xl p-6 mb-8 ${
        theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
      } border`}>
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="flex-1 w-full lg:max-w-md">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} size={20} />
              <input
                type="text"
                placeholder="Search artworks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                }`}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>

            {/* View Mode */}
            <div className={`flex rounded-lg p-1 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white'
                    : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Grid3X3 size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white'
                    : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Artworks Grid/List */}
      {filteredArtworks.length === 0 ? (
        <div className={`text-center py-16 rounded-2xl ${
          theme === 'dark' ? 'bg-gray-800/50' : 'bg-white border border-gray-200'
        }`}>
          <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className={`text-xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            No artworks found
          </h3>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            {artworks.length === 0 ? 'No artworks have been registered yet.' : 'Try adjusting your search terms'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredArtworks.map((artwork) => (
            <div
              key={artwork.id}
              className={`rounded-2xl p-3 overflow-hidden border transition-all duration-200 hover:scale-105 ${
                theme === 'dark' 
                  ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="relative group">
                <img
                  src={artwork.image}
                  alt={artwork.title}
                  className="w-full h-48 rounded-xl object-cover"
                  onError={(e) => {
                    // Fallback if IPFS image fails to load
                    e.target.src = 'https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=400&h=300&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                  <button className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-200 flex items-center space-x-2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                    <Eye size={16} />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
              
              <div className="p-3">
                <h3 className={`font-semibold mb-1 truncate ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {artwork.title}
                </h3>
                
                <p className={`text-sm mb-3 line-clamp-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {artwork.description}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1 text-gray-500">
                    <User size={12} />
                    <span>{truncateAddress(artwork.owner)}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Calendar size={12} />
                    <span>{artwork.timestamp.toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <button
                    onClick={() => setCurrentPage('verify')}
                    className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                    }`}
                  >
                    Verify Artwork
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredArtworks.map((artwork) => (
            <div
              key={artwork.id}
              className={`rounded-2xl p-4 border transition-all duration-200 hover:scale-102 ${
                theme === 'dark' 
                  ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex space-x-4">
                <img
                  src={artwork.image}
                  alt={artwork.title}
                  className="w-24 h-24 object-cover rounded-lg"
                  onError={(e) => {
                    // Fallback if IPFS image fails to load
                    e.target.src = 'https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=200&h=200&fit=crop';
                  }}
                />
                <div className="flex-1">
                  <h3 className={`font-semibold mb-1 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {artwork.title}
                  </h3>
                  
                  <p className={`text-sm mb-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {artwork.description}
                  </p>

                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <User size={12} />
                      <span>{truncateAddress(artwork.owner)}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Calendar size={12} />
                      <span>{artwork.timestamp.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentPage('verify')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                  }`}
                >
                  Verify Artwork
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA Section */}
      <div className={`text-center py-12 mt-12 rounded-3xl ${
        theme === 'dark' 
          ? 'bg-gray-800/50 border border-gray-700' 
          : 'bg-white border border-gray-200'
      }`}>
        <h2 className={`text-2xl font-bold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Ready to Showcase Your Art?
        </h2>
        <p className={`mb-6 max-w-2xl mx-auto ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Join our community of digital artists and protect your creations with blockchain technology
        </p>
        <button
          onClick={() => setCurrentPage('register')}
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
        >
          Register Your Artwork
        </button>
      </div>
    </div>
  );
};

export default Gallery;