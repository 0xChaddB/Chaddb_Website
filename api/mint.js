import dotenv from 'dotenv';
import pinataSDK from '@pinata/sdk';
import { createPublicClient, encodeFunctionData, http } from 'viem';
import { polygonAmoy } from 'viem/chains';
import { Relayer } from '@openzeppelin/defender-relay-client';
import { Readable } from 'stream';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const requiredEnvVars = [
  'NFT_CONTRACT_ADDRESS',
  'PINATA_API_KEY',
  'PINATA_API_SECRET',
  'DEFENDER_API_KEY',
  'DEFENDER_API_SECRET',
  'RPC_URL' 
];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Initialization
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);
const relayer = new Relayer({
  apiKey: process.env.DEFENDER_API_KEY,
  apiSecret: process.env.DEFENDER_API_SECRET,
});
const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http(process.env.RPC_URL),
});

// contract abi load
let nftABI;
try {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const abiPath = join(__dirname, 'nftABI.json');
  nftABI = JSON.parse(readFileSync(abiPath, 'utf8'));
} catch (error) {
  console.error('❌ Erreur de chargement de l\'ABI:', error.message);
  process.exit(1);
}

const log = (...args) => {
  if (process.env.NODE_ENV === 'development') console.log(...args);
};

// Random colors generation
function generateRandomColors() {
  const generateColor = () => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
  return {
    path1: generateColor(),
    path2: generateColor(),
    path3: generateColor(),
    path4: generateColor(),
  };
}

