import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, User, Calendar, Shield, AlertCircle } from 'lucide-react';
import { calculateSHA256 } from '../utils/hashing';
import { getReadOnlyContract } from '../utils/contract';

const Verify = ({ theme }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Basic file validation
      if (selectedFile.size > 10 * 1024 * 1024) {
        setVerificationResult({
          verified: false,
          message: 'File size must be less than 10MB'
        });
        return;
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(selectedFile.type)) {
        setVerificationResult({
          verified: false,
          message: 'Please select a valid image file (JPEG, PNG, GIF, WEBP)'
        });
        return;
      }

      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setVerificationResult(null);
    }
  };

  const handleVerify = async () => {
    if (!file) {
      setVerificationResult({
        verified: false,
        message: 'Please select a file to verify'
      });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // Get read-only contract instance
      const contract = getReadOnlyContract();
      
      // Calculate hash
      const contentHash = await calculateSHA256(file);
      console.log('Verifying hash:', contentHash);

      try {
        // Try to verify the artwork
        const [owner, timestamp, title] = await contract.verifyArtwork(contentHash);
        
        console.log('Verification result:', { owner, timestamp, title });

        // Check if artwork exists (owner is not zero address)
        if (owner === '0x0000000000000000000000000000000000000000') {
          setVerificationResult({
            verified: false,
            message: 'This artwork is not registered in our system'
          });
        } else {
          const registrationDate = new Date(Number(timestamp) * 1000);
          setVerificationResult({
            verified: true,
            owner,
            timestamp: registrationDate,
            title: title || 'Untitled',
            contentHash
          });
        }
      } catch (contractError) {
        console.log('Contract error:', contractError);
        // If contract call fails, artwork is not registered
        setVerificationResult({
          verified: false,
          message: 'This artwork is not registered in our system'
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      
      let errorMessage = 'Error verifying artwork. Please try again.';
      
      if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message.includes('contract')) {
        errorMessage = 'Contract connection error. Please try again.';
      }
      
      setVerificationResult({
        verified: false,
        message: errorMessage
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Verify Artwork Authenticity
        </h1>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          Check if an artwork is registered and verify its ownership - No wallet required
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className={`rounded-2xl p-6 ${
          theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        } border`}>
          <h2 className={`text-xl font-semibold mb-4 flex items-center space-x-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <Search className="w-5 h-5" />
            <span>Upload to Verify</span>
          </h2>

          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                preview
                  ? theme === 'dark' ? 'border-blue-500/50' : 'border-blue-500'
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
                      setVerificationResult(null);
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
                  <Search className="w-12 h-12 mx-auto text-gray-400" />
                  <div>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      Upload artwork to verify
                    </p>
                    <p className="text-sm mt-1 text-gray-500">
                      We'll check if it's registered on blockchain
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

            <button
              onClick={handleVerify}
              disabled={!file || isVerifying}
              className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 ${
                !file || isVerifying
                  ? theme === 'dark'
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white hover:scale-105 active:scale-95 shadow-lg shadow-green-500/25'
              }`}
            >
              {isVerifying ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="spinner border-white"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                'Verify Artwork'
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {verificationResult ? (
            <div className={`rounded-2xl p-6 border ${
              verificationResult.verified
                ? theme === 'dark' ? 'bg-green-500/20 border-green-500/30' : 'bg-green-100 border-green-200'
                : theme === 'dark' ? 'bg-red-500/20 border-red-500/30' : 'bg-red-100 border-red-200'
            }`}>
              <div className="text-center mb-6">
                {verificationResult.verified ? (
                  <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                ) : (
                  <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                )}
                <h3 className={`text-xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {verificationResult.verified ? 'Verified Original' : 'Not Registered'}
                </h3>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  {verificationResult.message}
                </p>
              </div>

              {verificationResult.verified && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700/50' : 'bg-white'
                  }`}>
                    <div className="flex items-center space-x-3 mb-3">
                      <User className="w-5 h-5 text-blue-500" />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        Registered Owner
                      </span>
                    </div>
                    <p className="font-mono text-sm break-all bg-black bg-opacity-20 p-2 rounded">
                      {verificationResult.owner}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700/50' : 'bg-white'
                  }`}>
                    <div className="flex items-center space-x-3 mb-2">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        Registration Date
                      </span>
                    </div>
                    <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {verificationResult.timestamp.toLocaleString()}
                    </p>
                  </div>

                  {verificationResult.title && (
                    <div className={`p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700/50' : 'bg-white'
                    }`}>
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          Title
                        </span>
                      </div>
                      <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        {verificationResult.title}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className={`rounded-2xl p-8 text-center ${
              theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
            } border`}>
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className={`text-xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Ready to Verify
              </h3>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Upload an artwork to check its authenticity and ownership status on the blockchain.
                No wallet connection required!
              </p>
            </div>
          )}

          {/* Verification Info */}
          <div className={`rounded-2xl p-6 ${
            theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
          } border`}>
            <h3 className={`font-semibold mb-4 flex items-center space-x-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Shield className="w-5 h-5" />
              <span>How Verification Works</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                  theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'
                }`}>
                  1
                </div>
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  Artwork is hashed using SHA-256 algorithm
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                  theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'
                }`}>
                  2
                </div>
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  Hash is checked against blockchain registry
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                  theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'
                }`}>
                  3
                </div>
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  Results show ownership and registration date
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify;