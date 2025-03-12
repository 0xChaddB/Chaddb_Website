import { useState, useEffect } from "react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import ProjectCarousel from './components/ProjectCarousel';
import { techStackData } from './data/techStack';
import AnimatedLogo from './components/AnimatedLogo';
import NFTLogo from './components/NFTLogo';
import NFTPreview from './components/NFTPreview';

interface MintedNFTInfo {
  transactionId: string;
  transactionHash: string;
  metadataURI: string;
  tokenId: number;
  openseaUrl: string;
  blockExplorerUrl: string;
}

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [mintStatus, setMintStatus] = useState("Connect wallet to claim your NFT");
  const [statusType, setStatusType] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [isMinted, setIsMinted] = useState(false);
  const [nextTokenId, setNextTokenId] = useState(0);
  const [mintedNFTInfo, setMintedNFTInfo] = useState<MintedNFTInfo | null>(null);

  const { address, isConnected } = useAccount();

  useEffect(() => {
    const fetchNextTokenId = async () => {
      try {
        const response = await fetch('/api/next-token-id');
        const data = await response.json();
        if (data.success) {
          setNextTokenId(data.nextTokenId);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du nextTokenId:', error);
      }
    };
    
    fetchNextTokenId();
    // Rafraîchir périodiquement
    const interval = setInterval(fetchNextTokenId, 30000); // Toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);

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
    setMintStatus("Minting en cours...");
    setStatusType("connected");
    
    try {
      // Appel à votre API pour minter le NFT
      const response = await fetch('/api/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipient: address }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMintStatus("NFT minté avec succès!");
        setStatusType("success");
        
        // Stocker les informations du NFT minté
        setMintedNFTInfo({
          transactionId: data.txId,
          transactionHash: data.transactionHash,
          metadataURI: data.metadataURI,
          tokenId: nextTokenId,
          openseaUrl: `https://testnets.opensea.io/assets/polygon-amoy/${process.env.VITE_NFT_CONTRACT_ADDRESS}/${nextTokenId}`,
          blockExplorerUrl: `https://www.oklink.com/fr/amoy/tx/${data.transactionHash}`
        });
        
        // Incrémenter le prochain token ID
        setNextTokenId(prev => prev + 1);
        setIsMinted(true);
      } else {
        setMintStatus(`Échec du mint: ${data.error}`);
        setStatusType("error");
      }
    } catch (error) {
      console.error('Erreur lors du mint:', error);
      setMintStatus("Une erreur est survenue lors du mint");
      setStatusType("error");
    } finally {
      setIsMinting(false);
    }
  };
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
          
          <h3 className="nft-minted-title">🎉 NFT Minté avec succès! 🎉</h3>
          
          <div className="nft-minted-links">
            <a 
              href={mintedNFTInfo.blockExplorerUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="nft-minted-link"
            >
              Voir la transaction
            </a>
            <a 
              href={mintedNFTInfo.openseaUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="nft-minted-link"
            >
              Voir sur OpenSea
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
              const IconComponent = tech.icon; // Récupère le composant d’icône
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
                    {nextTokenId ? String(nextTokenId).padStart(3, '0') : '001'}
                  </span>
                </h3>
                  <p className="nft-info">This NFT changes color randomly at each mint, ensuring a unique NFT for everyone!</p>
                </div>
                <div className="nft-stats">
                  <div className="nft-stat">
                    <div className="nft-stat-value">1000</div>
                    <div className="nft-stat-label">Total Supply</div>
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

      {isMinted && mintedNFTInfo && <NFTMintedDetails />}
    </>

    
  );
}

export default App;