// Générer un SVG avec des couleurs random
function generateSVG(colors) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 834.6801 950" width="834.6801" height="950">
      <path className="logo-path" d="m426,234.78l135.46-77.39c11.72-5.92,24.95-9.28,38.99-9.28,47.55,0,86.11,38.53,86.11,86.11,0,47.22-38.02,85.58-85.11,86.11,66.87.27,127.22,28.71,169.76,74.05,39.33-41.9,63.46-98.25,63.46-160.16C834.67,105.06,729.61,0,600.45,0c-36.59,0-73.2,8.73-105.84,25.22-2.18,1.1201-4.37,2.29-6.51,3.52l-236.19,133.16c30.56,2.33,60.64,10.68,87.93,24.49,1.42.72,37.26,20.86,86.16,48.39Z" fill="${colors.path1}" />
      <path className="logo-path" d="m234.22,481.56c-47.55,0-86.11-38.53-86.11-86.12,0-47.55,38.56-86.11,86.11-86.11,14.04,0,27.28,3.36,38.99,9.31,2.43,1.2,121.31,69.12,133.7,76.22l.95-.54,80.25-45.26c2.14-1.22,4.32-2.4,6.51-3.52,26.42-13.34,55.43-21.61,84.92-24.25-5.95-3.36-11.99-6.7599-18.08-10.2-.01,0-.03-.01-.05-.02-.03-.01-.05-.03-.08-.04-46.01-25.95-95.09-53.59-135.33-76.25-48.9-27.53-84.74-47.67-86.16-48.39-27.29-13.81-57.37-22.16-87.93-24.49-5.88-.45-11.79-.6801-17.69-.6801C105.06,161.22,0,266.29,0,395.44c0,61.9,24.1201,118.26,63.48,160.17,42.76-45.56,103.48-74.05,170.74-74.05Z" fill="${colors.path2}" />
      <path className="logo-path" d="m771.21,394.38c-42.54-45.34-102.89-73.78-169.76-74.05-.33-.01-.66-.01-.99-.01-.29,0-.59,0-.88.01-6.7.02-13.4.34-20.04.96-29.49,2.64-58.5,10.91-84.92,24.25-2.19,1.12-4.3701,2.3-6.51,3.52l-80.25,45.26-.95.54-146.8,82.75-8.21,4.63c30.56,2.33,60.65,10.67,87.95,24.48,1.42.71,37.26,20.86,86.16,48.39l135.46-77.39c4.19-2.11,8.57-3.9,13.1-5.34,8.17-2.56,16.87-3.95,25.89-3.95,47.55,0,86.11,38.53,86.11,86.11s-38.56,86.12-86.11,86.12c-14.04,0-27.33-3.31-39.04-9.2599,25.98,14.66,50.98,28.75,72.87,41.09,33.72,19.02,33.7,67.57-.02,86.58l-51.47,29.02c5.87.44,11.77.67,17.66.67,129.16,0,234.22-105.06,234.22-234.22,0-61.89-24.1201-118.25-63.47-160.16Z" fill="${colors.path3}" />
      <path className="logo-path" d="m634.29,672.49c-21.89-12.34-46.89-26.43-72.87-41.09-.03-.01-.05-.02-.08-.04-.16-.08-.33-.17-.49-.27-.08-.04-.16-.09-.24-.13-.19-.11-.39-.22-.58-.32-45.64-25.73-94.17-53.08-134.02-75.53-48.9-27.53-84.74-47.68-86.16-48.39-27.3-13.81-57.39-22.15-87.95-24.48-5.88-.45-11.77-.68-17.67-.68h-.01c-67.26,0-127.98,28.49-170.74,74.05C24.14,597.52.01,653.88.01,715.78c0,129.16,105.06,234.22,234.22,234.22,36.59,0,73.2-8.73,105.84-25.22,2.18-1.1201,4.37-2.29,6.51-3.52l236.22-133.17,51.47-29.02c33.72-19.01,33.74-67.56.02-86.58Zm-361.07,120.12c-11.72,5.92-24.95,9.28-38.99,9.28-47.55,0-86.12-38.53-86.12-86.11,0-47.55,38.56-86.11,86.11-86.1201h.01c14.04,0,27.27,3.3701,38.99,9.32,2.56,1.28,134.73,76.8,134.73,76.8l-134.73,76.83Z" fill="${colors.path4}" />
    </svg>
  `;
}

// API Serverless Mint NFT
export default async function handler(req, res) {
  log('✅ /api/mint called with:', req.body);

  // Gestion CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed',
      errorCode: 'METHOD_NOT_ALLOWED',
      details: `Method ${req.method} not supported. Only POST requests accepted.`
    });
  }

  try {
    const { recipient } = req.body;

    if (!recipient || !/^0x[a-f0-9]{40}$/.test(recipient.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum Address',
        errorCode: 'INVALID_ADDRESS',
        details: 'Invalid or missing wallet address.'
      });
    }

    log('🔍 Verification mint status for:', recipient);

    // Parralel verification
    let totalMinted, /*maxSupply,*/ userBalance;
    try {
      [totalMinted, /*maxSupply,*/ userBalance] = await Promise.all([
        publicClient.readContract({
          address: process.env.NFT_CONTRACT_ADDRESS,
          abi: nftABI,
          functionName: 'totalMinted',
        }),
        /*
        publicClient.readContract({
          address: process.env.NFT_CONTRACT_ADDRESS,
          abi: nftABI,
          functionName: 'MAX_SUPPLY'  ,
        }),*/
        publicClient.readContract({
          address: process.env.NFT_CONTRACT_ADDRESS,
          abi: nftABI,
          functionName: 'balanceOf',
          args: [recipient]
        })
      ]);
      /*
      if (Number(totalMinted) >= Number(maxSupply)) {
        return res.status(400).json({ 
          success: false,
          error: 'All NFTs have been minted',
          errorCode: 'MAX_SUPPLY_REACHED',
          details: 'No more NFTs available.'
        });
      }
      */
      if (Number(userBalance) > 0) {
        return res.status(400).json({ 
          success: false,
          error: 'You already own an NFT from this collection',
          errorCode: 'ALREADY_OWNS_NFT',
          details: 'Only one NFT per address is allowed.'
        });
      }
    } catch (error) {
      log('❌ Blockchain read error:', error);
      return res.status(500).json({
        success: false,
        error: 'Blockchain read error',
        errorCode: 'CONTRACT_READ_ERROR',
        details: error.message || 'Failed to check minting conditions.'
      });
    }

    const tokenId = Number(totalMinted) + 1;
    log('✅ Token ID calculated:', tokenId);

    // Génération et upload de l'image sur IPFS
    log('🖌 Generating NFT image...');
    const colors = generateRandomColors();
    const svgImage = generateSVG(colors);

    let imageResponse;
    try {
      imageResponse = await pinata.pinFileToIPFS(Readable.from(svgImage), {
        pinataMetadata: { name: `nft-${tokenId}-${Date.now()}.svg` },
        pinataOptions: { cidVersion: 0 }
      });
    } catch (error) {
      log('❌ IPFS image upload failed:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to upload image to IPFS',
        errorCode: 'IPFS_IMAGE_UPLOAD_FAILED',
        details: error.message || 'IPFS service error'
      });
    }

    const imageURI = `ipfs://${imageResponse.IpfsHash}`;
    log('✅ Image uploaded to IPFS:', imageURI);

    // Génération et upload des métadonnées sur IPFS
    log('📝 Generating NFT metadata...');
    const metadata = {
      name: `Visitor Badge #${tokenId}`,
      description: "An exclusive NFT proving you visited 0xChaddB's portfolio.",
      image: imageURI,
      attributes: Object.entries(colors).map(([trait, value]) => ({
        trait_type: trait.replace('path', 'Path '),
        value
      }))
    };

    let metadataResponse;
    try {
      metadataResponse = await pinata.pinJSONToIPFS(metadata, {
        pinataMetadata: {
          name: `nft-metadata-${tokenId}-${Date.now()}.json`
        },
        pinataOptions: {
          cidVersion: 0 
        }
      });
    } catch (error) {
      log('❌ IPFS metadata upload failed:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to upload metadata to IPFS',
        errorCode: 'IPFS_METADATA_UPLOAD_FAILED',
        details: error.message || 'IPFS service error'
      });
    }

    const metadataURI = `ipfs://${metadataResponse.IpfsHash}`;
    log('✅ Metadata uploaded to IPFS:', metadataURI);

    log('🚀 Sending mint transaction..');
    let txResponse;
    try {
      const functionData = encodeFunctionData({
        abi: nftABI,
        functionName: 'entryMint',
        args: [recipient, metadataURI],
      });

      const TIMEOUT_MS = parseInt(process.env.MINT_TIMEOUT_MS, 10) || 30000; 
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Transaction timed out')), TIMEOUT_MS)
      );

      txResponse = await Promise.race([
        relayer.sendTransaction({
          to: process.env.NFT_CONTRACT_ADDRESS,
          data: functionData,
          gasLimit: process.env.GAS_LIMIT ? Number(process.env.GAS_LIMIT) : 500000,
          speed: 'fast',
        }),
        timeoutPromise
      ]);
    } catch (error) {
      log('❌ Transaction failed:', error);
      if (error.message?.includes('timed out')) {
        return res.status(504).json({
          success: false,
          error: 'Transaction is taking too long',
          errorCode: 'TRANSACTION_TIMEOUT',
          details: `Transaction ID: ${txResponse?.transactionId || 'unknown'}. It may still complete; check your wallet.`
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Transaction failed',
        errorCode: 'TRANSACTION_FAILED',
        details: error.message || 'Failed to send transaction'
      });
    }

    log('✅ Transaction sent:', txResponse.transactionId);
    return res.status(200).json({
      success: true,
      txId: txResponse.transactionId,
      transactionHash: txResponse.hash || txResponse.transactionId,
      metadataURI,
      tokenId
    });

  } catch (error) {
    log('❌ General minting error:', error);
    return res.status(500).json({
      success: false,
      error: 'Minting failed',
      errorCode: 'GENERAL_ERROR',
      details: error.message || 'An unexpected error occurred.'
    });
  }
};