"use client";

import { useState } from "react";
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
import { parseUnits, isAddress } from "ethers";
import { 
  Send, 
  Lock, 
  AlertCircle,
  CheckCircle,
  Info
} from "lucide-react";

export function TransferForm() {
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isValidAddress, setIsValidAddress] = useState(true);

  const { provider, chainId } = useMetaMask();
  const { ethersSigner } = useMetaMaskEthersSigner();
  const { instance } = useFhevm({ provider, chainId });
  const fhevmDecryptionSignatureStorage = useInMemoryStorage();
  
  const sameChain = { current: (id: number | undefined) => id === chainId };
  const sameSigner = { current: (signer: any) => signer === ethersSigner };

  const {
    contractAddress,
    canTransfer,
    transferConfidential,
    isTransferring,
    message,
    isDeployed,
  } = useConfidentialToken({
    instance,
    fhevmDecryptionSignatureStorage: fhevmDecryptionSignatureStorage as any,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider: ethersSigner,
    sameChain,
    sameSigner,
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

  const handleTransfer = () => {
    const amountNum = parseFloat(amount);
    if (amountNum > 0 && isValidAddress && toAddress && ethersSigner) {
      transferConfidential(toAddress, amountNum);
    }
  };

  const isFormValid = 
    toAddress && 
    amount && 
    parseFloat(amount) > 0 && 
    isValidAddress && 
    canTransfer;

  if (!isDeployed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span>Transfer Not Available</span>
          </CardTitle>
          <CardDescription>
            Contract is not deployed on this network.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Send className="h-5 w-5" />
          <span>Send Confidential Tokens</span>
        </CardTitle>
        <CardDescription>
          Transfer tokens privately. The amount is encrypted and never revealed on-chain.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Privacy Notice */}
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            This transfer is confidential. Amount is never revealed on-chain.
          </AlertDescription>
        </Alert>

        {/* Form */}
        <div className="space-y-4">
          {/* Recipient Address */}
          <div className="space-y-2">
            <Label htmlFor="to-address">Recipient Address</Label>
            <Input
              id="to-address"
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
            <Label htmlFor="amount">Amount (CT)</Label>
            <Input
              id="amount"
              type="text"
              placeholder="0.000000"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              step="0.000001"
            />
            <p className="text-xs text-muted-foreground">
              Enter amount in CT tokens (6 decimal places)
            </p>
          </div>

          {/* Transfer Button */}
          <Button
            onClick={handleTransfer}
            disabled={!isFormValid || isTransferring}
            className="w-full"
            size="lg"
          >
            {isTransferring ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Transferring...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Confidential Transfer
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
            <span className="text-sm font-medium">How it works</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Amount is encrypted before sending to the contract</li>
            <li>• Only the recipient can decrypt their new balance</li>
            <li>• Transfer uses clamp logic to prevent underflow</li>
            <li>• Transaction is private and untraceable</li>
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
            <div>From: {ethersSigner?.address}</div>
            <div>To: {toAddress}</div>
            <div>Amount: {amount ? parseUnits(amount, 6).toString() : "0"}</div>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
