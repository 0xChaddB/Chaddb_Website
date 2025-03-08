import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWalletClient, http, parseEther, encodeFunctionData } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { polygonMumbai, polygonAmoy } from 'viem/chains';
import NFT from './models/NFT.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// **🔍 Charger `.env` sans dépendre du shell**
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envVars = fs.readFileSync(envPath, 'utf8').split('\n');
    envVars.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim();
    });
} else {
    console.error("❌ Fichier `.env` introuvable !");
    process.exit(1);
}

dotenv.config(); // Charger aussi via dotenv en backup

const app = express();
app.use(cors());
app.use(express.json());

// 🔍 Vérifier si `.env` est bien chargé
console.log("🔍 PRIVATE_KEY =", process.env.PRIVATE_KEY ? "✅ OK" : "❌ NON DÉFINI");
console.log("🔍 MONGO_URI =", process.env.MONGO_URI ? "✅ OK" : "❌ NON DÉFINI");
console.log("🔍 RPC_URL =", process.env.RPC_URL ? "✅ OK" : "❌ NON DÉFINI");

// **Connexion à MongoDB**
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connecté'))
    .catch(err => {
        console.error('❌ Erreur MongoDB:', err);
        process.exit(1);
    });

// **Corriger et parser l'ABI**
try {
    console.log("🔍 ABI brute :", process.env.ABI);

    // Corriger les guillemets et les espaces mal placés
    const ABI_STRING = process.env.ABI.replace(/\\/g, '').trim();

    // Vérifier avant parsing
    if (!ABI_STRING.startsWith("{") && !ABI_STRING.startsWith("[")) {
        throw new Error("ABI mal formatée : elle doit commencer par `{` ou `[`.");
    }

    var abi = JSON.parse(ABI_STRING);
    console.log("✅ ABI chargée :", abi);
} catch (error) {
    console.error("❌ Erreur parsing ABI :", error.message);
    process.exit(1);
}

// **Sélectionner le bon réseau**
const CHAIN_ID = parseInt(process.env.CHAIN_ID, 10);
const NETWORK = CHAIN_ID === 80002 ? polygonAmoy : polygonMumbai;

const provider = http(process.env.RPC_URL);
const account = privateKeyToAccount(process.env.PRIVATE_KEY);

const walletClient = createWalletClient({
    account,
    chain: NETWORK,
    transport: provider
});

// **Fonction pour générer des couleurs aléatoires**
function generateRandomColors() {
    return {
        color1: `#${Math.floor(Math.random()*16777215).toString(16)}`,
        color2: `#${Math.floor(Math.random()*16777215).toString(16)}`,
        color3: `#${Math.floor(Math.random()*16777215).toString(16)}`
    };
}

// **Endpoint : Mint NFT avec Viem**
app.post('/mint-nft', async (req, res) => {
    try {
        console.log("📩 Headers reçus :", req.headers);
        console.log("📩 Body reçu :", req.body);

        const { recipient, metadataURI } = req.body;

        if (!recipient || !metadataURI) {
            return res.status(400).json({ error: "Recipient et metadataURI sont requis" });
        }

        console.log("🔍 Minting NFT pour", recipient);

        // **Construire la transaction**
        const functionData = encodeFunctionData({
            abi,
            functionName: "mint",
            args: [recipient, metadataURI]
        });

        const txHash = await walletClient.sendTransaction({
            account,
            to: process.env.NFT_CONTRACT_ADDRESS,
            data: functionData,
            value: parseEther('0'), // Envoi de 0 MATIC
            gas: 300000 // Ajuster selon les besoins
        });

        console.log("✅ Transaction envoyée :", txHash);

        // **Sauvegarde en base**
        const nft = new NFT({ owner: recipient, metadataURI, colors: generateRandomColors(), taskId: txHash });
        await nft.save();

        res.json({ success: true, txHash, nft });
    } catch (error) {
        console.error("❌ Erreur Minting Viem :", error);
        res.status(500).json({ error: 'Mint échoué', details: error.message });
    }
});

// **Endpoint : Récupérer les NFTs d'un utilisateur**
app.get('/nft/:owner', async (req, res) => {
    try {
        const nfts = await NFT.find({ owner: req.params.owner });
        res.json(nfts);
    } catch (error) {
        console.error('❌ Erreur récupération NFTs:', error);
        res.status(500).json({ error: 'Impossible de récupérer les NFTs' });
    }
});

// **Endpoint : API Metadata pour OpenSea**
app.get('/metadata/:taskId', async (req, res) => {
    try {
        const nft = await NFT.findOne({ taskId: req.params.taskId });
        if (!nft) return res.status(404).json({ error: "NFT non trouvé" });

        const metadata = {
            name: "NFT Unique",
            description: "Un NFT avec des couleurs générées aléatoirement",
            image: nft.metadataURI,
            attributes: [
                { trait_type: "Couleur 1", value: nft.colors.color1 },
                { trait_type: "Couleur 2", value: nft.colors.color2 },
                { trait_type: "Couleur 3", value: nft.colors.color3 }
            ]
        };

        res.json(metadata);
    } catch (error) {
        console.error('❌ Erreur récupération Metadata:', error);
        res.status(500).json({ error: 'Impossible de récupérer les metadata' });
    }
});

// **Lancer le serveur**
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`));
