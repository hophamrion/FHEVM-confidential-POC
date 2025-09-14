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
import { parseUnits } from "ethers";
import { 
  Minus, 
  AlertTriangle,
  CheckCircle,
  Info,
  Flame,
  Clock
} from "lucide-react";

export function BurnForm() {
  const [burnAmount, setBurnAmount] = useState("");
  const [isBurning, setIsBurning] = useState(false);
  const [message, setMessage] = useState("");

  const { provider, chainId } = useMetaMask();
  const { ethersSigner } = useMetaMaskEthersSigner();
  const { instance } = useFhevm({ provider, chainId });
  const fhevmDecryptionSignatureStorage = useInMemoryStorage();
  
  const sameChain = { current: (id: number | undefined) => id === chainId };
  const sameSigner = { current: (signer: any) => signer === ethersSigner };

  const {
    contractAddress,
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

  const handleAmountChange = (value: string) => {
    // Only allow positive numbers with up to 6 decimal places
    const regex = /^\d*\.?\d{0,6}$/;
    if (regex.test(value) || value === "") {
      setBurnAmount(value);
    }
  };

  const handleBurn = async () => {
    if (!instance || !ethersSigner || !contractAddress || !burnAmount) {
      return;
    }

    const amountNum = parseFloat(burnAmount);
    if (amountNum <= 0) {
      setMessage("Amount must be greater than 0");
      return;
    }

    setIsBurning(true);
    setMessage("Burning confidential tokens...");

    try {
      const from = await ethersSigner.getAddress();
      const input = instance.createEncryptedInput(contractAddress, from);
      const scaledAmount = parseUnits(burnAmount, 6);
      input.add64(scaledAmount);

      const enc = await input.encrypt();

      const tokenContract = new (await import("ethers")).Contract(
        contractAddress,
        [
          "function burnConfidential(externalEuint64 encAmount, bytes calldata proof) external"
        ],
        ethersSigner
      );

      const tx = await tokenContract.burnConfidential(
        enc.handles[0],
        enc.inputProof
      );

      setMessage(`Burn submitted: ${tx.hash}`);
      const receipt = await tx.wait();
      setMessage(`Tokens burned successfully! Status: ${receipt?.status}`);
      
    } catch (error) {
      setMessage(`Burn failed: ${error}`);
    } finally {
      setIsBurning(false);
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

  // Show coming soon for current contract (doesn't have burn function)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Minus className="h-5 w-5" />
          <span>Burn Confidential Tokens</span>
          <Badge variant="secondary" className="ml-auto">
            <Clock className="h-3 w-3 mr-1" />
            Coming Soon
          </Badge>
        </CardTitle>
        <CardDescription>
          Burn functionality will be available in the extended contract version.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Minus className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Feature Coming Soon</p>
          <p className="text-sm">
            The current contract doesn't include burn functions. 
            Deploy the extended version to use burn features.
          </p>
        </div>
      </CardContent>
    </Card>
  );

}
