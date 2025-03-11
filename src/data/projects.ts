import { ProjectCardProps } from '../components/ProjectCard';

export const projectsData: ProjectCardProps[] = [
  {
    id: "defi-flashloan",
    title: "Flashloan",
    tags: ["Solidity", "React", "Web3"],
    description: "Advanced lending protocol with innovative liquidation mechanisms and multi-token collateral support.",
    link: "https://github.com/0xChaddB/ChadVault"
  },
  {
    id: "swapper",
    title: "Swapper",
    tags: ["ERC-721", "IPFS", "Next.js"],
    description: "Decentralized NFT marketplace with advanced trading features and cross-chain compatibility.",
    link: "https://github.com/0xChaddB/ChadVault"
  },

  {
    id: "portfolio-dashboard",
    title: "Portfolio Dashboard",
    tags: ["TypeScript", "Wagmi", "Vite"],
    description: "Web3 portfolio tracker with real-time price updates and customizable asset visualization.",
    link: undefined
  },

  {
    id: "incoming-projects",
    title: "Cooking some projects...",
    tags: ["Be ready", "Hold your breath", "It's going to blow"],
    description: "More projects incoming... ",
    link: undefined
  },

  // MORE PROJECTS COMING SOOOOOOON
];