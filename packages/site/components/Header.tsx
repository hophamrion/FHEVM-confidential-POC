"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMetaMask } from "@/hooks/metamask/useMetaMaskProvider";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useConfidentialToken } from "@/hooks/useConfidentialToken";
import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { Copy, ExternalLink, Wallet } from "lucide-react";

export function Header() {
  const { provider, chainId, connect, isConnected } = useMetaMask();
  const { ethersSigner } = useMetaMaskEthersSigner();
  const { instance } = useFhevm({ provider, chainId });
  const fhevmDecryptionSignatureStorage = useInMemoryStorage();
  
  const sameChain = { current: (id: number | undefined) => id === chainId };
  const sameSigner = { current: (signer: any) => signer === ethersSigner };

  const { contractAddress, isDeployed } = useConfidentialToken({
    instance,
    fhevmDecryptionSignatureStorage: fhevmDecryptionSignatureStorage as any,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider: ethersSigner,
    sameChain,
    sameSigner,
  });

  const getNetworkName = (chainId: number | undefined) => {
    switch (chainId) {
      case 1: return "Ethereum";
      case 11155111: return "Sepolia";
      case 31337: return "Hardhat";
      default: return `Chain ${chainId}`;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CT</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">Confidential Token</h1>
              <p className="text-xs text-muted-foreground">ERC-7984 Demo</p>
            </div>
          </div>
        </div>

        {/* Network & Contract Info */}
        <div className="flex items-center space-x-4">
          {/* Network Badge */}
          <Badge variant="outline" className="flex items-center space-x-1">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span>{getNetworkName(chainId)}</span>
          </Badge>

          {/* Contract Info Popover */}
          {contractAddress && isDeployed && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Contract
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm">Contract Address</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1">
                        {contractAddress}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(contractAddress)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Network</h4>
                    <p className="text-sm text-muted-foreground">
                      {getNetworkName(chainId)} (Chain ID: {chainId})
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Status</h4>
                    <Badge variant="default" className="text-xs">
                      Deployed
                    </Badge>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Wallet Connect */}
          {!isConnected ? (
            <Button onClick={connect} className="flex items-center space-x-2">
              <Wallet className="h-4 w-4" />
              <span>Connect Wallet</span>
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>Connected</span>
              </Badge>
              <div className="text-sm text-muted-foreground">
                {ethersSigner?.address?.slice(0, 6)}...{ethersSigner?.address?.slice(-4)}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
