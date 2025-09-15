"use client";
import React, { createContext, useContext, ReactNode } from "react";
import { useTokenAddress } from "@/hooks/useTokenAddress";
import { useMetaMask } from "@/hooks/metamask/useMetaMaskProvider";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useSearchParams } from "next/navigation";

interface TokenContextType {
  tokenAddress: string | null;
  reason: string;
  isLoading: boolean;
  setManually: (address: string) => Promise<boolean>;
  clearTokenAddress: () => void;
  refresh: () => void;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

interface TokenProviderProps {
  children: ReactNode;
}

export function TokenProvider({ children }: TokenProviderProps) {
  const { provider, chainId } = useMetaMask();
  const { ethersSigner } = useMetaMaskEthersSigner();
  const searchParams = useSearchParams();

  // Get URL parameters
  const tokenFromUrl = searchParams.get("token");
  const ownerFromUrl = searchParams.get("owner");
  const slugFromUrl = searchParams.get("slug");

  // Token address resolver
  const { 
    tokenAddress, 
    reason, 
    isLoading, 
    setManually,
    clearTokenAddress,
    refresh
  } = useTokenAddress({
    provider: provider as any, // Type assertion for compatibility
    chainId,
    tokenFromUrl: tokenFromUrl || undefined,
    ownerFromUrl: ownerFromUrl || undefined,
    slugFromUrl: slugFromUrl || undefined,
    userAddress: ethersSigner?.address,
  });

  const value: TokenContextType = {
    tokenAddress,
    reason,
    isLoading,
    setManually,
    clearTokenAddress,
    refresh,
  };

  return (
    <TokenContext.Provider value={value}>
      {children}
    </TokenContext.Provider>
  );
}

export function useTokenContext(): TokenContextType {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error("useTokenContext must be used within a TokenProvider");
  }
  return context;
}
