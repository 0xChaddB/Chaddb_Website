import { useAccount, useWriteContract, useTransaction } from 'wagmi';
import { useState, useEffect } from 'react';

// Définition du contrat
const NFT_CONTRACT_ADDRESS = '0xYourContractAddressHere';
const NFT_CONTRACT_ABI = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
] as const;

export default function NFTMinter() {
  const { address, isConnected } = useAccount();
  const [mintStatus, setMintStatus] = useState<string>('Connect wallet to claim your NFT');
  const [statusType, setStatusType] = useState<string>('');
  const [isMinting, setIsMinting] = useState(false);
  const [isMinted, setIsMinted] = useState(false);

  // Utiliser les nouveaux hooks de wagmi v2
  const { 
    writeContract, 
    isPending: isMintLoading,
    isSuccess: isMintStarted,
    error: mintError,
    data: hash
  } = useWriteContract();

  const { 
    isLoading: isTransactionLoading,
    isSuccess: isTransactionSuccess
  } = useTransaction({
    hash: hash as `0x${string}` | undefined,
  });

  // Update status based on connection and transaction state
  useEffect(() => {
    if (!isConnected) {
      setMintStatus('Connect wallet to claim your NFT');
      setStatusType('');
    } else if (mintError) {
      setMintStatus(`Failed to mint: ${mintError.message}`);
      setStatusType('error');
    } else if (isTransactionLoading) {
      setMintStatus('Transaction submitted! Waiting for confirmation...');
      setStatusType('connected');
    } else if (isTransactionSuccess) {
      setMintStatus('NFT successfully minted!');
      setStatusType('success');
    } else if (isMintLoading) {
      setMintStatus('Initiating transaction...');
      setStatusType('connected');
    } else if (isMintStarted) {
      setMintStatus('Please confirm the transaction in your wallet');
      setStatusType('connected');
    } else if (isConnected) {
      setMintStatus('Wallet connected! You can now mint your NFT');
      setStatusType('connected');
    }
  }, [
    isConnected,
    mintError,
    isMintLoading,
    isMintStarted,
    isTransactionLoading,
    isTransactionSuccess
  ]);

  // Function to handle minting
  const handleMint = async () => {
    try {
      // Test environment check
      if (import.meta.env.DEV) {
        // Simulation pour le développement
        setIsMinting(true);
        setMintStatus('Initiating transaction...');
        setStatusType('connected');
        
        setTimeout(() => {
          setMintStatus('Transaction submitted! Waiting for confirmation...');
        }, 1000);
        
        setTimeout(() => {
          setMintStatus('NFT successfully minted!');
          setStatusType('success');
          setIsMinting(false);
          setIsMinted(true);
        }, 3000);
        
        return;
      }
      
      // Pour production, appeler le contrat
      writeContract({
        abi: NFT_CONTRACT_ABI,
        address: NFT_CONTRACT_ADDRESS,
        functionName: 'mint',
      });
    } catch (error) {
      console.error('Mint error:', error);
      setMintStatus(`Failed to mint: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStatusType('error');
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