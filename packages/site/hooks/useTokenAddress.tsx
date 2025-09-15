"use client";
import { ethers } from "ethers";
import { useEffect, useState, useCallback } from "react";
import { CTRegistryABI } from "@/abi/CTRegistryABI";
import { CTRegistryAddresses } from "@/abi/CTRegistryAddresses";

type TokenResolverParams = {
  provider?: any; // Accept any provider type for compatibility
  chainId?: number;
  // URL parameters
  tokenFromUrl?: string;
  ownerFromUrl?: string;
  slugFromUrl?: string;
  // Current user address (for registry lookup)
  userAddress?: string;
};

export function useTokenAddress(params: TokenResolverParams) {
  const { 
    provider, 
    chainId, 
    tokenFromUrl, 
    ownerFromUrl, 
    slugFromUrl = "main", 
    userAddress 
  } = params;
  
  const [tokenAddress, setTokenAddress] = useState<string | null>(null);
  const [reason, setReason] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Helper to get from localStorage
  const getFromLocalStorage = useCallback((): string | null => {
    if (typeof window === "undefined" || !chainId) return null;
    const key = `ct:lastTokenAddress:${chainId}`;
    return localStorage.getItem(key);
  }, [chainId]);

  // Helper to save to localStorage
  const saveToLocalStorage = useCallback((address: string) => {
    if (typeof window === "undefined" || !chainId) return;
    const key = `ct:lastTokenAddress:${chainId}`;
    localStorage.setItem(key, address);
  }, [chainId]);

  // Helper to create a compatible provider
  const createCompatibleProvider = useCallback(() => {
    if (!provider) return null;
    
    // If provider is already a BrowserProvider, use it directly
    if (provider instanceof ethers.BrowserProvider) {
      return provider;
    }
    
    // Otherwise, wrap it in a BrowserProvider
    try {
      return new ethers.BrowserProvider(provider);
    } catch (error) {
      console.warn("[TokenResolver] Failed to create BrowserProvider, using original:", error);
      return provider;
    }
  }, [provider]);

  // Helper to verify contract exists
  const verifyContract = useCallback(async (address: string): Promise<boolean> => {
    if (!provider || !ethers.isAddress(address)) return false;
    try {
      const compatibleProvider = createCompatibleProvider();
      if (!compatibleProvider) {
        console.warn("[TokenResolver] No compatible provider for verification, assuming valid");
        return true;
      }
      
      // Try to get code, but don't fail if provider doesn't support it
      if (typeof compatibleProvider.getCode === 'function') {
        const code = await compatibleProvider.getCode(address);
        return code !== "0x";
      } else {
        // If provider doesn't support getCode, assume it's valid
        console.warn("[TokenResolver] Provider doesn't support getCode, assuming address is valid");
        return true;
      }
    } catch (error) {
      console.error("[TokenResolver] Error verifying contract:", error);
      // If verification fails, assume it's valid to avoid blocking
      return true;
    }
  }, [provider, createCompatibleProvider]);

  // Main resolver logic
  const resolveTokenAddress = useCallback(async () => {
    if (!provider || !chainId) {
      setReason("No provider or chainId");
      return;
    }

    setIsLoading(true);
    setReason("");

    try {
      let resolvedAddress: string | null = null;
      let resolvedReason = "";

      // 1) URL parameter: ?token=0x...
      if (tokenFromUrl && ethers.isAddress(tokenFromUrl)) {
        console.log("[TokenResolver] Checking URL token:", tokenFromUrl);
        if (await verifyContract(tokenFromUrl)) {
          resolvedAddress = tokenFromUrl;
          resolvedReason = "Resolved from URL token parameter";
          saveToLocalStorage(tokenFromUrl);
        } else {
          resolvedReason = "URL token has no contract code";
        }
      }

      // 2) URL parameters: ?owner=0x...&slug=main (via Registry)
      if (!resolvedAddress && ownerFromUrl && ethers.isAddress(ownerFromUrl)) {
        console.log("[TokenResolver] Checking Registry for owner:", ownerFromUrl, "slug:", slugFromUrl);
        try {
          const registryEntry = CTRegistryAddresses[chainId.toString() as keyof typeof CTRegistryAddresses];
          if (registryEntry && registryEntry.address !== ethers.ZeroAddress) {
            const compatibleProvider = createCompatibleProvider();
            if (!compatibleProvider) {
              resolvedReason = "Provider not compatible";
            } else {
              const registry = new ethers.Contract(
                registryEntry.address,
                CTRegistryABI.abi,
                compatibleProvider
              );
              
              // Use call instead of staticCall to avoid runner issues
              try {
                const latestAddress = await registry.latest(ownerFromUrl, slugFromUrl);
                console.log("[TokenResolver] Registry returned:", latestAddress);
                
                if (await verifyContract(latestAddress)) {
                  resolvedAddress = latestAddress;
                  resolvedReason = `Resolved from Registry: ${ownerFromUrl}/${slugFromUrl}`;
                  saveToLocalStorage(latestAddress);
                } else {
                  resolvedReason = "Registry latest has no contract code";
                }
              } catch (registryError: any) {
                // Handle "No entry" error gracefully
                if (registryError.message?.includes("No entry") || registryError.reason === "No entry") {
                  console.log("[TokenResolver] No token found in Registry for owner:", ownerFromUrl, "slug:", slugFromUrl);
                  resolvedReason = `No token found for owner ${ownerFromUrl} with slug "${slugFromUrl}"`;
                } else {
                  console.error("[TokenResolver] Registry lookup error:", registryError);
                  resolvedReason = "Registry lookup failed";
                }
              }
            }
          } else {
            resolvedReason = "Registry not deployed on this chain";
          }
        } catch (error) {
          console.error("[TokenResolver] Registry lookup failed:", error);
          resolvedReason = "Registry lookup failed";
        }
      }

      // 3) Current user's token from Registry (if userAddress provided)
      if (!resolvedAddress && userAddress && ethers.isAddress(userAddress)) {
        console.log("[TokenResolver] Checking Registry for current user:", userAddress);
        try {
          const registryEntry = CTRegistryAddresses[chainId.toString() as keyof typeof CTRegistryAddresses];
          if (registryEntry && registryEntry.address !== ethers.ZeroAddress) {
            const compatibleProvider = createCompatibleProvider();
            if (!compatibleProvider) {
              console.warn("[TokenResolver] Provider not compatible for user lookup");
            } else {
              const registry = new ethers.Contract(
                registryEntry.address,
                CTRegistryABI.abi,
                compatibleProvider
              );
              
              // Use call instead of staticCall to avoid runner issues
              try {
                const latestAddress = await registry.latest(userAddress, slugFromUrl);
                console.log("[TokenResolver] User's Registry returned:", latestAddress);
                
                if (await verifyContract(latestAddress)) {
                  resolvedAddress = latestAddress;
                  resolvedReason = `Resolved from user's Registry: ${userAddress}/${slugFromUrl}`;
                  saveToLocalStorage(latestAddress);
                }
              } catch (registryError: any) {
                // Handle "No entry" error gracefully
                if (registryError.message?.includes("No entry") || registryError.reason === "No entry") {
                  console.log("[TokenResolver] No token found in Registry for user:", userAddress, "slug:", slugFromUrl);
                  // This is normal - user hasn't deployed a token yet
                } else {
                  console.error("[TokenResolver] Registry lookup error:", registryError);
                }
              }
            }
          }
        } catch (error) {
          console.error("[TokenResolver] User Registry lookup failed:", error);
        }
      }

      // 4) localStorage (last used token)
      if (!resolvedAddress) {
        const fromLocal = getFromLocalStorage();
        if (fromLocal && ethers.isAddress(fromLocal)) {
          console.log("[TokenResolver] Checking localStorage:", fromLocal);
          if (await verifyContract(fromLocal)) {
            resolvedAddress = fromLocal;
            resolvedReason = "Resolved from localStorage";
          }
        }
      }

      // 5) No token found
      if (!resolvedAddress) {
        resolvedAddress = null;
        resolvedReason = "No token address found. Please enter manually or check URL parameters.";
      }

      // Set final state
      setTokenAddress(resolvedAddress);
      setReason(resolvedReason);

    } catch (error) {
      console.error("[TokenResolver] Error during resolution:", error);
      setTokenAddress(null);
      setReason(`Resolution error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [
    provider, 
    chainId, 
    tokenFromUrl, 
    ownerFromUrl, 
    slugFromUrl, 
    userAddress, 
    verifyContract, 
    saveToLocalStorage, 
    getFromLocalStorage,
    createCompatibleProvider
  ]);

  // Auto-resolve when dependencies change
  useEffect(() => {
    resolveTokenAddress();
  }, [resolveTokenAddress]);

  // Manual set function
  const setManually = useCallback(async (address: string): Promise<boolean> => {
    if (!ethers.isAddress(address)) {
      setReason("Invalid address format");
      return false;
    }

    if (!(await verifyContract(address))) {
      setReason("Address has no contract code");
      return false;
    }

    setTokenAddress(address);
    saveToLocalStorage(address);
    setReason("Manually set token address");
    return true;
  }, [verifyContract, saveToLocalStorage]);

  // Clear function
  const clearTokenAddress = useCallback(() => {
    setTokenAddress(null);
    setReason("");
    if (typeof window !== "undefined" && chainId) {
      const key = `ct:lastTokenAddress:${chainId}`;
      localStorage.removeItem(key);
    }
  }, [chainId]);

  return {
    tokenAddress,
    reason,
    isLoading,
    setManually,
    clearTokenAddress,
    refresh: resolveTokenAddress
  };
}
