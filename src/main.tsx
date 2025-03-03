import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiConfig, createConfig, configureChains } from "wagmi";
import { mainnet } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import App from "./App";
import "./index.css";

// Configuration des chaînes et wallets
const { chains, publicClient } = configureChains([mainnet], [publicProvider()]);
const { connectors } = getDefaultWallets({
  appName: "0xChaddB Portfolio",
  projectId: "3ddaf49536fb377e34291bc7dd575f95",
  chains,
});
const wagmiConfig = createConfig({ autoConnect: true, connectors, publicClient });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <App />
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>
);

