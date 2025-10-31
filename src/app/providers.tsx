"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";

import { wagmiConfig } from "@/lib/wagmi/config";
import { WalletSessionSync } from "@/components/WalletSessionSync";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#818cf8",
            accentColorForeground: "#0f172a",
            borderRadius: "large",
            fontStack: "rounded",
          })}
          showRecentTransactions={false}
          modalSize="compact"
        >
          {mounted ? (
            <>
              <WalletSessionSync />
              {children}
            </>
          ) : null}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}