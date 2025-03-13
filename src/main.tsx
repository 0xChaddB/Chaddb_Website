import React from 'react';
import ReactDOM from 'react-dom/client';
import { WagmiProvider } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { webSocket, } from 'viem';
import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const config = getDefaultConfig({
  appName: '0xChaddB Portfolio',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: [polygon],
  transports: {
    [polygon.id]: webSocket(import.meta.env.VITE_WS_RPC_URL),
  },
});

const queryClient = new QueryClient();

// Safe way to get root element
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
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