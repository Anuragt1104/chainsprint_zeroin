"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function WalletConnectButton() {
  return (
    <ConnectButton
      accountStatus={{
        smallScreen: "avatar",
        largeScreen: "address",
      }}
      label="Connect wallet"
      showBalance={{ smallScreen: false, largeScreen: true }}
    />
  );
}