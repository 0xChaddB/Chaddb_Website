export interface ProjectCardProps {
  id: string;
  title: string;
  tags: string[];
  description: string;
  link?: string; 
  ariaLabel?: string; 
}

export const projectsData: ProjectCardProps[] = [
  {
    id: "defi-flashloan",
    title: "Flashloan",
    tags: ["Solidity", "React", "Web3"],
    description: "Advanced lending protocol with innovative liquidation mechanisms and multi-token collateral support.",
    link: "https://github.com/0xChaddB/ChadVault",
    ariaLabel: "See Flashloan project",
  },
  {
    id: "swapper",
    title: "Swapper",
    tags: ["ERC-721", "IPFS", "Next.js"],
    description: "Decentralized NFT marketplace with advanced trading features and cross-chain compatibility.",
    link: "https://github.com/0xChaddB/ChadVault",
    ariaLabel: "See Swapper project",
  },
  {
    id: "portfolio-dashboard",
    title: "Portfolio Dashboard",
    tags: ["TypeScript", "Wagmi", "Vite"],
    description: "Web3 portfolio tracker with real-time price updates and customizable asset visualization.",
    link: undefined,
    ariaLabel: "Projet Portfolio Dashboard",
  },
  {
    id: "incoming-projects",
    title: "Cooking some projects...",
    tags: ["Be ready", "Hold your breath", "It's going to blow"],
    description: "More projects incoming...",
    link: undefined,
    ariaLabel: "More projects soon",
  },

  // MORE PROJECTS ????
];