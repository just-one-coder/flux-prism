// utils/ipfs.js
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

export const uploadToIPFS = async (file) => {
  // Check if JWT is available
  if (!PINATA_JWT) {
    throw new Error("Pinata JWT not configured. Please set VITE_PINATA_JWT in your environment variables.");
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
      name: file.name,
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    console.log('📤 Uploading to IPFS...');
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });
    
    if (!res.ok) {
      throw new Error(`IPFS upload failed: ${res.statusText}`);
    }
    
    const resData = await res.json();
    console.log('✅ IPFS upload successful:', resData.IpfsHash);
    return `https://gateway.pinata.cloud/ipfs/${resData.IpfsHash}`;
  } catch (error) {
    console.error("❌ Error uploading to IPFS:", error);
    throw error;
  }
};