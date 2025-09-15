"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useConfidentialToken } from "@/hooks/useConfidentialToken";
import { useFhevm } from "@/fhevm/useFhevm";
import { useMetaMask } from "@/hooks/metamask/useMetaMaskProvider";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useTokenContext } from "@/contexts/TokenContext";
import { parseUnits, isAddress } from "ethers";
import { 
  Plus, 
  Lock, 
  AlertCircle,
  CheckCircle,
  Info,
  Crown
} from "lucide-react";

export function MintForm() {
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isValidAddress, setIsValidAddress] = useState(true);

  const { provider, chainId } = useMetaMask();
  const { ethersSigner } = useMetaMaskEthersSigner();
  const { instance, status: fhevmStatus } = useFhevm({ provider, chainId });
  const fhevmDecryptionSignatureStorage = useInMemoryStorage();
  const { tokenAddress } = useTokenContext();
  
  const sameChain = { current: (id: number | undefined) => id === chainId };
  const sameSigner = { current: (signer: any) => signer === ethersSigner };

  const {
    contractAddress,
    canMint,
    mintConfidential,
    mintConfidentialFallback,
    isMinting,
    message,
    isDeployed,
    isOwner,
    contractOwner,
  } = useConfidentialToken({
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

  const handleAddressChange = (value: string) => {
    setToAddress(value);
    if (value) {
      setIsValidAddress(isAddress(value));
    } else {
      setIsValidAddress(true);
    }
  };

  const handleAmountChange = (value: string) => {
    // Only allow positive numbers with up to 6 decimal places
    const regex = /^\d*\.?\d{0,6}$/;
    if (regex.test(value) || value === "") {
      setAmount(value);
    }
  };

  const handleMint = () => {
    const amountNum = parseFloat(amount);
    if (amountNum > 0 && isValidAddress && toAddress && ethersSigner && fhevmStatus === "ready") {
      console.log("[MintForm] Calling mintConfidential");
      mintConfidential(toAddress, amountNum);
    } else {
      console.log("[MintForm] Cannot mint:", { amountNum, isValidAddress, toAddress, ethersSigner: !!ethersSigner, fhevmStatus });
    }
  };


  const handleMintToSelf = () => {
    if (ethersSigner?.address) {
      setToAddress(ethersSigner.address);
      setIsValidAddress(true);
    }
  };

  const isFormValid = 
    toAddress && 
    amount && 
    parseFloat(amount) > 0 && 
    isValidAddress && 
    canMint && 
    isOwner;

  // Debug log
  console.log("[MintForm] Form validation:", {
    toAddress: !!toAddress,
    amount: !!amount,
    amountValid: parseFloat(amount) > 0,
    isValidAddress,
    canMint,
    isOwner,
    fhevmStatus,
    isFormValid
  });


  // Only show FHEVM loading for actual mint operations, not for owner check
  if (fhevmStatus !== "ready" && isOwner) {
    const getStatusMessage = () => {
      switch (fhevmStatus) {
        case "loading": return "Loading cryptographic parameters...";
        case "idle": return "Setting up FHEVM instance...";
        case "error": return "Failed to initialize. Please refresh the page.";
        default: return "Initializing confidential token environment...";
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-muted-foreground animate-pulse" />
            <span>Initializing...</span>
          </CardTitle>
          <CardDescription>
            {getStatusMessage()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>Setting up FHEVM (Fully Homomorphic Encryption Virtual Machine)...</p>
                <div className="text-sm text-muted-foreground">
                  <p>• Loading cryptographic libraries</p>
                  <p>• Connecting to FHEVM coprocessor</p>
                  <p>• Initializing encryption context</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  FHEVM is only needed for actual minting operations. Owner check is already complete.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!isDeployed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span>Mint Not Available</span>
          </CardTitle>
          <CardDescription>
            Contract is not deployed on this network.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!isOwner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-muted-foreground" />
            <span>Owner Only</span>
          </CardTitle>
          <CardDescription>
            Only the contract owner can mint new tokens.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need to be the contract owner to mint tokens. Connect with the owner wallet.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Mint Confidential Tokens</span>
          <Badge variant="default" className="ml-auto">
            <Crown className="h-3 w-3 mr-1" />
            Owner
          </Badge>
        </CardTitle>
        <CardDescription>
          Create new confidential tokens. Only the contract owner can mint.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Privacy Notice */}
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Minted tokens are encrypted and private. Only the recipient can decrypt their balance.
          </AlertDescription>
        </Alert>

        {/* Form */}
        <div className="space-y-4">
          {/* Recipient Address */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="mint-to-address">Recipient Address</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMintToSelf}
                className="text-xs"
              >
                Mint to myself
              </Button>
            </div>
            <Input
              id="mint-to-address"
              type="text"
              placeholder="0x..."
              value={toAddress}
              onChange={(e) => handleAddressChange(e.target.value)}
              className={!isValidAddress ? "border-destructive" : ""}
            />
            {!isValidAddress && toAddress && (
              <p className="text-sm text-destructive">Invalid Ethereum address</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="mint-amount">Amount (CT)</Label>
            <Input
              id="mint-amount"
              type="text"
              placeholder="100.000000"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              step="0.000001"
            />
            <p className="text-xs text-muted-foreground">
              Enter amount in CT tokens (6 decimal places)
            </p>
          </div>

          {/* Mint Button */}
          <Button
            onClick={handleMint}
            disabled={!isFormValid || isMinting}
            className="w-full"
            size="lg"
          >
            {isMinting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Minting...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Mint Confidential Tokens
              </>
            )}
          </Button>

        </div>

        {/* Status Messages */}
        {message && (
          <Alert variant={message.includes("failed") ? "destructive" : "default"}>
            {message.includes("failed") ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Info Panel */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Minting Process</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Amount is encrypted before being sent to the contract</li>
            <li>• New tokens are added to the recipient's encrypted balance</li>
            <li>• Only the recipient can decrypt and view their balance</li>
            <li>• No supply cap - tokens can be minted infinitely</li>
          </ul>
        </div>

        {/* Dev Info (Collapsible) */}
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            Developer Info
          </summary>
          <div className="mt-2 space-y-1 font-mono bg-muted p-2 rounded">
            <div>Contract: {contractAddress}</div>
            <div>Chain ID: {chainId}</div>
            <div>Owner: {ethersSigner?.address}</div>
            <div>To: {toAddress}</div>
            <div>Amount: {amount ? parseUnits(amount, 6).toString() : "0"}</div>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
