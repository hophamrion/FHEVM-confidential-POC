"use client";

import { useState, useEffect } from "react";
import { BalanceCard } from "@/components/BalanceCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useConfidentialToken } from "@/hooks/useConfidentialToken";
import { useTokenContext } from "@/contexts/TokenContext";
import { useFhevm } from "@/fhevm/useFhevm";
import { useMetaMask } from "@/hooks/metamask/useMetaMaskProvider";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { JoinTokenForm } from "@/components/JoinTokenForm";
import { 
  Activity, 
  TrendingUp, 
  Shield, 
  Lock,
  Info,
  Plus
} from "lucide-react";

export default function OverviewPage() {
  const { provider, chainId } = useMetaMask();
  const { ethersSigner } = useMetaMaskEthersSigner();
  const { instance } = useFhevm({ provider, chainId });
  const fhevmDecryptionSignatureStorage = useInMemoryStorage();
  
  const sameChain = { current: (id: number | undefined) => id === chainId };
  const sameSigner = { current: (signer: any) => signer === ethersSigner };

  // Use global token context
  const { 
    tokenAddress, 
    reason, 
    isLoading: isResolving, 
    setManually 
  } = useTokenContext();

  const { contractAddress, isDeployed } = useConfidentialToken({
    instance,
    fhevmDecryptionSignatureStorage: fhevmDecryptionSignatureStorage as any,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider: ethersSigner,
    sameChain,
    sameSigner,
    overrideTokenAddress: tokenAddress || undefined,
  });

  // Check if current user is owner
  const isOwner = ethersSigner?.address === "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          Your confidential token dashboard and activity overview.
        </p>
      </div>

      {/* Token Resolution Status */}
      {isResolving && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">Resolving token address...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Join Token Form - Show when no token address found */}
      {!isResolving && !tokenAddress && (
        <JoinTokenForm
          onTokenAddressSet={setManually}
          onOwnerSlugSet={async (owner, slug) => {
            // This will be handled by the URL params in the next render
            const url = new URL(window.location.href);
            url.searchParams.set("owner", owner);
            url.searchParams.set("slug", slug);
            window.history.replaceState({}, "", url.toString());
            return true;
          }}
          isLoading={isResolving}
          currentChainId={chainId}
          currentChainName={chainId ? `Chain ${chainId}` : undefined}
        />
      )}

      {/* Token Resolution Info */}
      {!isResolving && tokenAddress && reason && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">{reason}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Token: {tokenAddress.slice(0, 6)}...{tokenAddress.slice(-4)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Balance Card - Only show when token is resolved */}
      {tokenAddress && <BalanceCard overrideTokenAddress={tokenAddress} />}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contract Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contract Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={isDeployed ? "default" : "destructive"}>
                {isDeployed ? "Deployed" : "Not Deployed"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {contractAddress ? `Deployed at ${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}` : "No contract address"}
            </p>
          </CardContent>
        </Card>

        {/* User Role */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={isOwner ? "default" : "secondary"}>
                {isOwner ? "Owner" : "User"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {isOwner ? "Can mint new tokens" : "Can send and receive tokens"}
            </p>
          </CardContent>
        </Card>

        {/* Privacy Level */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Privacy Level</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant="default">Maximum</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              All amounts encrypted with FHE
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Token Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5" />
            <span>Token Information</span>
          </CardTitle>
          <CardDescription>
            Details about the Confidential Token contract.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-xs text-muted-foreground">Token Name</label>
              <p className="font-medium">ConfidentialToken</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Symbol</label>
              <p className="font-medium">CT</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Decimals</label>
              <p className="font-medium">6</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Standard</label>
              <p className="font-medium">ERC-7984</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Network</label>
              <p className="font-medium">
                {chainId === 1 ? "Ethereum Mainnet" : 
                 chainId === 11155111 ? "Sepolia Testnet" : 
                 chainId === 31337 ? "Hardhat Local" : 
                 `Chain ${chainId}`}
              </p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Encryption</label>
              <p className="font-medium">FHEVM (euint64)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
          <CardDescription>
            Your recent confidential token transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm">Start by minting or transferring tokens</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
