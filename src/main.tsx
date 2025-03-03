import React from 'react';
import ReactDOM from 'react-dom/client';
import { WagmiProvider } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { http } from 'viem';
import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

// Create wagmi config with RainbowKit
const config = getDefaultConfig({
  appName: '0xChaddB Portfolio',
  projectId: '3ddaf49536fb377e34291bc7dd575f95',
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
});

// Create React Query client
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#00ff88',
            accentColorForeground: '#121212',
            borderRadius: 'medium',
          })}
          locale="en-US" 
        >
          <App />
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  </React.StrictMode>
);