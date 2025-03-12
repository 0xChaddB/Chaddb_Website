// src/components/NFTMinter.tsx
import { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { BiconomySmartAccountV2 } from '@biconomy/account';
import { encodeFunctionData, parseAbi, createPublicClient, http } from 'viem';
import { polygon } from 'viem/chains';

const NFT_CONTRACT_ADDRESS = '0xYourDeployedContractAddress'; // Remplace par ton adresse
const NFT_CONTRACT_ABI = parseAbi([
  'function entryMint(address to, bytes signature, string metadataURI) external',
  'function totalMinted() view returns (uint16)',
]);

export default function NFTMinter() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [mintStatus, setMintStatus] = useState<string>('Connect wallet to claim your NFT');
  const [statusType, setStatusType] = useState<string>('');
  const [isMinting, setIsMinting] = useState(false);
  const [isMinted, setIsMinted] = useState(false);

  const publicClient = createPublicClient({
    chain: polygon,
    transport: http('https://polygon-mainnet.infura.io/v3/ede8136edbb24fe0b2c5194483b8d6ed'),
  });

  useEffect(() => {
    if (!isConnected) {
      setMintStatus('Connect wallet to claim your NFT');
      setStatusType('');
    } else {
      setMintStatus('Wallet connected! You can now mint your NFT');
      setStatusType('connected');
    }
  }, [isConnected]);

  const generateRandomColor = () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  };

  const handleMint = async () => {
    if (!isConnected || !address || !walletClient) return;

    setIsMinting(true);
    setMintStatus('Generating metadata...');
    setStatusType('connected');

    try {
      const totalMinted = await publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: NFT_CONTRACT_ABI,
        functionName: 'totalMinted',
      });

      const tokenId = BigInt(totalMinted) + BigInt(1);

      const colors = {
        path1: generateRandomColor(),
        path2: generateRandomColor(),
        path3: generateRandomColor(),
        path4: generateRandomColor(),
      };

      const metadata = {
        name: `Visitor Badge #${tokenId}`,
        description: "An exclusive NFT proving you visited 0xChaddB's portfolio.",
        image: "ipfs://QmYourImageBaseCID/logo.svg",
        attributes: [
          { trait_type: "Path 1 Color", value: colors.path1 },
          { trait_type: "Path 2 Color", value: colors.path2 },
          { trait_type: "Path 3 Color", value: colors.path3 },
          { trait_type: "Path 4 Color", value: colors.path4 },
        ],
      };

      setMintStatus('Uploading metadata to IPFS...');
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000/upload-ipfs' 
        : 'https://chaddb.xyz/server/upload-ipfs'; // URL dynamique
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata }),
      });
      if (!response.ok) throw new Error('IPFS upload failed');
      const { metadataURI } = await response.json();

      setMintStatus('Signing transaction...');
      const signature = await walletClient.signTypedData({
        domain: {
          name: 'VisitorNFT',
          version: '1',
          chainId: polygon.id,
          verifyingContract: NFT_CONTRACT_ADDRESS,
        },
        types: {
          MintRequest: [
            { name: 'to', type: 'address' },
            { name: 'tokenId', type: 'uint256' },
          ],
        },
        primaryType: 'MintRequest',
        message: {
          to: address,
          tokenId: tokenId,
        },
      });

      setMintStatus('Preparing gasless transaction...');
      const smartAccount = await BiconomySmartAccountV2.create({
        chainId: 137,
        bundlerUrl: 'https://bundler.biconomy.io/api/v2/137/nJPK7B3ru.dd7f7861-...',
        paymasterUrl: 'https://paymaster.biconomy.io/api/v1/137/VFsVwKvKJ.c8eeaa97-a6ea-44f4-a3dd-33faed61336a',
        entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
        signer: walletClient,
      });

      const txData = encodeFunctionData({
        abi: NFT_CONTRACT_ABI,
        functionName: 'entryMint',
        args: [address, signature, metadataURI],
      });

      const tx = { to: NFT_CONTRACT_ADDRESS, data: txData };
      const userOp = await smartAccount.buildUserOp([tx]);
      const userOpResponse = await smartAccount.sendUserOp(userOp);
      const receipt = await userOpResponse.wait();

      console.log('Transaction Hash:', receipt.receipt.transactionHash);
      setMintStatus('NFT successfully minted!');
      setStatusType('success');
      setIsMinting(false);
      setIsMinted(true);
    } catch (err) {
      console.error('Mint error:', err);
      setMintStatus(`Failed to mint: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setStatusType('error');
      setIsMinting(false);
    }
  };

  return (
    <div>
      <div className={`mint-status ${statusType}`}>{mintStatus}</div>
      <div className="mint-controls">
        <button
          onClick={handleMint}
          disabled={!isConnected || isMinting || isMinted}
          className="button button-secondary mint-button"
        >
          {isMinting ? 'Minting...' : isMinted ? 'Minted ✓' : 'Mint NFT'}
        </button>
      </div>
    </div>
  );
}