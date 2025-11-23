// hooks/useWeb3.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { PRISM_ABI, PRISM_ADDRESS } from '../utils/contract';

export const useWeb3 = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to create contract instance
  const createContractInstance = async (signer) => {
    try {
      // Check if contract address is available
      if (!PRISM_ADDRESS) {
        throw new Error("Contract address not configured. Please check your environment variables.");
      }

      console.log('📝 Creating contract instance with address:', PRISM_ADDRESS);
      const contractInstance = new ethers.Contract(PRISM_ADDRESS, PRISM_ABI, signer);
      console.log('✅ Contract instance created successfully');
      return contractInstance;
    } catch (error) {
      console.error('❌ Error creating contract instance:', error);
      throw error;
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('Please install MetaMask!');
      return null;
    }

    setIsConnecting(true);
    setError(null);
    
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const prismContract = await createContractInstance(web3Signer);
      
      setAccount(accounts[0]);
      setProvider(web3Provider);
      setSigner(web3Signer);
      setContract(prismContract);
      setIsConnected(true);
      
      console.log('✅ Connected account:', accounts[0]);
      return { account: accounts[0], provider: web3Provider, signer: web3Signer, contract: prismContract };
    } catch (error) {
      console.error("❌ Error connecting wallet:", error);
      setError(error.message);
      if (error.code === 4001) {
        setError('Please connect your wallet to continue.');
      }
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setContract(null);
    setIsConnected(false);
    setError(null);
    console.log('🔌 Wallet disconnected');
  };

  const checkConnection = async () => {
    if (typeof window.ethereum === 'undefined') {
      return;
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      });
      
      if (accounts.length > 0) {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const web3Signer = await web3Provider.getSigner();
        const prismContract = await createContractInstance(web3Signer);
        
        setAccount(accounts[0]);
        setProvider(web3Provider);
        setSigner(web3Signer);
        setContract(prismContract);
        setIsConnected(true);
        console.log('✅ Auto-connected to account:', accounts[0]);
      }
    } catch (error) {
      console.error('❌ Error checking connection:', error);
      setError(error.message);
    }
  };

  // Auto-check connection on component mount
  useEffect(() => {
    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          checkConnection();
        } else {
          disconnectWallet();
        }
      };

      // Listen for chain changes
      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  return { 
    account, 
    provider, 
    signer, 
    contract, 
    isConnected, 
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    checkConnection
  };
};