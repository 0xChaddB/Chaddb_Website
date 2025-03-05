import { FaEthereum, FaJsSquare, FaReact, FaRust } from 'react-icons/fa';
import { SiTypescript } from 'react-icons/si';

export interface TechStackItem {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  name: string;
  description: string;
}

export const techStackData: TechStackItem[] = [
  {
    icon: FaEthereum, 
    name: 'Solidity',
    description: 'Smart contract development and optimization for various blockchain platforms.',
  },
  {
    icon: SiTypescript, 
    name: 'TS/Viem',
    description: 'Blockchain interaction and dApp development with modern JavaScript frameworks.',
  },
  {
    icon: FaReact, 
    name: 'React',
    description: 'Frontend development with React and modern frameworks like Next.js.',
  },
  {
    icon: FaRust, 
    name: 'Rust',
    description: 'High-performance blockchain development and smart contract optimization.',
  },
];