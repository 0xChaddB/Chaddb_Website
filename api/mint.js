import dotenv from 'dotenv';
import pinataSDK from '@pinata/sdk';
import { createPublicClient, encodeFunctionData, http } from 'viem';
import { polygonAmoy } from 'viem/chains';
import { Relayer } from '@openzeppelin/defender-relay-client';
import { Readable } from 'stream';

dotenv.config();

// ✅ Initialisation des services
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);
const relayer = new Relayer({
  apiKey: process.env.DEFENDER_API_KEY,
  apiSecret: process.env.DEFENDER_API_SECRET,
});
const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http(process.env.RPC_URL),
});

// ✅ Charger l'ABI du contrat NFT
let nftABI;
try {
  nftABI = JSON.parse(process.env.NFT_ABI);
  console.log('✅ ABI chargé depuis env');
} catch (error) {
  console.error('❌ Erreur de parsing de l’ABI:', error.message);
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
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${colors.path1}" />
      <circle cx="100" cy="100" r="50" fill="${colors.path2}" />
      <polygon points="50,15 100,100 15,100" fill="${colors.path3}" />
      <line x1="0" y1="0" x2="200" y2="200" stroke="${colors.path4}" stroke-width="5"/>
    </svg>
  `;
}

// 🚀 **API Serverless Mint NFT**
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { recipient } = req.body;
    if (!recipient) return res.status(400).json({ error: 'Recipient requis' });

    console.log('🔍 Minting NFT pour', recipient);

    // ✅ Générer un SVG avec couleurs random
    const colors = generateRandomColors();
    const svgImage = generateSVG(colors);

    // ✅ Envoyer le SVG directement sur Pinata sans stockage disque
    const imageResponse = await pinata.pinFileToIPFS(Readable.from(svgImage), {
      pinataMetadata: { name: `nft-${Date.now()}.svg` },
      pinataOptions: { cidVersion: 0 },
    });

    const imageURI = `ipfs://${imageResponse.IpfsHash}`;
    console.log('✅ Image stockée sur IPFS:', imageURI);

    // ✅ Calculer le Token ID
    const totalMinted = await publicClient.readContract({
      address: process.env.NFT_CONTRACT_ADDRESS,
      abi: nftABI,
      functionName: 'totalMinted',
    });
    const tokenId = BigInt(totalMinted) + BigInt(1);
    console.log('✅ Token ID calculé:', Number(tokenId));

    // ✅ Générer les métadonnées du NFT
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

    // ✅ Uploader les métadonnées sur Pinata
    const metadataResponse = await pinata.pinJSONToIPFS(metadata);
    const metadataURI = `ipfs://${metadataResponse.IpfsHash}`;
    console.log('✅ Métadonnées stockées sur IPFS:', metadataURI);

    // ✅ Construire la transaction pour OpenZeppelin Defender
    const functionData = encodeFunctionData({
      abi: nftABI,
      functionName: 'entryMint',
      args: [recipient, metadataURI],
    });

    const txResponse = await relayer.sendTransaction({
      to: process.env.NFT_CONTRACT_ADDRESS,
      data: functionData,
      gasLimit: 500000,
      speed: 'fast',
    });

    console.log('✅ Transaction envoyée:', txResponse.transactionId);

    return res.json({ success: true, txId: txResponse.transactionId, metadataURI });
  } catch (error) {
    console.error('❌ Erreur Minting:', error);
    return res.status(500).json({ error: 'Mint échoué', details: error.message });
  }
}
