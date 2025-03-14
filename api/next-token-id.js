import { createPublicClient, http } from 'viem';
import { polygon } from 'viem/chains';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Charger l'ABI du contrat NFT
let nftABI;
try {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const abiPath = join(__dirname, 'nftABI.json');
  nftABI = JSON.parse(readFileSync(abiPath, 'utf8'));
} catch (error) {
  console.error('❌ Error loading ABI:', error.message);
  process.exit(1);
}

// Initialiser le client public
const publicClient = createPublicClient({
  chain: polygon,
  transport: http(process.env.VITE_RPC_URL),
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Unauthorized method' });
  }

  try {
    // Lire le nombre total de NFTs mintés
    const totalMinted = await publicClient.readContract({
      address: process.env.NFT_CONTRACT_ADDRESS,
      abi: nftABI,
      functionName: 'totalMinted',
    });

    // Le prochain tokenId est totalMinted 
    const nextTokenId = Number(totalMinted);

    return res.status(200).json({
      success: true,
      nextTokenId,
      totalMinted: Number(totalMinted)
    });
  } catch (error) {
    console.error('❌ Error fetching nextTokenId:', error);
    return res.status(500).json({
      success: false,
      error: 'Cant read next tokenId'
    });
  }
}