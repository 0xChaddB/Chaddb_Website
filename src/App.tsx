import { useState, useEffect } from "react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [mintStatus, setMintStatus] = useState("Connect wallet to claim your NFT");
  const [statusType, setStatusType] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [isMinted, setIsMinted] = useState(false);

  // Use wagmi hooks for the latest version
  const { address, isConnected } = useAccount();

  // Update status when connection changes
  useEffect(() => {
    if (isConnected && address) {
      setMintStatus("Wallet connected! You can now mint your NFT");
      setStatusType("connected");
    } else {
      setMintStatus("Connect wallet to claim your NFT");
      setStatusType("");
    }
  }, [isConnected, address]);

  // Function for simulating the mint process
  const handleMintNFT = async () => {
    if (!isConnected) return;

    setIsMinting(true);
    setMintStatus("Minting in progress...");
    setStatusType("connected");

    // For demo purposes - simulate a transaction
    setTimeout(() => {
      setMintStatus("Transaction submitted! Waiting for confirmation...");

      // Simulate confirmation after a delay
      setTimeout(() => {
        setMintStatus("NFT successfully minted!");
        setStatusType("success");
        setIsMinting(false);
        setIsMinted(true);
      }, 2000);
    }, 1500);

    // For real implementation with a contract, you would use:
    // import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
    // const { writeContract, error, isPending } = useWriteContract()
    // 
    // And then call the contract with:
    // writeContract({
    //   address: '0xYourContractAddress',
    //   abi: [...],
    //   functionName: 'mint',
    // })
  };

  return (
    <>
      {/* Grid Background */}
      <div className="grid-bg"></div>

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

      {/* Projects Section */}
      <section id="projects" className="section section-dark">
        <div className="section-content">
          <h2 className="section-title">Featured Projects</h2>
          <p className="section-subtitle">Here are some of my recent works in the Web3 space.</p>

          <div className="projects-grid">
            <div className="project-card">
              <h3 className="project-title">DeFi Flashloan Protocol</h3>
              <div className="project-tags">
                <span className="project-tag">Solidity</span>
                <span className="project-tag">React</span>
                <span className="project-tag">Web3</span>
              </div>
              <p className="project-description">
                Advanced lending protocol with innovative liquidation mechanisms and
                multi-token collateral support.
              </p>
              <a href="#" className="project-link">View Project →</a>
            </div>

            <div className="project-card">
              <h3 className="project-title">Swapper</h3>
              <div className="project-tags">
                <span className="project-tag">ERC-721</span>
                <span className="project-tag">IPFS</span>
                <span className="project-tag">Next.js</span>
              </div>
              <p className="project-description">
                Decentralized NFT marketplace with advanced trading features
                and cross-chain compatibility.
              </p>
              <a href="#" className="project-link">View Project →</a>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="stack" className="section">
        <div className="section-content">
          <h2 className="section-title">Tech Stack</h2>
          <p className="section-subtitle">Technologies and tools I specialize in.</p>

          <div className="tech-grid">
            <div className="tech-card">
              <div className="tech-icon">⚡</div>
              <h3 className="tech-name">Solidity</h3>
              <p className="tech-description">
                Smart contract development and optimization for
                various blockchain platforms.
              </p>
            </div>

            <div className="tech-card">
              <div className="tech-icon">🌐</div>
              <h3 className="tech-name">Viem/Ethers.js</h3>
              <p className="tech-description">
                Blockchain interaction and dApp development with
                modern JavaScript frameworks.
              </p>
            </div>

            <div className="tech-card">
              <div className="tech-icon">⚛️</div>
              <h3 className="tech-name">React</h3>
              <p className="tech-description">
                Frontend development with React and modern
                frameworks like Next.js.
              </p>
            </div>

            <div className="tech-card">
              <div className="tech-icon">🦀</div>
              <h3 className="tech-name">Rust</h3>
              <p className="tech-description">
                High-performance blockchain development and
                smart contract optimization.
              </p>
            </div>
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
                <img src="/images/NFTBadgeTest.png" alt="Visitor Badge NFT" className="nft-image" />
                <div className="nft-badge">Free Mint</div>
              </div>

              <div className="nft-details">
                <div>
                  <h3 className="nft-name">Visitor Badge #001</h3>
                  <p className="nft-info">This exclusive NFT is proof that you visited my portfolio. Each badge is unique and timestamped on the blockchain.</p>
                </div>

                <div className="nft-stats">
                  <div className="nft-stat">
                    <div className="nft-stat-value">100</div>
                    <div className="nft-stat-label">Total Supply</div>
                  </div>
                  <div className="nft-stat">
                    <div className="nft-stat-value">1</div>
                    <div className="nft-stat-label">Per Wallet</div>
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
                      openChainModal,
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
    </>
  );
}

export default App;