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
    approveConfidential,
    transferFromConfidential,
    isMinting: isProcessingFromHook,
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
  });

  const handleApprove = () => {
    const amountNum = parseFloat(approveAmount);
    if (amountNum > 0 && approveSpender) {
      approveConfidential(approveSpender, amountNum);
    }
  };

  const handleTransferFrom = () => {
    const amountNum = parseFloat(transferFromAmount);
    if (amountNum > 0 && transferFromFrom && transferFromTo) {
      transferFromConfidential(transferFromFrom, transferFromTo, amountNum);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Allowance Management</span>
        </CardTitle>
        <CardDescription>
          Approve and manage spending allowances for confidential tokens.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="approve" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="approve">Approve</TabsTrigger>
            <TabsTrigger value="transfer">Transfer From</TabsTrigger>
          </TabsList>
          
          <TabsContent value="approve" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="spender">Spender Address</Label>
              <Input
                id="spender"
                type="text"
                placeholder="0x..."
                value={approveSpender}
                onChange={(e) => setApproveSpender(e.target.value)}
                disabled={isProcessingFromHook}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="approve-amount">Amount to Approve</Label>
              <Input
                id="approve-amount"
                type="text"
                placeholder="0.000000"
                value={approveAmount}
                onChange={(e) => setApproveAmount(e.target.value)}
                disabled={isProcessingFromHook}
              />
            </div>
            
            <Button
              onClick={handleApprove}
              disabled={!approveSpender || !approveAmount || parseFloat(approveAmount) <= 0 || isProcessingFromHook}
              className="w-full"
              size="lg"
            >
              {isProcessingFromHook ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Approve Spending
                </>
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="transfer" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="from">From Address</Label>
              <Input
                id="from"
                type="text"
                placeholder="0x..."
                value={transferFromFrom}
                onChange={(e) => setTransferFromFrom(e.target.value)}
                disabled={isProcessingFromHook}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="to">To Address</Label>
              <Input
                id="to"
                type="text"
                placeholder="0x..."
                value={transferFromTo}
                onChange={(e) => setTransferFromTo(e.target.value)}
                disabled={isProcessingFromHook}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="transfer-amount">Amount to Transfer</Label>
              <Input
                id="transfer-amount"
                type="text"
                placeholder="0.000000"
                value={transferFromAmount}
                onChange={(e) => setTransferFromAmount(e.target.value)}
                disabled={isProcessingFromHook}
              />
            </div>
            
            <Button
              onClick={handleTransferFrom}
              disabled={!transferFromFrom || !transferFromTo || !transferFromAmount || parseFloat(transferFromAmount) <= 0 || isProcessingFromHook}
              className="w-full"
              size="lg"
            >
              {isProcessingFromHook ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Transferring...
                </>
              ) : (
                <>
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Transfer From
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {hookMessage && (
          <Alert variant={hookMessage.includes("failed") ? "destructive" : "default"} className="mt-4">
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
