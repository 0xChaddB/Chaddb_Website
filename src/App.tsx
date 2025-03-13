import { useState, useEffect } from "react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';
import ProjectCarousel from './components/ProjectCarousel';
import { techStackData } from './data/techStack';
import AnimatedLogo from './components/AnimatedLogo';
import NFTLogo from './components/NFTLogo';
import NFTPreview from './components/NFTPreview';
import MintErrorDisplay from './components/MintErrorDisplay';
import nftABI from '../api/nftABI.json';

// Error typage
type ErrorCode =
  | 'ALREADY_OWNS_NFT'
  | 'MAX_SUPPLY_REACHED'
  | 'UNAUTHORIZED'
  | 'MINT_FAILED'
  | 'IPFS_IMAGE_UPLOAD_FAILED'
  | 'IPFS_METADATA_UPLOAD_FAILED'
  | 'TRANSACTION_FAILED'
  | 'TRANSACTION_REVERTED'
  | 'TRANSACTION_TIMEOUT'
  | 'METHOD_NOT_ALLOWED'
  | 'MISSING_RECIPIENT'
  | 'INVALID_ADDRESS'
  | 'CONTRACT_READ_ERROR'
  | 'ENCODE_DATA_ERROR'
  | 'PROCESSING_ERROR'
  | 'UNKNOWN_ERROR';

// Mapping des erreurs avec typage explicite
const errorMessages: Record<ErrorCode, string> = {
  'ALREADY_OWNS_NFT': 'You already own an NFT from this collection!',
  'MAX_SUPPLY_REACHED': 'Sorry, all NFTs have been minted!',
  'UNAUTHORIZED': 'Server authorization error. Please try again later.',
  'MINT_FAILED': 'NFT minting failed. Please try again.',
  'IPFS_IMAGE_UPLOAD_FAILED': 'Failed to upload artwork. Please try again.',
  'IPFS_METADATA_UPLOAD_FAILED': 'Failed to upload metadata. Please try again.',
  'TRANSACTION_FAILED': 'Transaction failed. Please check your wallet and try again.',
  'TRANSACTION_REVERTED': 'Transaction was rejected by the blockchain.',
  'TRANSACTION_TIMEOUT': 'Transaction is taking too long. Please check your wallet for confirmation.',
  'METHOD_NOT_ALLOWED': 'Invalid request method.',
  'MISSING_RECIPIENT': 'Wallet address is required.',
  'INVALID_ADDRESS': 'Invalid wallet address format.',
  'CONTRACT_READ_ERROR': 'Cannot read blockchain data. Please try again.',
  'ENCODE_DATA_ERROR': 'Error preparing transaction. Please try again.',
  'PROCESSING_ERROR': 'Error processing your request. Please try again.',
  'UNKNOWN_ERROR': 'An unexpected error occurred.'
};

// Interface pour les données de réponse de l'API
interface MintResponse {
  success: boolean;
  txId: string;
  transactionHash?: string;
  metadataURI: string;
  tokenId: number;
  error?: string;
  errorCode?: string;
}

// Interface
interface MintedNFTInfo {
  transactionId: string;
  transactionHash: string;
  metadataURI: string;
  tokenId: number;
  openseaUrl: string;
  blockExplorerUrl: string;
}

// Func type
const log = (...args: unknown[]) => {
  if (import.meta.env.MODE === 'development') console.log(...args);
};

