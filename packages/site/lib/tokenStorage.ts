"use client";

import { ethers } from "ethers";

export interface StoredToken {
  address: string;
  label?: string;
  owner?: string;
  slug?: string;
  source: 'manual' | 'registry' | 'discovered' | 'url';
  addedAt: number;
  lastUsed?: number;
}

export interface TokenStorage {
  tokens: StoredToken[];
  activeToken: string | null;
}

const STORAGE_KEYS = {
  tokens: (chainId: number) => `ct:tokens:${chainId}`,
  active: (chainId: number) => `ct:active:${chainId}`,
} as const;

export class TokenStorageManager {
  private chainId: number;

  constructor(chainId: number) {
    this.chainId = chainId;
  }

  // Get all stored tokens for current chain
  getTokens(): StoredToken[] {
    try {
      const key = STORAGE_KEYS.tokens(this.chainId);
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[TokenStorage] Error reading tokens:', error);
      return [];
    }
  }

  // Get active token address
  getActiveToken(): string | null {
    try {
      const key = STORAGE_KEYS.active(this.chainId);
      return localStorage.getItem(key);
    } catch (error) {
      console.error('[TokenStorage] Error reading active token:', error);
      return null;
    }
  }

  // Set active token
  setActiveToken(address: string): void {
    try {
      const key = STORAGE_KEYS.active(this.chainId);
      localStorage.setItem(key, address);
      
      // Update lastUsed timestamp
      this.updateTokenLastUsed(address);
    } catch (error) {
      console.error('[TokenStorage] Error setting active token:', error);
    }
  }

  // Add new token
  addToken(token: Omit<StoredToken, 'addedAt' | 'lastUsed'>): void {
    try {
      const tokens = this.getTokens();
      const existingIndex = tokens.findIndex(t => 
        t.address.toLowerCase() === token.address.toLowerCase()
      );

      const newToken: StoredToken = {
        ...token,
        addedAt: Date.now(),
        lastUsed: Date.now(),
      };

      if (existingIndex >= 0) {
        // Update existing token
        tokens[existingIndex] = { ...tokens[existingIndex], ...newToken };
      } else {
        // Add new token
        tokens.push(newToken);
      }

      const key = STORAGE_KEYS.tokens(this.chainId);
      localStorage.setItem(key, JSON.stringify(tokens));
    } catch (error) {
      console.error('[TokenStorage] Error adding token:', error);
    }
  }

  // Remove token
  removeToken(address: string): void {
    try {
      const tokens = this.getTokens();
      const filtered = tokens.filter(t => 
        t.address.toLowerCase() !== address.toLowerCase()
      );
      
      const key = STORAGE_KEYS.tokens(this.chainId);
      localStorage.setItem(key, JSON.stringify(filtered));

      // If removing active token, clear active
      const active = this.getActiveToken();
      if (active && active.toLowerCase() === address.toLowerCase()) {
        this.clearActiveToken();
      }
    } catch (error) {
      console.error('[TokenStorage] Error removing token:', error);
    }
  }

  // Update token last used timestamp
  updateTokenLastUsed(address: string): void {
    try {
      const tokens = this.getTokens();
      const token = tokens.find(t => 
        t.address.toLowerCase() === address.toLowerCase()
      );
      
      if (token) {
        token.lastUsed = Date.now();
        const key = STORAGE_KEYS.tokens(this.chainId);
        localStorage.setItem(key, JSON.stringify(tokens));
      }
    } catch (error) {
      console.error('[TokenStorage] Error updating last used:', error);
    }
  }

  // Clear active token
  clearActiveToken(): void {
    try {
      const key = STORAGE_KEYS.active(this.chainId);
      localStorage.removeItem(key);
    } catch (error) {
      console.error('[TokenStorage] Error clearing active token:', error);
    }
  }

  // Get token by address
  getToken(address: string): StoredToken | undefined {
    const tokens = this.getTokens();
    return tokens.find(t => 
      t.address.toLowerCase() === address.toLowerCase()
    );
  }

  // Check if token exists
  hasToken(address: string): boolean {
    return this.getToken(address) !== undefined;
  }

  // Get tokens sorted by last used (most recent first)
  getTokensSorted(): StoredToken[] {
    const tokens = this.getTokens();
    return tokens.sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0));
  }

  // Clear all tokens for current chain
  clearAllTokens(): void {
    try {
      const key = STORAGE_KEYS.tokens(this.chainId);
      localStorage.removeItem(key);
      this.clearActiveToken();
    } catch (error) {
      console.error('[TokenStorage] Error clearing all tokens:', error);
    }
  }

  // Export tokens for backup
  exportTokens(): string {
    const tokens = this.getTokens();
    return JSON.stringify(tokens, null, 2);
  }

  // Import tokens from backup
  importTokens(jsonData: string): boolean {
    try {
      const tokens: StoredToken[] = JSON.parse(jsonData);
      if (!Array.isArray(tokens)) {
        throw new Error('Invalid token data format');
      }

      // Validate token structure
      for (const token of tokens) {
        if (!token.address || !ethers.isAddress(token.address)) {
          throw new Error(`Invalid token address: ${token.address}`);
        }
        if (!token.source || !['manual', 'registry', 'discovered', 'url'].includes(token.source)) {
          throw new Error(`Invalid token source: ${token.source}`);
        }
      }

      const key = STORAGE_KEYS.tokens(this.chainId);
      localStorage.setItem(key, JSON.stringify(tokens));
      return true;
    } catch (error) {
      console.error('[TokenStorage] Error importing tokens:', error);
      return false;
    }
  }
}

// Utility functions
export function createTokenStorageManager(chainId: number): TokenStorageManager {
  return new TokenStorageManager(chainId);
}

export function isValidTokenAddress(address: string): boolean {
  return ethers.isAddress(address);
}

export function formatTokenLabel(token: StoredToken): string {
  if (token.label) {
    return token.label;
  }
  
  if (token.owner && token.slug) {
    return `${token.slug} (${token.owner.slice(0, 6)}...)`;
  }
  
  return `${token.address.slice(0, 6)}...${token.address.slice(-4)}`;
}
