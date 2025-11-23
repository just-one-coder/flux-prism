import React, { useState } from 'react';
import { Upload, Image, FileText, Shield, CheckCircle, AlertCircle, Wallet } from 'lucide-react';
import { calculateSHA256 } from '../utils/hashing';
import { uploadToIPFS } from '../utils/ipfs';

const Register = ({ account, contract, theme, isConnected }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Basic file validation
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setStatus({ type: 'error', message: 'File size must be less than 10MB' });
        return;
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(selectedFile.type)) {
        setStatus({ type: 'error', message: 'Please select a valid image file (JPEG, PNG, GIF, WEBP)' });
        return;
      }

      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setStatus({ type: '', message: '' });
    }
  };

  const handleRegister = async () => {
    if (!isConnected || !account) {
      setStatus({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }

    if (!file || !title.trim()) {
      setStatus({ type: 'error', message: 'Please fill all required fields' });
      return;
    }

    if (!contract) {
      setStatus({ type: 'error', message: 'Contract not loaded. Please refresh the page.' });
      return;
    }

    setIsUploading(true);
    setStatus({ type: 'loading', message: 'Processing your artwork...' });

    try {
      // Step 1: Calculate hash
      setStatus({ type: 'loading', message: 'Calculating file hash...' });
      const contentHash = await calculateSHA256(file);
      console.log('Content Hash:', contentHash);

      // Step 2: Check if already registered
      setStatus({ type: 'loading', message: 'Checking if artwork is already registered...' });
      try {
        const [existingOwner] = await contract.verifyArtwork(contentHash);
        if (existingOwner !== '0x0000000000000000000000000000000000000000') {
          setStatus({ 
            type: 'error', 
            message: 'This artwork is already registered by another user!' 
          });
          setIsUploading(false);
          return;
        }
      } catch (error) {
        // If artwork doesn't exist, continue with registration
        console.log('Artwork not registered, proceeding...');
      }

      // Step 3: Upload to IPFS
      setStatus({ type: 'loading', message: 'Uploading to IPFS...' });
      const ipfsHash = await uploadToIPFS(file);
      console.log('IPFS Hash:', ipfsHash);

      // Step 4: Register on blockchain
      setStatus({ type: 'loading', message: 'Registering on blockchain...' });
      const tx = await contract.registerArtwork(ipfsHash, contentHash, title.trim(), description.trim());
      setStatus({ type: 'loading', message: 'Waiting for transaction confirmation...' });
      
      await tx.wait();

      setStatus({ 
        type: 'success', 
        message: 'Artwork successfully registered on blockchain!' 
      });
      
      // Reset form
      setFile(null);
      setPreview(null);
      setTitle('');
      setDescription('');
      
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Failed to register artwork';
      
      if (error.message.includes('user rejected transaction')) {
        errorMessage = 'Transaction was rejected by user';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction';
      } else if (error.message.includes('already registered')) {
        errorMessage = 'This artwork is already registered';
      }
      
      setStatus({ 
        type: 'error', 
        message: errorMessage 
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Show wallet connection required message
  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className={`text-center py-16 rounded-2xl ${
          theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        } border`}>
          <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Wallet Connection Required
          </h2>
          <p className={`mb-6 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Please connect your wallet to register and protect your digital artworks.
          </p>
          <div className="space-y-4 max-w-md mx-auto">
            <div className={`p-4 rounded-lg text-left ${
              theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <h3 className={`font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Why connect wallet?
              </h3>
              <ul className={`text-sm space-y-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <li>• Prove ownership of your digital art</li>
                <li>• Create immutable proof of creation</li>
                <li>• Protect against plagiarism</li>
                <li>• Manage your artwork portfolio</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Register Your Artwork
        </h1>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          Protect your digital creations with blockchain verification
        </p>
        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm mt-2 ${
          theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
        }`}>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Wallet Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
        </div>
      </div>

      {/* Rest of the Register component remains the same */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className={`rounded-2xl p-6 ${
          theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        } border`}>
          <h2 className={`text-xl font-semibold mb-4 flex items-center space-x-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <Upload className="w-5 h-5" />
            <span>Upload Artwork</span>
          </h2>

          <div className="space-y-4">
            {/* File Upload */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                preview
                  ? theme === 'dark' ? 'border-green-500/50' : 'border-green-500'
                  : theme === 'dark' 
                    ? 'border-gray-600 hover:border-gray-500' 
                    : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {preview ? (
                <div className="space-y-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg object-contain"
                  />
                  <button
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      theme === 'dark'
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Image className="w-12 h-12 mx-auto text-gray-400" />
                  <div>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      Drag & drop your artwork here
                    </p>
                    <p className="text-sm mt-1 text-gray-500">
                      Supports JPG, PNG, GIF, WEBP (Max 10MB)
                    </p>
                  </div>
                  <label className={`inline-block px-6 py-3 rounded-lg font-medium cursor-pointer transition-all ${
                    theme === 'dark'
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  } hover:scale-105 active:scale-95`}>
                    Choose File
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Artwork Details */}
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter artwork title"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  }`}
                  placeholder="Describe your artwork..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview & Actions */}
        <div className="space-y-6">
          {/* Status Card */}
          {status.message && (
            <div className={`p-4 rounded-xl border ${
              status.type === 'error'
                ? theme === 'dark' ? 'bg-red-500/20 border-red-500/30' : 'bg-red-100 border-red-200'
                : status.type === 'success'
                ? theme === 'dark' ? 'bg-green-500/20 border-green-500/30' : 'bg-green-100 border-green-200'
                : theme === 'dark' ? 'bg-blue-500/20 border-blue-500/30' : 'bg-blue-100 border-blue-200'
            }`}>
              <div className="flex items-center space-x-2">
                {status.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                {status.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {status.type === 'loading' && (
                  <div className="spinner w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                )}
                <span className={
                  status.type === 'error' ? 'text-red-500' :
                  status.type === 'success' ? 'text-green-500' : 'text-blue-500'
                }>
                  {status.message}
                </span>
              </div>
            </div>
          )}

          {/* Registration Info */}
          <div className={`rounded-2xl p-6 ${
            theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
          } border`}>
            <h3 className={`font-semibold mb-4 flex items-center space-x-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Shield className="w-5 h-5" />
              <span>What happens next?</span>
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'
                }`}>
                  1
                </div>
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  File is hashed using SHA-256
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'
                }`}>
                  2
                </div>
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  Artwork uploaded to IPFS for permanent storage
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'
                }`}>
                  3
                </div>
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  Ownership recorded on Ethereum blockchain
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'
                }`}>
                  4
                </div>
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  Receive permanent proof of ownership
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleRegister}
            disabled={isUploading || !file || !title.trim() || !isConnected}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
              isUploading || !file || !title.trim() || !isConnected
                ? theme === 'dark'
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/25'
            }`}
          >
            {isUploading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="spinner"></div>
                <span>Registering...</span>
              </div>
            ) : (
              'Register Artwork on Blockchain'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;