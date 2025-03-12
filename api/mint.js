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

// ✅ Initialisation des services
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);
const relayer = new Relayer({
  apiKey: process.env.DEFENDER_API_KEY,
  apiSecret: process.env.DEFENDER_API_SECRET,
});
const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http(process.env.VITE_RPC_URL),
});

// ✅ Charger l'ABI du contrat NFT
let nftABI;
try {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const abiPath = join(__dirname, 'nftABI.json');
  nftABI = JSON.parse(readFileSync(abiPath, 'utf8'));
  console.log('✅ ABI chargé depuis le fichier nftABI.json');
} catch (error) {
  console.error('❌ Erreur de chargement de l\'ABI:', error.message);
  process.exit(1);
}

// ✅ Générer des couleurs aléatoires
function generateRandomColors() {
  const generateColor = () => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
  return {
    path1: generateColor(),
    path2: generateColor(),
    path3: generateColor(),
    path4: generateColor(),
  };
}

// ✅ Générer un SVG en mémoire avec des couleurs random
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
console.log('✅ Initialisation de api/mint.js');
// 🚀 **API Serverless Mint NFT**
export default async function handler(req, res) {
  console.log('✅ /api/mint called with', req.body);
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method non-authorized',
      errorCode: 'METHOD_NOT_ALLOWED',
      details: `Method ${req.method} non-supported. Only POST requests accepted.`
    });
  }

  try {
    const { recipient } = req.body;
    if (!recipient) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing recipient address',
        errorCode: 'MISSING_RECIPIENT',
        details: 'Recipient address required for mint.'
      });
    }

    // Validation de l'adresse Ethereum (format basique)
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      return res.status(400).json({
        success: false, 
        error: 'Invalid Ethereum Address',
        errorCode: 'INVALID_ADDRESS',
        details: 'Invalid format address.'
      });
    }

    console.log('🔍 Minting NFT for', recipient);

    try {
      // ✅ Generate SVG with random colors
      const colors = generateRandomColors();
      const svgImage = generateSVG(colors);
      
      // ✅ Send the SVG on pinata
      let imageResponse;
      try {
        imageResponse = await pinata.pinFileToIPFS(Readable.from(svgImage), {
          pinataMetadata: { name: `nft-${Date.now()}.svg` },
          pinataOptions: { cidVersion: 0 },
        });
      } catch (pinataError) {
        console.error('❌ Error Pinata (image):', pinataError);
        throw {
          message: 'Fail storing image on IPFS',
          errorCode: 'IPFS_IMAGE_UPLOAD_FAILED',
          details: pinataError.message,
          original: pinataError
        };
      }

      const imageURI = `ipfs://${imageResponse.IpfsHash}`;
      console.log('✅ Image sent on IPFS:', imageURI);

      // ✅ Calculate Token ID
      let totalMinted;
      try {
        totalMinted = await publicClient.readContract({
          address: process.env.NFT_CONTRACT_ADDRESS,
          abi: nftABI,
          functionName: 'totalMinted',
        });
      } catch (contractReadError) {
        console.error('❌ Error reading contract:', contractReadError);
        throw {
          message: 'Cant read totalMinted NFT',
          errorCode: 'CONTRACT_READ_ERROR',
          details: contractReadError.message,
          original: contractReadError
        };
      }
      
      const tokenId = BigInt(totalMinted) + BigInt(1);
      console.log('✅ Token ID calculated:', Number(tokenId));

      // ✅ Generating metadata NFT
      const metadata = {
        name: `Visitor Badge #${tokenId}`,
        description: "An exclusive NFT proving you visited 0xChaddB's portfolio.",
        image: imageURI,
        attributes: [
          { trait_type: 'Path 1 Color', value: colors.path1 },
          { trait_type: 'Path 2 Color', value: colors.path2 },
          { trait_type: 'Path 3 Color', value: colors.path3 },
          { trait_type: 'Path 4 Color', value: colors.path4 },
        ],
      };

      // ✅ Uploading on Pinata
      let metadataResponse;
      try {
        metadataResponse = await pinata.pinJSONToIPFS(metadata);
      } catch (pinataMetadataError) {
        console.error('❌ Pinata error (metadata):', pinataMetadataError);
        throw {
          message: 'Failed storing metadata on IPFS',
          errorCode: 'IPFS_METADATA_UPLOAD_FAILED',
          details: pinataMetadataError.message,
          original: pinataMetadataError
        };
      }
      
      const metadataURI = `ipfs://${metadataResponse.IpfsHash}`;
      console.log('✅ Metadata stored on IPFS', metadataURI);

      // ✅ Building OZ Defender tx
      let functionData;
      try {
        functionData = encodeFunctionData({
          abi: nftABI,
          functionName: 'entryMint',
          args: [recipient, metadataURI],
        });
      } catch (encodeError) {
        console.error('❌ Error encoding tx:', encodeError);
        throw {
          message: 'Failing encoding tx details',
          errorCode: 'ENCODE_DATA_ERROR',
          details: encodeError.message,
          original: encodeError
        };
      }

      let txResponse;
      try {
        txResponse = await relayer.sendTransaction({
          to: process.env.NFT_CONTRACT_ADDRESS,
          data: functionData,
          gasLimit: 500000,
          speed: 'fast',
        });
      } catch (txError) {
        console.error('❌ Error sending transaction:', txError);
        
        // Looking for NFT owning in recipient address
        if (txError.message && txError.message.includes('VisitorNFT__CantOwnMoreThanOne')) {
          throw {
            message: 'You already own a NFT from this collection',
            errorCode: 'ALREADY_OWNS_NFT',
            details: 'Only one NFT of this collection is authorized per address',
            original: txError
          };
        }
        
        throw {
          message: 'Échec de la transaction',
          errorCode: 'TRANSACTION_FAILED',
          details: txError.message,
          original: txError
        };
      }

      console.log('✅ Transaction sent:', txResponse.transactionId);

      return res.json({ 
        success: true, 
        txId: txResponse.transactionId, 
        transactionHash: txResponse.hash || txResponse.transactionId, 
        metadataURI,
        tokenId: Number(tokenId)
      });
      
    } catch (processingError) {
      // Catch error when processing minting
      console.error('❌ Processing error:', processingError);
      return res.status(500).json({
        success: false,
        error: processingError.message || 'Unknown processing error',
        errorCode: processingError.errorCode || 'PROCESSING_ERROR',
        details: processingError.details || 'Error while processing minting',
      });
    }
    
  } catch (error) {
    // Catch general errors
    console.error('❌ General Minting Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Mint failed', 
      errorCode: 'GENERAL_ERROR',
      details: error.message || 'An unexpected error occured'
    });
  }
}