const handleError = (
  setMintStatus: React.Dispatch<React.SetStateAction<string>>,
  setStatusType: React.Dispatch<React.SetStateAction<string>>,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
  setShowErrorPopup: React.Dispatch<React.SetStateAction<boolean>>,
  setIsMinting: React.Dispatch<React.SetStateAction<boolean>>
) => (error: unknown, customMessage = "An unexpected error occurred.") => {
  log('❌ Error:', error);
  const errorMessage = error instanceof Error ? error.message : customMessage;
  setMintStatus(errorMessage);
  setStatusType("error");
  setErrorMessage(errorMessage);
  setShowErrorPopup(true);
  setIsMinting(false);
};

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [mintStatus, setMintStatus] = useState("Connect wallet to claim your NFT");
  const [statusType, setStatusType] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [isMinted, setIsMinted] = useState(false);
  const [nextTokenId, setNextTokenId] = useState(0);
  const [mintedNFTInfo, setMintedNFTInfo] = useState<MintedNFTInfo | null>(null);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { address, isConnected } = useAccount();

  const { data: totalMintedData, isLoading } = useReadContract({
    address: import.meta.env.VITE_NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: nftABI,
    functionName: 'totalMinted',
  });

  // Nextokenid
  useEffect(() => {
    if (totalMintedData !== undefined) {
      setNextTokenId(Number(totalMintedData) + 1);
    }
  }, [totalMintedData]);

  // Subscribe to Transfer events for real-time updates
  useWatchContractEvent({
    address: import.meta.env.VITE_NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: nftABI,
    eventName: 'Transfer',
    args: { from: '0x0000000000000000000000000000000000000000' }, // Filter for mints
    onLogs: (logs) => {
      console.log('New mint detected:', logs);
      setNextTokenId((prev) => (prev !== null ? prev + 1 : 2)); // Increment on each mint
    },
    onError: (error) => console.error('Event subscription error:', error),
  });

  useEffect(() => {
    if (isConnected && address) {
      setMintStatus("Wallet connected! You can now mint your NFT");
      setStatusType("connected");
    } else {
      setMintStatus("Connect wallet to claim your NFT");
      setStatusType("");
    }
  }, [isConnected, address]);

  const handleMintNFT = async () => {
    if (!isConnected || !address) return;

    setIsMinting(true);
    setMintStatus("Minting in progress...");
    setStatusType("connected");
    setIsMinted(false);
    setMintedNFTInfo(null);
    setShowErrorPopup(false);

    const errorHandler = handleError(setMintStatus, setStatusType, setErrorMessage, setShowErrorPopup, setIsMinting);

    try {
      log('📡 Sending mint request...');

      const TIMEOUT_MS = parseInt(import.meta.env.VITE_MINT_TIMEOUT_MS, 10) || 30000;
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out. Please try again.")), TIMEOUT_MS)
      );

      const response = await Promise.race<Response | never>([
        fetch('/api/mint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipient: address }),
          cache: 'no-store',
        }),
        timeoutPromise
      ]);

      log('📡 API Response Status:', response.status);
      log('📡 API Response Headers:', response.headers);

      const data: MintResponse = await response.json().catch(() => {
        throw new Error(`Server error (${response.status}): Invalid response format.`);
      });

      log('📡 API Raw Data:', data);

      if (!response.ok) {
        const errorCode = (data?.errorCode || 'UNKNOWN_ERROR') as ErrorCode;
        const friendlyMessage = errorMessages[errorCode] || data?.error || "An unexpected error occurred.";
        return errorHandler(new Error(friendlyMessage), friendlyMessage);
      }

      if (!data.txId || !data.tokenId || !data.metadataURI) {
        throw new Error("Invalid API response: Missing required fields.");
      }

      const contractAddress = import.meta.env.VITE_NFT_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error("NFT contract address is not configured.");
      }

      const mintedInfo: MintedNFTInfo = {
        transactionId: data.txId,
        transactionHash: data.transactionHash || data.txId,
        metadataURI: data.metadataURI,
        tokenId: data.tokenId,
        openseaUrl: `https://testnets.opensea.io/assets/amoy/${contractAddress}/${data.tokenId}`,
        blockExplorerUrl: `https://www.oklink.com/fr/amoy/tx/${data.transactionHash || data.txId}`
      };

      setMintStatus("NFT minted successfully!");
      setStatusType("success");
      setMintedNFTInfo(mintedInfo);
      setIsMinted(true);

      log('✅ Minted NFT Info:', mintedInfo);

    } catch (error) {
      errorHandler(error);
    } finally {
      setIsMinting(false);
    }
  };

  // NFT DETAILS
  const NFTMintedDetails = () => {
    if (!mintedNFTInfo) return null;

    return (
      <div className="success-popup">
        <div className="success-popup-content">
          <button 
            onClick={() => setIsMinted(false)} 
            className="popup-close-button"
          >
            ×
          </button>
          <h3 className="nft-minted-title">🎉 NFT Minted successfully! 🎉</h3>
          <div className="nft-minted-links">
            <a 
              href={mintedNFTInfo.blockExplorerUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="nft-minted-link"
            >
              See transaction
            </a>
            <a 
              href={mintedNFTInfo.openseaUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="nft-minted-link"
            >
              Look on OpenSea
            </a>
          </div>
          <div className="nft-minted-preview">
            <NFTPreview metadataURI={mintedNFTInfo.metadataURI} />
          </div>
        </div>
      </div>
    );
  };



  return (
    <>
      <div className="grid-bg"></div>
      <AnimatedLogo className="background-logo" /> 
      {/* Contact Modal */}
      <div id="contact-modal" className={`contact-modal ${isContactModalOpen ? 'active' : ''}`}>
        <div className="contact-modal-content">
          <button
            onClick={() => setIsContactModalOpen(false)}
            className="contact-modal-close"
          >×</button>
          <h2 className="contact-modal-title">Get in Touch</h2>
          <div className="contact-links">
            <a href="https://x.com/0xChaddB" target="_blank" className="contact-link">
              <span className="contact-link-icon">𝕏</span>
              <span className="contact-link-text">X (Twitter)</span>
            </a>
            <a href="https://github.com/0xChaddB" target="_blank" className="contact-link">
              <span className="contact-link-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </span>
              <span className="contact-link-text">GitHub</span>
            </a>
            <a href="https://t.me/votre_username" target="_blank" className="contact-link">
              <span className="contact-link-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.26.26-.534.26l.213-3.05 5.56-5.02c.24-.213-.054-.334-.373-.12l-6.87 4.33-2.96-.92c-.64-.203-.658-.64.135-.954l11.57-4.46c.538-.196 1.006.128.832.94z" />
                </svg>
              </span>
              <span className="contact-link-text">Telegram</span>
            </a>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="nav">
        <div className="nav-content">
          <a href="#" className="logo">0xChaddB</a>
          <button
            className="hamburger-menu"
            aria-label="Toggle navigation"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >☰</button>
          <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
            <a href="#projects" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Projects</a>
            <a href="#stack" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Stack</a>
            <a href="#nft" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Free NFT</a>
            <a href="#" className="nav-link" onClick={(e) => {
              e.preventDefault();
              setIsMobileMenuOpen(false);
              setIsContactModalOpen(true);
            }}>Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">Web3 Developer</div>
          <h1 className="hero-title">Building the Future<br />of Web3</h1>
          <p className="hero-description">
            Specialized in developing cutting-edge decentralized applications
            and smart contract solutions. Creating innovative solutions for
            the next generation of the internet.
          </p>
          <div className="button-container">
            <a href="#projects" className="button button-primary">View Projects</a>
            <a href="#" className="button button-secondary" onClick={(e) => {
              e.preventDefault();
              setIsContactModalOpen(true);
            }}>Get in Touch</a>
          </div>
        </div>
      </section>

      {/* Projects Section avec Carousel */}
      <ProjectCarousel />

      {/* Tech Stack Section */}
      <section id="stack" className="section">
        <div className="section-content">
          <h2 className="section-title">Tech Stack</h2>
          <p className="section-subtitle">Technologies and tools I specialize in.</p>
          <div className="tech-grid">
            {techStackData.map((tech, index) => {
              const IconComponent = tech.icon; 
              return (
                <div key={index} className="tech-card">
                  <IconComponent className="tech-icon" />
                  <h3 className="tech-name">{tech.name}</h3>
                  <p className="tech-description">{tech.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* NFT Section */}
      <section id="nft" className="section nft-section">
        <div className="section-content">
          <div className="nft-container">
            <div className="nft-header">
              <h2 className="nft-title">Claim Your Free NFT</h2>
              <p className="nft-description">As a thank you for visiting my site, claim this exclusive NFT that proves you were here.</p>
            </div>
            <div className="nft-content">
              <div className="nft-preview">
                <NFTLogo className="nft-image" />
              </div>
              <div className="nft-details">
                <div>
                <h3 className="nft-name">
                  Visitor Badge #
                  <span className="nft-token-number">
                    {isLoading || nextTokenId === null ? 'Loading...' : String(nextTokenId).padStart(3, '0')}
                  </span>
                </h3>
                  <p className="nft-info">This NFT changes color randomly at each mint, ensuring a unique NFT for everyone!</p>
                </div>
                <div className="nft-stats">
                  <div className="nft-stat">
                    <div className="nft-stat-value">{isLoading || totalMintedData === undefined ? '...' : Number(totalMintedData)}</div>
                    <div className="nft-stat-label">Minted So Far</div>
                  </div>
                  <div className="nft-stat">
                    <div className="nft-stat-value">Free</div>
                    <div className="nft-stat-label">Mint Price</div>
                  </div>
                </div>
                <div id="mint-status" className={`mint-status ${statusType}`}>{mintStatus}</div>
                <div className="mint-controls">
                <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openConnectModal,
                    mounted,
                  }) => {
                    const ready = mounted;
                    const connected = ready && account && chain;
                    return (
                      <button
                        onClick={connected ? openAccountModal : openConnectModal}
                        type="button"
                        className="button button-primary mint-button"
                      >
                        {connected ? `${account.displayName}` : "Connect Wallet"}
                      </button>
                    );
                  }}
                </ConnectButton.Custom>

                <button
                  onClick={handleMintNFT}
                  disabled={!isConnected || isMinting || isMinted}
                  className="button button-secondary mint-button"
                >
                  {isMinting ? 'Minting...' : isMinted ? 'Minted ✓' : 'Mint NFT'}
                </button>
                
                {isMinted && mintedNFTInfo && (
                  <NFTMintedDetails />
                )}
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <p className="footer-text">© 2024 0xChaddB. All rights reserved.</p>
      </footer>

      {/* Loading Popup */}
      {isMinting && (
        <div className="loading-popup">
          <div className="loading-popup-content">
            <div className="loading-spinner"></div>
            <h3 className="loading-title">Minting in progress...</h3>
            <p className="loading-text">Please wait for your NFT to be mint on the blockchain</p>
          </div>
        </div>
      )}

      {isMinted && mintedNFTInfo && mintedNFTInfo.transactionHash && <NFTMintedDetails />}

      {showErrorPopup && (
        <MintErrorDisplay 
          errorMessage={errorMessage} 
          onClose={() => setShowErrorPopup(false)}
          onRetry={handleMintNFT}
        />
      )}
    </>

    
  );
}

export default App;