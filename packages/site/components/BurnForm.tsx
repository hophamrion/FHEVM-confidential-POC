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
import { useTokenContext } from "@/contexts/TokenContext";
import { parseUnits } from "ethers";
import { 
  Minus, 
  AlertTriangle,
  CheckCircle,
  Info,
  Flame,
  Clock,
  AlertCircle
} from "lucide-react";

export function BurnForm() {
  const [burnAmount, setBurnAmount] = useState("");
  const [isBurning, setIsBurning] = useState(false);
  const [message, setMessage] = useState("");

  const { provider, chainId } = useMetaMask();
  const { ethersSigner } = useMetaMaskEthersSigner();
  const { instance } = useFhevm({ provider, chainId });
  const fhevmDecryptionSignatureStorage = useInMemoryStorage();
  const { tokenAddress } = useTokenContext();
  
  const sameChain = { current: (id: number | undefined) => id === chainId };
  const sameSigner = { current: (signer: any) => signer === ethersSigner };

  const {
    contractAddress,
    isDeployed,
    burnConfidential,
    isMinting: isBurningFromHook,
    message: hookMessage,
    setMessage: setHookMessage,
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

  const handleAmountChange = (value: string) => {
    // Only allow positive numbers with up to 6 decimal places
    const regex = /^\d*\.?\d{0,6}$/;
    if (regex.test(value) || value === "") {
      setBurnAmount(value);
    }
  };

  const handleBurn = () => {
    const amountNum = parseFloat(burnAmount);
    if (amountNum > 0) {
      burnConfidential(amountNum);
    }
  };

  if (!isDeployed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span>Burn Not Available</span>
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
          <Minus className="h-5 w-5" />
          <span>Burn Confidential Tokens</span>
        </CardTitle>
        <CardDescription>
          Permanently destroy confidential tokens to reduce supply.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="burn-amount">Amount to Burn</Label>
          <Input
            id="burn-amount"
            type="text"
            placeholder="0.000000"
            value={burnAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            disabled={isBurning}
          />
          <p className="text-xs text-muted-foreground">
            Enter the amount of tokens to burn (up to 6 decimal places)
          </p>
        </div>

        <Button
          onClick={handleBurn}
          disabled={!burnAmount || parseFloat(burnAmount) <= 0 || isBurningFromHook}
          className="w-full"
          size="lg"
        >
          {isBurningFromHook ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Burning...
            </>
          ) : (
            <>
              <Flame className="h-4 w-4 mr-2" />
              Burn Tokens
            </>
          )}
        </Button>

        {hookMessage && (
          <Alert variant={hookMessage.includes("failed") ? "destructive" : "default"}>
            {hookMessage.includes("failed") ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <AlertDescription>{hookMessage}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

}
