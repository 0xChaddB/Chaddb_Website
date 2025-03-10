import { createPublicClient, http } from 'viem';
import { polygonAmoy } from 'viem/chains';
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
  console.error('❌ Erreur de chargement de l\'ABI:', error.message);
  process.exit(1);
}

// Initialiser le client public
const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http(process.env.RPC_URL),
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Lire le nombre total de NFTs mintés
    const totalMinted = await publicClient.readContract({
      address: process.env.NFT_CONTRACT_ADDRESS,
      abi: nftABI,
      functionName: 'totalMinted',
    });

    // Le prochain tokenId est totalMinted + 1
    const nextTokenId = Number(totalMinted) + 1;

    return res.status(200).json({
      success: true,
      nextTokenId,
      totalMinted: Number(totalMinted)
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du tokenId:', error);
    return res.status(500).json({
      success: false,
      error: 'Impossible de récupérer le prochain tokenId'
    });
  }
}