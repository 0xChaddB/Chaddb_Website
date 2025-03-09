import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import pinataSDK from '@pinata/sdk';
import { createPublicClient, encodeFunctionData, http } from 'viem';
import { polygonAmoy } from 'viem/chains';
import { Relayer } from '@openzeppelin/defender-relay-client'; // ✅ Only Relayer needed
import NFT from './models/NFT.js';
import fs from 'node:fs/promises';
import { Readable } from 'stream';

dotenv.config();
console.log('ENV après chargement:', process.env.NFT_CONTRACT_ADDRESS);

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Charger l'ABI du contrat
let nftABI;
try {
  const abiContent = await fs.readFile(new URL('./nftABI.json', import.meta.url), 'utf8');
  if (!abiContent.trim()) throw new Error('nftABI.json est vide');
  nftABI = JSON.parse(abiContent);
  console.log('✅ ABI chargé');
} catch (error) {
  console.error('❌ Erreur lors du chargement de nftABI.json:', error.message);
  process.exit(1);
}

// ✅ Vérifier les variables d'environnement
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ OK' : '❌ NON DÉFINI');
console.log('RPC_URL:', process.env.RPC_URL ? '✅ OK' : '❌ NON DÉFINI');
console.log('NFT_CONTRACT_ADDRESS:', process.env.NFT_CONTRACT_ADDRESS);
console.log('PINATA_API_KEY:', process.env.PINATA_API_KEY ? '✅ OK' : '❌ NON DÉFINI');
console.log('PINATA_API_SECRET:', process.env.PINATA_API_SECRET ? '✅ OK' : '❌ NON DÉFINI');
console.log('DEFENDER_API_KEY:', process.env.DEFENDER_API_KEY ? '✅ OK' : '❌ NON DÉFINI');
console.log('DEFENDER_API_SECRET:', process.env.DEFENDER_API_SECRET ? '✅ OK' : '❌ NON DÉFINI');

// ✅ Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connecté'))
  .catch(err => {
    console.error('❌ Erreur MongoDB:', err);
    process.exit(1);
  });

// ✅ Connexion à Pinata
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);

// ✅ Initialisation du client OpenZeppelin Defender
const relayer = new Relayer({
  apiKey: process.env.DEFENDER_API_KEY,
  apiSecret: process.env.DEFENDER_API_SECRET,
});

// ✅ Setup Viem pour Polygon Amoy
const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http(process.env.RPC_URL),
});

// ✅ Générer des couleurs aléatoires pour le NFT
function generateRandomColors() {
  const generateColor = () => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
  return {
    path1: generateColor(),
    path2: generateColor(),
    path3: generateColor(),
    path4: generateColor(),
  };
}

// ✅ Générer un NFT SVG avec les couleurs aléatoires
async function generateSVGWithColors(colors) {
  const baseSvg = await fs.readFile(new URL('./base.svg', import.meta.url), 'utf8');
  return baseSvg
    .replace('{COLOR1}', colors.path1)
    .replace('{COLOR2}', colors.path2)
    .replace('{COLOR3}', colors.path3)
    .replace('{COLOR4}', colors.path4);
}

// 🔥 Mint NFT Endpoint (via OpenZeppelin Defender)
app.post('/mint-nft', async (req, res) => {
  try {
    const { recipient } = req.body;
    if (!recipient) return res.status(400).json({ error: 'Recipient requis' });

    console.log('🔍 Minting NFT pour', recipient);

    const colors = generateRandomColors();
    const svgImage = await generateSVGWithColors(colors);

    const imageResponse = await pinata.pinFileToIPFS(Readable.from(svgImage), {
      pinataMetadata: { name: `nft-image-${Date.now()}.svg` },
      pinataOptions: { cidVersion: 0 },
    });
    const imageURI = `ipfs://${imageResponse.IpfsHash}`;
    console.log('✅ Image stockée sur IPFS:', imageURI);

    const totalMinted = await publicClient.readContract({
      address: process.env.NFT_CONTRACT_ADDRESS,
      abi: nftABI,
      functionName: 'totalMinted',
    });
    const tokenId = BigInt(totalMinted) + BigInt(1);
    console.log('✅ Token ID calculé:', Number(tokenId));

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
    const metadataResponse = await pinata.pinJSONToIPFS(metadata);
    const metadataURI = `ipfs://${metadataResponse.IpfsHash}`;
    console.log('✅ Métadonnées stockées sur IPFS:', metadataURI);

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

    // Enregistrer dans MongoDB avec l'ID Defender
    const nft = new NFT({ owner: recipient, metadataURI, colors, taskId: txResponse.transactionId });
    await nft.save();

    res.json({ success: true, txId: txResponse.transactionId, metadataURI });
  } catch (error) {
    console.error('❌ Erreur Minting:', error);
    res.status(500).json({ error: 'Mint échoué', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`));