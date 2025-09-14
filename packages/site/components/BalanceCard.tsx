"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useConfidentialToken } from "@/hooks/useConfidentialToken";
import { useFhevm } from "@/fhevm/useFhevm";
import { useMetaMask } from "@/hooks/metamask/useMetaMaskProvider";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { formatUnits } from "ethers";
import { 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Copy, 
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

export function BalanceCard() {
  const { provider, chainId } = useMetaMask();
  const { ethersSigner } = useMetaMaskEthersSigner();
  const { instance } = useFhevm({ provider, chainId });
  const fhevmDecryptionSignatureStorage = useInMemoryStorage();
  
  const sameChain = { current: (id: number | undefined) => id === chainId };
  const sameSigner = { current: (signer: any) => signer === ethersSigner };

  const {
    contractAddress,
    canDecrypt,
    canGetBalance,
    decryptBalanceHandle,
    refreshBalanceHandle,
    resetDecryptSession,
    isDecrypted,
    message,
    clear: clearBalance,
    handle: balanceHandle,
    isDecrypting,
    isRefreshing,
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

  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [lastDecryptTime, setLastDecryptTime] = useState<Date | null>(null);

  const handleRefresh = () => {
    refreshBalanceHandle();
    setLastRefreshTime(new Date());
  };

  const handleDecrypt = () => {
    decryptBalanceHandle();
    setLastDecryptTime(new Date());
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString();
  };

  if (!isDeployed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span>Contract Not Deployed</span>
          </CardTitle>
          <CardDescription>
            The ConfidentialToken contract is not deployed on this network.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please deploy the contract first or switch to a network where it's deployed.
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
          <Eye className="h-5 w-5" />
          <span>Your Balance</span>
        </CardTitle>
        <CardDescription>
          Your confidential token balance is encrypted on-chain. Only you can decrypt it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance Display */}
        <div className="space-y-3">
          {/* Decrypted Balance */}
          {isDecrypted && clearBalance && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Decrypted Balance</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatUnits(clearBalance, 6)} CT
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              {lastDecryptTime && (
                <p className="text-xs text-green-600 mt-1">
                  Decrypted at {formatTime(lastDecryptTime)}
                </p>
              )}
            </div>
          )}

          {/* Encrypted Balance Handle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Encrypted Balance Handle</label>
              <Badge variant="outline" className="text-xs">
                {isDecrypted ? "Decrypted" : "Encrypted"}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <code className="flex-1 text-xs bg-muted p-2 rounded font-mono break-all">
                {balanceHandle || "Not loaded"}
              </code>
              {balanceHandle && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(balanceHandle)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              )}
            </div>
            {lastRefreshTime && (
              <p className="text-xs text-muted-foreground">
                Last refreshed at {formatTime(lastRefreshTime)}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleRefresh}
            disabled={!canGetBalance}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh Balance"}</span>
          </Button>

          <Button
            onClick={handleDecrypt}
            disabled={!canDecrypt}
            variant="default"
            size="sm"
            className="flex items-center space-x-2"
          >
            {isDecrypted ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span>
              {isDecrypting ? "Decrypting..." : isDecrypted ? "Hide Balance" : "Decrypt Balance"}
            </span>
          </Button>

          <Button
            onClick={resetDecryptSession}
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
          >
            Reset Session
          </Button>
        </div>

        {/* Status Messages */}
        {message && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* Help Text */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• <strong>Refresh:</strong> Get the latest encrypted balance handle from the contract</p>
          <p>• <strong>Decrypt:</strong> Use your private key to decrypt and view your balance</p>
          <p>• <strong>Privacy:</strong> Only you can see your actual balance amount</p>
        </div>
      </CardContent>
    </Card>
  );
}
