"use client";
import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";
import { useTokenAddress } from "@/hooks/useTokenAddress";
import { useMetaMask } from "@/hooks/metamask/useMetaMaskProvider";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useSearchParams } from "next/navigation";
import { createTokenStorageManager, StoredToken } from "@/lib/tokenStorage";

interface TokenContextType {
  // Current active token
  tokenAddress: string | null;
  reason: string;
  isLoading: boolean;
  
  // Token management
  tokens: StoredToken[];
  activeToken: StoredToken | null;
  
  // Actions
  setManually: (address: string) => Promise<boolean>;
  clearTokenAddress: () => void;
  refresh: () => void;
  selectToken: (address: string) => void;
  addToken: (token: Omit<StoredToken, 'addedAt' | 'lastUsed'>) => void;
  removeToken: (address: string) => void;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

interface TokenProviderProps {
  children: ReactNode;
}

export function TokenProvider({ children }: TokenProviderProps) {
  const { provider, chainId } = useMetaMask();
  const { ethersSigner } = useMetaMaskEthersSigner();
  const searchParams = useSearchParams();

  // Local state for token management
  const [tokens, setTokens] = useState<StoredToken[]>([]);
  const [activeToken, setActiveToken] = useState<StoredToken | null>(null);

  // Get URL parameters
  const tokenFromUrl = searchParams.get("token");
  const ownerFromUrl = searchParams.get("owner");
  const slugFromUrl = searchParams.get("slug");

  // Token address resolver (for backward compatibility)
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

  // Load tokens from storage when chainId changes
  useEffect(() => {
    if (chainId) {
      const storage = createTokenStorageManager(chainId);
      const storedTokens = storage.getTokensSorted();
      const activeAddress = storage.getActiveToken();
      
      setTokens(storedTokens);
      
      if (activeAddress) {
        const active = storedTokens.find(t => t.address.toLowerCase() === activeAddress.toLowerCase());
        setActiveToken(active || null);
      } else if (storedTokens.length > 0) {
        // Auto-select first token if no active token
        const firstToken = storedTokens[0];
        setActiveToken(firstToken);
        storage.setActiveToken(firstToken.address);
      }
    } else {
      setTokens([]);
      setActiveToken(null);
    }
  }, [chainId]);

  // Handle URL token parameter
  useEffect(() => {
    if (tokenFromUrl && chainId) {
      const storage = createTokenStorageManager(chainId);
      const existingToken = storage.getToken(tokenFromUrl);
      
      if (existingToken) {
        setActiveToken(existingToken);
        storage.setActiveToken(tokenFromUrl);
      } else {
        // Add URL token to storage
        const newToken: Omit<StoredToken, 'addedAt' | 'lastUsed'> = {
          address: tokenFromUrl,
          source: 'url',
        };
        storage.addToken(newToken);
        setActiveToken({ ...newToken, addedAt: Date.now(), lastUsed: Date.now() });
        storage.setActiveToken(tokenFromUrl);
        
        // Refresh tokens list
        setTokens(storage.getTokensSorted());
      }
    }
  }, [tokenFromUrl, chainId]);

  // Token management functions
  const selectToken = useCallback((address: string) => {
    if (!chainId) return;
    
    const storage = createTokenStorageManager(chainId);
    const token = storage.getToken(address);
    
    if (token) {
      setActiveToken(token);
      storage.setActiveToken(address);
    }
  }, [chainId]);

  const addToken = useCallback((token: Omit<StoredToken, 'addedAt' | 'lastUsed'>) => {
    if (!chainId) return;
    
    const storage = createTokenStorageManager(chainId);
    storage.addToken(token);
    
    // Refresh tokens list
    const updatedTokens = storage.getTokensSorted();
    setTokens(updatedTokens);
    
    // Auto-select if no active token
    if (!activeToken) {
      const newToken = storage.getToken(token.address);
      if (newToken) {
        setActiveToken(newToken);
        storage.setActiveToken(token.address);
      }
    }
  }, [chainId, activeToken]);

  const removeToken = useCallback((address: string) => {
    if (!chainId) return;
    
    const storage = createTokenStorageManager(chainId);
    storage.removeToken(address);
    
    // Refresh tokens list
    const updatedTokens = storage.getTokensSorted();
    setTokens(updatedTokens);
    
    // Clear active token if it was removed
    if (activeToken && activeToken.address.toLowerCase() === address.toLowerCase()) {
      setActiveToken(null);
      storage.clearActiveToken();
      
      // Auto-select next token if available
      if (updatedTokens.length > 0) {
        const nextToken = updatedTokens[0];
        setActiveToken(nextToken);
        storage.setActiveToken(nextToken.address);
      }
    }
  }, [chainId, activeToken]);

  // Determine the effective token address
  const effectiveTokenAddress = activeToken?.address || tokenAddress;

  const value: TokenContextType = {
    // Current active token (prioritize selected token over resolved token)
    tokenAddress: effectiveTokenAddress,
    reason,
    isLoading,
    
    // Token management
    tokens,
    activeToken,
    
    // Actions
    setManually,
    clearTokenAddress,
    refresh,
    selectToken,
    addToken,
    removeToken,
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
