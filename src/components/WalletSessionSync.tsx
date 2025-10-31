"use client";

import { useEffect, useRef, useTransition } from "react";
import { useAccount, useChainId } from "wagmi";

import { syncWalletSession } from "@/app/actions/sync-wallet-session";

export function WalletSessionSync() {
  const { address, status } = useAccount();
  const chainId = useChainId();
  const [isPending, startTransition] = useTransition();
  const lastSynced = useRef<string | null>(null);

  useEffect(() => {
    if (!address || status !== "connected") {
      lastSynced.current = null;
      return;
    }

    if (lastSynced.current === address && !isPending) {
      return;
    }

    lastSynced.current = address;
    startTransition(() => {
      void syncWalletSession({ address, chainId });
    });
  }, [address, chainId, isPending, startTransition, status]);

  return null;
}