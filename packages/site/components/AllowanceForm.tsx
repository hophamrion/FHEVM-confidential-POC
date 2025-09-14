"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConfidentialToken } from "@/hooks/useConfidentialToken";
import { useFhevm } from "@/fhevm/useFhevm";
import { useMetaMask } from "@/hooks/metamask/useMetaMaskProvider";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { parseUnits, isAddress } from "ethers";
import { 
  Shield, 
  ArrowRightLeft, 
  AlertCircle,
  CheckCircle,
  Info,
  Lock,
  Clock
} from "lucide-react";

export function AllowanceForm() {
  const [approveSpender, setApproveSpender] = useState("");
  const [approveAmount, setApproveAmount] = useState("");
  const [transferFromFrom, setTransferFromFrom] = useState("");
  const [transferFromTo, setTransferFromTo] = useState("");
  const [transferFromAmount, setTransferFromAmount] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
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

  const handleApprove = async () => {
    if (!instance || !ethersSigner || !contractAddress || !approveSpender || !approveAmount) {
      return;
    }

    const amountNum = parseFloat(approveAmount);
    if (amountNum <= 0 || !isAddress(approveSpender)) {
      setMessage("Invalid spender address or amount");
      return;
    }

    setIsApproving(true);
    setMessage("Approving confidential allowance...");

    try {
      const from = await ethersSigner.getAddress();
      const input = instance.createEncryptedInput(contractAddress, from);
      const scaledAmount = parseUnits(approveAmount, 6);
      input.add64(scaledAmount);

      const enc = await input.encrypt();

      const tokenContract = new (await import("ethers")).Contract(
        contractAddress,
        [
          "function transferConfidential(address to, externalEuint64 encAmount, bytes calldata proof) external"
        ],
        ethersSigner
      );

      const tx = await tokenContract.approveConfidential(
        approveSpender,
        enc.handles[0],
        enc.inputProof
      );

      setMessage(`Approval submitted: ${tx.hash}`);
      const receipt = await tx.wait();
      setMessage(`Allowance approved! Status: ${receipt?.status}`);
      
    } catch (error) {
      setMessage(`Approval failed: ${error}`);
    } finally {
      setIsApproving(false);
    }
  };

  const handleTransferFrom = async () => {
    if (!instance || !ethersSigner || !contractAddress || !transferFromFrom || !transferFromTo || !transferFromAmount) {
      return;
    }

    const amountNum = parseFloat(transferFromAmount);
    if (amountNum <= 0 || !isAddress(transferFromFrom) || !isAddress(transferFromTo)) {
      setMessage("Invalid addresses or amount");
      return;
    }

    setIsTransferring(true);
    setMessage("Transferring from allowance...");

    try {
      const from = await ethersSigner.getAddress();
      const input = instance.createEncryptedInput(contractAddress, from);
      const scaledAmount = parseUnits(transferFromAmount, 6);
      input.add64(scaledAmount);

      const enc = await input.encrypt();

      const tokenContract = new (await import("ethers")).Contract(
        contractAddress,
        [
          "function transferFromConfidential(address from, address to, externalEuint64 encAmount, bytes calldata proof) external"
        ],
        ethersSigner
      );

      const tx = await tokenContract.transferFromConfidential(
        transferFromFrom,
        transferFromTo,
        enc.handles[0],
        enc.inputProof
      );

      setMessage(`Transfer submitted: ${tx.hash}`);
      const receipt = await tx.wait();
      setMessage(`Transfer completed! Status: ${receipt?.status}`);
      
    } catch (error) {
      setMessage(`Transfer failed: ${error}`);
    } finally {
      setIsTransferring(false);
    }
  };

  if (!isDeployed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span>Allowance Not Available</span>
          </CardTitle>
          <CardDescription>
            Contract is not deployed on this network.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Show coming soon for current contract (doesn't have allowance functions)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Allowance Management</span>
          <Badge variant="secondary" className="ml-auto">
            <Clock className="h-3 w-3 mr-1" />
            Coming Soon
          </Badge>
        </CardTitle>
        <CardDescription>
          Allowance functionality will be available in the extended contract version.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Feature Coming Soon</p>
          <p className="text-sm">
            The current contract doesn't include allowance functions. 
            Deploy the extended version to use allowance features.
          </p>
        </div>
      </CardContent>
    </Card>
  );

}
