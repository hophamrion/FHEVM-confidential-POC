"use client";
import { useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, AlertCircle, CheckCircle } from "lucide-react";

interface JoinTokenFormProps {
  onTokenAddressSet: (address: string) => Promise<boolean>;
  onOwnerSlugSet: (owner: string, slug: string) => Promise<boolean>;
  isLoading?: boolean;
  currentChainId?: number;
  currentChainName?: string;
}

export function JoinTokenForm({
  onTokenAddressSet,
  onOwnerSlugSet,
  isLoading = false,
  currentChainId,
  currentChainName
}: JoinTokenFormProps) {
  const [tokenAddress, setTokenAddress] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [slug, setSlug] = useState("main");
  const [activeTab, setActiveTab] = useState<"address" | "owner">("address");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

  const handleTokenAddressSubmit = async () => {
    if (!tokenAddress.trim()) {
      setMessage("Please enter a token address");
      setMessageType("error");
      return;
    }

    if (!ethers.isAddress(tokenAddress)) {
      setMessage("Invalid address format");
      setMessageType("error");
      return;
    }

    setMessage("Verifying token address...");
    setMessageType("info");

    const success = await onTokenAddressSet(tokenAddress.trim());
    if (success) {
      setMessage("Token address set successfully!");
      setMessageType("success");
      setTokenAddress("");
    } else {
      setMessage("Failed to set token address. Please check the address and try again.");
      setMessageType("error");
    }
  };

  const handleOwnerSlugSubmit = async () => {
    if (!ownerAddress.trim()) {
      setMessage("Please enter an owner address");
      setMessageType("error");
      return;
    }

    if (!ethers.isAddress(ownerAddress)) {
      setMessage("Invalid owner address format");
      setMessageType("error");
      return;
    }

    if (!slug.trim()) {
      setMessage("Please enter a slug");
      setMessageType("error");
      return;
    }

    setMessage("Looking up token from Registry...");
    setMessageType("info");

    const success = await onOwnerSlugSet(ownerAddress.trim(), slug.trim());
    if (success) {
      setMessage("Token found and set successfully!");
      setMessageType("success");
      setOwnerAddress("");
      setSlug("main");
    } else {
      setMessage("Failed to find token. Please check the owner address and slug.");
      setMessageType("error");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage("Copied to clipboard!");
    setMessageType("success");
    setTimeout(() => setMessage(""), 2000);
  };

  const generateShareLink = () => {
    if (!tokenAddress || !ethers.isAddress(tokenAddress)) return "";
    return `${window.location.origin}${window.location.pathname}?token=${tokenAddress}`;
  };

  const generateOwnerShareLink = () => {
    if (!ownerAddress || !ethers.isAddress(ownerAddress)) return "";
    return `${window.location.origin}${window.location.pathname}?owner=${ownerAddress}&slug=${slug}`;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          Join Existing Token
        </CardTitle>
        <CardDescription>
          Connect to an existing confidential token contract. You can either enter the token address directly 
          or look it up using the owner address and slug from the Registry.
        </CardDescription>
        {currentChainId && (
          <div className="flex items-center gap-2">
            <Badge variant="outline">Chain: {currentChainName || `ID ${currentChainId}`}</Badge>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <Button
            variant={activeTab === "address" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("address")}
            className="flex-1"
          >
            Token Address
          </Button>
          <Button
            variant={activeTab === "owner" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("owner")}
            className="flex-1"
          >
            Owner + Slug
          </Button>
        </div>

        {/* Token Address Tab */}
        {activeTab === "address" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token-address">Token Contract Address</Label>
              <Input
                id="token-address"
                type="text"
                placeholder="0x..."
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Enter the full contract address of the confidential token you want to connect to.
              </p>
            </div>

            <Button 
              onClick={handleTokenAddressSubmit} 
              disabled={isLoading || !tokenAddress.trim()}
              className="w-full"
            >
              {isLoading ? "Verifying..." : "Connect to Token"}
            </Button>

            {/* Share Link */}
            {tokenAddress && ethers.isAddress(tokenAddress) && (
              <div className="space-y-2">
                <Label>Share Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={generateShareLink()}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generateShareLink())}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this link with others to let them connect to the same token.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Owner + Slug Tab */}
        {activeTab === "owner" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="owner-address">Owner Address</Label>
              <Input
                id="owner-address"
                type="text"
                placeholder="0x..."
                value={ownerAddress}
                onChange={(e) => setOwnerAddress(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                The address of the user who deployed the token contract.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Project Slug</Label>
              <Input
                id="slug"
                type="text"
                placeholder="main"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The project identifier used when deploying the token (default: "main").
              </p>
            </div>

            <Button 
              onClick={handleOwnerSlugSubmit} 
              disabled={isLoading || !ownerAddress.trim() || !slug.trim()}
              className="w-full"
            >
              {isLoading ? "Looking up..." : "Lookup Token"}
            </Button>

            {/* Share Link */}
            {ownerAddress && ethers.isAddress(ownerAddress) && slug && (
              <div className="space-y-2">
                <Label>Share Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={generateOwnerShareLink()}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generateOwnerShareLink())}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this link with others to let them connect to the same token.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Message Display */}
        {message && (
          <Alert className={messageType === "error" ? "border-destructive" : messageType === "success" ? "border-green-500" : ""}>
            {messageType === "error" ? (
              <AlertCircle className="h-4 w-4" />
            ) : messageType === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Help Text */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Token Address:</strong> Use this if you have the direct contract address.</p>
          <p><strong>Owner + Slug:</strong> Use this if you know who deployed the token and the project name.</p>
          <p><strong>Share Links:</strong> Copy and share these links to let others connect to the same token.</p>
        </div>
      </CardContent>
    </Card>
  );
}
