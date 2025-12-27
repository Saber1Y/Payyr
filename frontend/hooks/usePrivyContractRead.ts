"use client";

import { useReadContract } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";

// Custom hook that bridges Privy wallet with wagmi
export function usePrivyContractRead(
  address: `0x${string}`,
  abi: any[],
  functionName: string,
  args?: any[]
) {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [shouldRead, setShouldRead] = useState(false);

  // Only enable wagmi hooks when Privy is authenticated and has wallet
  useEffect(() => {
    if (ready && authenticated && wallets.length > 0) {
      setShouldRead(true);
    } else {
      setShouldRead(false);
    }
  }, [ready, authenticated, wallets]);

  // Use wagmi hook only when conditions are met
  const result = useReadContract({
    address,
    abi,
    functionName,
    args,
    query: {
      enabled: shouldRead,
    },
  });

  return {
    ...result,
    isLoading: result.isLoading || !shouldRead,
  };
}