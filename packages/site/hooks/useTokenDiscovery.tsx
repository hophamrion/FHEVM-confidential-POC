"use client";

import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { createTokenStorageManager, StoredToken } from "@/lib/tokenStorage";

interface DiscoveryResult {
  address: string;
  blockNumber: number;
  transactionHash: string;
}

interface UseTokenDiscoveryParams {
  provider: ethers.BrowserProvider | null;
  chainId: number | undefined;
  userAddress: string | undefined;
}

export function useTokenDiscovery({ 
  provider, 
  chainId, 
  userAddress 
}: UseTokenDiscoveryParams) {
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredTokens, setDiscoveredTokens] = useState<DiscoveryResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Helper function to create compatible provider
  const createCompatibleProvider = useCallback(() => {
    if (!provider) return null;
    return provider instanceof ethers.BrowserProvider 
      ? provider 
      : new ethers.BrowserProvider(provider);
  }, [provider]);

  const discoverTokens = useCallback(async (blockRange: number = 50000) => {
    if (!provider || !chainId || !userAddress) {
      setError("Missing provider, chainId, or userAddress");
      return [];
    }

    setIsDiscovering(true);
    setError(null);
    setDiscoveredTokens([]);

    try {
      console.log('[TokenDiscovery] Starting discovery for user:', userAddress);
      
      // Create compatible provider
      const compatibleProvider = createCompatibleProvider();
      if (!compatibleProvider) {
        setError("Failed to create compatible provider");
        return [];
      }
      
      // Get current block number
      const latestBlock = await compatibleProvider.getBlockNumber();
      const fromBlock = Math.max(0, latestBlock - blockRange);
      
      console.log('[TokenDiscovery] Scanning blocks:', fromBlock, 'to', latestBlock);

      // Prepare filter for ConfidentialTransfer events
      // event ConfidentialTransfer(address indexed from, address indexed to, bytes32 indexed encHash)
      const topic0 = ethers.id("ConfidentialTransfer(address,address,bytes32)");
      const topicTo = ethers.zeroPadValue(userAddress, 32).toLowerCase();

      // Get logs
      const logs = await compatibleProvider.getLogs({
        fromBlock,
        toBlock: "latest",
        topics: [topic0, null, topicTo], // topic1=from, topic2=to
      });

      console.log('[TokenDiscovery] Found', logs.length, 'transfer events');

      // Extract unique token addresses
      const tokenAddresses = new Set<string>();
      const results: DiscoveryResult[] = [];

      for (const log of logs) {
        const tokenAddress = log.address.toLowerCase();
        if (!tokenAddresses.has(tokenAddress)) {
          tokenAddresses.add(tokenAddress);
          results.push({
            address: tokenAddress,
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
          });
        }
      }

      console.log('[TokenDiscovery] Discovered', results.length, 'unique tokens');
      setDiscoveredTokens(results);
      return results;

    } catch (error) {
      console.error('[TokenDiscovery] Error during discovery:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Discovery failed: ${errorMessage}`);
      return [];
    } finally {
      setIsDiscovering(false);
    }
  }, [provider, chainId, userAddress, createCompatibleProvider]);

  const verifyAndAddToken = useCallback(async (address: string): Promise<boolean> => {
    if (!provider) {
      setError("No provider available");
      return false;
    }

    try {
      // Create compatible provider
      const compatibleProvider = createCompatibleProvider();
      if (!compatibleProvider) {
        setError("Failed to create compatible provider");
        return false;
      }
      
      // Verify contract has code
      const code = await compatibleProvider.getCode(address);
      if (code === "0x") {
        setError(`No contract found at address ${address}`);
        return false;
      }

      // Add to storage
      const storage = createTokenStorageManager(chainId!);
      const token: Omit<StoredToken, 'addedAt' | 'lastUsed'> = {
        address,
        source: 'discovered',
      };

      storage.addToken(token);
      console.log('[TokenDiscovery] Added token to storage:', address);
      return true;

    } catch (error) {
      console.error('[TokenDiscovery] Error verifying token:', error);
      setError(`Failed to verify token: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }, [provider, chainId, createCompatibleProvider]);

  const addAllDiscoveredTokens = useCallback(async (): Promise<number> => {
    let addedCount = 0;
    const storage = createTokenStorageManager(chainId!);

    for (const result of discoveredTokens) {
      // Skip if already exists
      if (storage.hasToken(result.address)) {
        continue;
      }

      const success = await verifyAndAddToken(result.address);
      if (success) {
        addedCount++;
      }
    }

    return addedCount;
  }, [discoveredTokens, chainId, verifyAndAddToken]);

  const addTokenFromRegistry = useCallback(async (
    owner: string, 
    slug: string
  ): Promise<string | null> => {
    if (!provider || !chainId) {
      setError("Missing provider or chainId");
      return null;
    }

    try {
      // Import Registry ABI and address
      const { CTRegistryAddresses } = await import("@/abi/CTRegistryAddresses");
      
      const registryAddress = CTRegistryAddresses[chainId as keyof typeof CTRegistryAddresses];
      if (!registryAddress) {
        setError(`Registry not deployed on chain ${chainId}`);
        return null;
      }

      // Simple ABI for registry.latest function
      const registryABI = [
        "function latest(address owner, string memory slug) external view returns (address)"
      ];
      
      // Create compatible provider
      const compatibleProvider = createCompatibleProvider();
      if (!compatibleProvider) {
        setError("Failed to create compatible provider");
        return null;
      }
      
      const registry = new ethers.Contract(registryAddress, registryABI, compatibleProvider);
      const tokenAddress = await registry.latest(owner, slug);

      if (!tokenAddress || tokenAddress === ethers.ZeroAddress) {
        setError(`No token found for owner ${owner} and slug ${slug}`);
        return null;
      }

      // Add to storage
      const storage = createTokenStorageManager(chainId);
      const token: Omit<StoredToken, 'addedAt' | 'lastUsed'> = {
        address: tokenAddress,
        owner,
        slug,
        source: 'registry',
      };

      storage.addToken(token);
      console.log('[TokenDiscovery] Added token from registry:', tokenAddress);
      return tokenAddress;

    } catch (error) {
      console.error('[TokenDiscovery] Error adding token from registry:', error);
      setError(`Registry lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }, [provider, chainId, createCompatibleProvider]);

  const addTokenManually = useCallback(async (address: string, label?: string): Promise<boolean> => {
    if (!ethers.isAddress(address)) {
      setError("Invalid token address format");
      return false;
    }

    const success = await verifyAndAddToken(address);
    if (success && label) {
      // Update with label
      const storage = createTokenStorageManager(chainId!);
      const token = storage.getToken(address);
      if (token) {
        storage.addToken({ ...token, label, source: 'manual' });
      }
    }

    return success;
  }, [chainId, verifyAndAddToken]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isDiscovering,
    discoveredTokens,
    error,
    discoverTokens,
    verifyAndAddToken,
    addAllDiscoveredTokens,
    addTokenFromRegistry,
    addTokenManually,
    clearError,
  };
}
