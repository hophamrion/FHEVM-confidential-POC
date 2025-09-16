"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { 
  ChevronDown, 
  Plus, 
  Search, 
  Copy, 
  ExternalLink, 
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { createTokenStorageManager, formatTokenLabel, StoredToken } from "@/lib/tokenStorage";
import { useTokenDiscovery } from "@/hooks/useTokenDiscovery";
import { useMetaMask } from "@/hooks/metamask/useMetaMaskProvider";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";

interface TokenSwitcherProps {
  chainId: number | undefined;
  activeToken: string | null;
  onTokenSelect: (address: string) => void;
  onTokenAdd: (token: Omit<StoredToken, 'addedAt' | 'lastUsed'>) => void;
}

export function TokenSwitcher({ 
  chainId, 
  activeToken, 
  onTokenSelect, 
  onTokenAdd 
}: TokenSwitcherProps) {
  const [tokens, setTokens] = useState<StoredToken[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRegistryDialog, setShowRegistryDialog] = useState(false);
  const [showDiscoveryDialog, setShowDiscoveryDialog] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [manualLabel, setManualLabel] = useState("");
  const [registryOwner, setRegistryOwner] = useState("");
  const [registrySlug, setRegistrySlug] = useState("");
  const { toast } = useToast();
  const { provider } = useMetaMask();
  const { ethersSigner } = useMetaMaskEthersSigner();

  const {
    isDiscovering,
    discoveredTokens,
    error: discoveryError,
    discoverTokens,
    addAllDiscoveredTokens,
    addTokenFromRegistry,
    addTokenManually,
    clearError: clearDiscoveryError,
  } = useTokenDiscovery({
    provider: provider as any,
    chainId,
    userAddress: ethersSigner?.address,
  });

  // Load tokens from storage
  useEffect(() => {
    if (chainId) {
      const storage = createTokenStorageManager(chainId);
      const storedTokens = storage.getTokensSorted();
      setTokens(storedTokens);
    }
  }, [chainId, activeToken]);

  const handleTokenSelect = (address: string) => {
    onTokenSelect(address);
    setIsOpen(false);
    
    // Update last used
    if (chainId) {
      const storage = createTokenStorageManager(chainId);
      storage.updateTokenLastUsed(address);
    }
  };

  const handleAddManual = async () => {
    if (!manualAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter a token address",
        variant: "destructive",
      });
      return;
    }

    const success = await addTokenManually(manualAddress.trim(), manualLabel.trim() || undefined);
    if (success) {
      // Add to context
      onTokenAdd({
        address: manualAddress.trim(),
        label: manualLabel.trim() || undefined,
        source: 'manual',
      });
      
      toast({
        title: "Success",
        description: "Token added successfully",
      });
      setShowAddDialog(false);
      setManualAddress("");
      setManualLabel("");
    }
  };

  const handleAddFromRegistry = async () => {
    if (!registryOwner.trim() || !registrySlug.trim()) {
      toast({
        title: "Error",
        description: "Please enter both owner and slug",
        variant: "destructive",
      });
      return;
    }

    const tokenAddress = await addTokenFromRegistry(registryOwner.trim(), registrySlug.trim());
    if (tokenAddress) {
      // Add to context
      onTokenAdd({
        address: tokenAddress,
        owner: registryOwner.trim(),
        slug: registrySlug.trim(),
        source: 'registry',
      });
      
      toast({
        title: "Success",
        description: `Token added: ${tokenAddress}`,
      });
      setShowRegistryDialog(false);
      setRegistryOwner("");
      setRegistrySlug("");
    }
  };

  const handleDiscoverTokens = async () => {
    clearDiscoveryError();
    await discoverTokens();
  };

  const handleAddAllDiscovered = async () => {
    const addedCount = await addAllDiscoveredTokens();
    if (addedCount > 0) {
      // Add discovered tokens to context
      for (const result of discoveredTokens) {
        onTokenAdd({
          address: result.address,
          source: 'discovered',
        });
      }
      
      toast({
        title: "Success",
        description: `Added ${addedCount} new tokens`,
      });
      setShowDiscoveryDialog(false);
    } else {
      toast({
        title: "Info",
        description: "No new tokens to add",
      });
    }
  };

  const handleRemoveToken = (address: string) => {
    if (chainId) {
      const storage = createTokenStorageManager(chainId);
      storage.removeToken(address);
      setTokens(storage.getTokensSorted());
      toast({
        title: "Token Removed",
        description: "Token has been removed from your list",
      });
    }
  };

  const handleCopyTokenAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Copied",
      description: "Token address copied to clipboard",
    });
  };

  const handleShareToken = (address: string) => {
    const url = `${window.location.origin}${window.location.pathname}?token=${address}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Share link copied to clipboard",
    });
  };

  const activeTokenData = tokens.find(t => t.address.toLowerCase() === activeToken?.toLowerCase());

  if (!chainId) {
    return (
      <Badge variant="outline" className="text-xs">
        No Network
      </Badge>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Active Token Display */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 min-w-[200px] justify-between">
            <div className="flex items-center space-x-2">
              {activeTokenData ? (
                <>
                  <Badge variant="secondary" className="text-xs">
                    {activeTokenData.source}
                  </Badge>
                  <span className="text-sm font-medium">
                    {formatTokenLabel(activeTokenData)}
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Select Token</span>
              )}
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Your Tokens</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {tokens.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No tokens found. Add one to get started.
            </div>
          ) : (
            tokens.map((token) => (
              <DropdownMenuItem
                key={token.address}
                onClick={() => handleTokenSelect(token.address)}
                className="flex items-center justify-between p-3"
              >
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {token.source}
                    </Badge>
                    <span className="text-sm font-medium">
                      {formatTokenLabel(token)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {token.address.slice(0, 10)}...{token.address.slice(-8)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyTokenAddress(token.address);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareToken(token.address);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => e.stopPropagation()}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Token</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove this token from your list? 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoveToken(token.address)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </DropdownMenuItem>
            ))
          )}
          
          <DropdownMenuSeparator />
          
          {/* Add Token Options */}
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Token Address
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Token</DialogTitle>
                <DialogDescription>
                  Enter a token contract address to add it to your list.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Token Address</Label>
                  <Input
                    id="address"
                    placeholder="0x..."
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="label">Label (Optional)</Label>
                  <Input
                    id="label"
                    placeholder="My Token"
                    value={manualLabel}
                    onChange={(e) => setManualLabel(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddManual}>
                  Add Token
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showRegistryDialog} onOpenChange={setShowRegistryDialog}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Search className="h-4 w-4 mr-2" />
                Add from Registry
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add from Registry</DialogTitle>
                <DialogDescription>
                  Enter owner and slug to find a token in the registry.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="owner">Owner Address</Label>
                  <Input
                    id="owner"
                    placeholder="0x..."
                    value={registryOwner}
                    onChange={(e) => setRegistryOwner(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    placeholder="main"
                    value={registrySlug}
                    onChange={(e) => setRegistrySlug(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRegistryDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddFromRegistry}>
                  Add Token
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showDiscoveryDialog} onOpenChange={setShowDiscoveryDialog}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Discover My Tokens
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Discover Tokens</DialogTitle>
                <DialogDescription>
                  Scan recent transactions to find tokens sent to your address.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {discoveryError && (
                  <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">{discoveryError}</span>
                  </div>
                )}
                
                {discoveredTokens.length > 0 && (
                  <div className="space-y-2">
                    <Label>Discovered Tokens ({discoveredTokens.length})</Label>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {discoveredTokens.map((token, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                          <span className="font-mono text-xs">
                            {token.address.slice(0, 10)}...{token.address.slice(-8)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            Block {token.blockNumber}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="flex-col space-y-2">
                <Button 
                  onClick={handleDiscoverTokens} 
                  disabled={isDiscovering}
                  className="w-full"
                >
                  {isDiscovering ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Discovering...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Scan for Tokens
                    </>
                  )}
                </Button>
                
                {discoveredTokens.length > 0 && (
                  <Button 
                    onClick={handleAddAllDiscovered}
                    variant="outline"
                    className="w-full"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Add All ({discoveredTokens.length})
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
