"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider
        appId={
          process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""
        }
        config={{
          appearance: {
            theme: "light",
            accentColor: "#0667D2",
            logo: undefined,
          },
          embeddedWallets: {
            createOnLogin: "users-without-wallets",
          },
          loginMethods: ["wallet", "email", "sms"],
          supportedChains: [
            {
              id: 1,
              name: "Ethereum",
              network: "homestead",
              nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
              rpcUrls: {
                default: { http: ["https://ethereum.publicnode.com"] },
                public: { http: ["https://ethereum.publicnode.com"] },
              },
              blockExplorers: {
                default: { name: "Etherscan", url: "https://etherscan.io" },
              },
            },
          ],
        }}
      >
        {children}
      </PrivyProvider>
    </QueryClientProvider>
  );
}
