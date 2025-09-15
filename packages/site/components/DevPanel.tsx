"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useConfidentialToken } from "@/hooks/useConfidentialToken";
import { useFhevm } from "@/fhevm/useFhevm";
import { useMetaMask } from "@/hooks/metamask/useMetaMaskProvider";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useTokenContext } from "@/contexts/TokenContext";
import { isAddress } from "ethers";
import { 
  Code, 
  Bug, 
  Clock, 
  Copy,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";

export function DevPanel() {
  const [testAddress, setTestAddress] = useState("");
  const [isValidAddress, setIsValidAddress] = useState(true);
  const [showAdvancedSlug, setShowAdvancedSlug] = useState(false);

  const { provider, chainId } = useMetaMask();
  const { ethersSigner } = useMetaMaskEthersSigner();
  const { instance } = useFhevm({ provider, chainId });
  const fhevmDecryptionSignatureStorage = useInMemoryStorage();
  const { tokenAddress } = useTokenContext();
  
  const sameChain = { current: (id: number | undefined) => id === chainId };
  const sameSigner = { current: (signer: any) => signer === ethersSigner };

  const {
    contractAddress,
    canInitialize,
    canDecrypt,
    canGetBalance,
    initializeAddress,
    decryptBalanceHandle,
    refreshBalanceHandle,
    resetDecryptSession,
    isDecrypted,
    message,
    clear: clearBalance,
    handle: balanceHandle,
    isDecrypting,
    isRefreshing,
    isInitializing,
    isDeployed,
    isOwner,
    contractOwner,
    currentSlug,
    setCurrentSlug,
    availableSlugs,
    setAvailableSlugs,
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
    setTestAddress(value);
    if (value) {
      setIsValidAddress(isAddress(value));
    } else {
      setIsValidAddress(true);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString();
  };

  const getErrorHint = (error: string) => {
    if (error.includes("Ownable")) {
      return "Not owner - connect with owner wallet";
    }
    if (error.includes("0x9de3392c")) {
      return "Input/ACL verifier: wrong context or missing allow";
    }
    if (error.includes("0x118cdaa7")) {
      return "OwnableUnauthorizedAccount";
    }
    if (error.includes("Not authorized to user decrypt")) {
      return "Grant self-decrypt or refresh balance to get latest handle";
    }
    if (error.includes("Wrong context")) {
      return "Check ENC.contract/user vs tx.to/from";
    }
    return "Unknown error - check console for details";
  };

  return (
    <div className="space-y-6">
      {/* Context Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code className="h-5 w-5" />
            <span>Context Information</span>
          </CardTitle>
          <CardDescription>
            Current contract and wallet context for debugging.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-xs text-muted-foreground">Registry Slug</Label>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {currentSlug}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowAdvancedSlug(!showAdvancedSlug);
                  }}
                  className="text-xs h-6 px-2"
                >
                  <Code className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Found {availableSlugs.length} slug(s): {availableSlugs.join(", ")}
              </div>
              {/* Advanced Slug Selector - Hidden by default */}
              {showAdvancedSlug && (
                <div className="mt-2 p-2 border rounded bg-muted/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <select
                      value={currentSlug}
                      onChange={(e) => setCurrentSlug(e.target.value)}
                      className="text-xs h-8 px-2 border rounded bg-background"
                    >
                      {availableSlugs.map((slug) => (
                        <option key={slug} value={slug}>
                          {slug}
                        </option>
                      ))}
                      <option value="custom">Custom...</option>
                    </select>
                    {currentSlug === "custom" && (
                      <Input
                        value={currentSlug}
                        onChange={(e) => setCurrentSlug(e.target.value)}
                        className="text-xs h-8"
                        placeholder="Enter custom slug"
                      />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Add new slug to check"
                      className="text-xs h-6"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const newSlug = e.currentTarget.value.trim();
                          if (newSlug && !availableSlugs.includes(newSlug)) {
                            setAvailableSlugs([...availableSlugs, newSlug]);
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Refresh slugs from registry
                        window.location.reload();
                      }}
                      className="text-xs h-6 px-2"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Contract Address</Label>
              <div className="flex items-center space-x-2">
                <code className="text-xs bg-muted p-1 rounded flex-1">
                  {contractAddress || "Not deployed"}
                </code>
                {contractAddress && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(contractAddress)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Chain ID</Label>
              <p className="text-sm font-mono">{chainId || "Unknown"}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Caller</Label>
              <div className="flex items-center space-x-2">
                <code className="text-xs bg-muted p-1 rounded flex-1">
                  {ethersSigner?.address || "Not connected"}
                </code>
                {ethersSigner?.address && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(ethersSigner.address)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Owner Status</Label>
              <Badge variant={isOwner ? "default" : "secondary"}>
                {isOwner ? "Owner" : "User"}
              </Badge>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Contract Status</Label>
              <Badge variant={isDeployed ? "default" : "destructive"}>
                {isDeployed ? "Deployed" : "Not Deployed"}
              </Badge>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Decimals</Label>
              <p className="text-sm font-mono">6</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance Debug */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bug className="h-5 w-5" />
            <span>Balance Debug</span>
          </CardTitle>
          <CardDescription>
            Debug balance operations and handles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Current Balance Handle</Label>
            <div className="flex items-center space-x-2">
              <code className="text-xs bg-muted p-2 rounded flex-1 break-all">
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
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={refreshBalanceHandle}
              disabled={!canGetBalance}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh Handle
            </Button>

            <Button
              onClick={decryptBalanceHandle}
              disabled={!canDecrypt}
              variant="outline"
              size="sm"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Decrypt Balance
            </Button>

            <Button
              onClick={resetDecryptSession}
              variant="outline"
              size="sm"
            >
              Reset Session
            </Button>
          </div>

          {isDecrypted && clearBalance && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Decrypted Balance: {clearBalance.toString()} (raw)
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* ACL Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>ACL Quick Tests</span>
          </CardTitle>
          <CardDescription>
            Test access control and permissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-address">Test Address</Label>
            <Input
              id="test-address"
              type="text"
              placeholder="0x..."
              value={testAddress}
              onChange={(e) => handleAddressChange(e.target.value)}
              className={!isValidAddress ? "border-destructive" : ""}
            />
            {!isValidAddress && testAddress && (
              <p className="text-sm text-destructive">Invalid Ethereum address</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => testAddress && initializeAddress(testAddress)}
              disabled={!canInitialize || !testAddress || !isValidAddress}
              variant="outline"
              size="sm"
            >
              {isInitializing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Initializing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Initialize Address
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Decoder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bug className="h-5 w-5" />
            <span>Error Decoder</span>
          </CardTitle>
          <CardDescription>
            Common error messages and their meanings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="errors">
              <AccordionTrigger>Common Errors</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-muted rounded">
                    <div className="font-mono text-xs text-destructive">Ownable: caller is not the owner</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {getErrorHint("Ownable")}
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <div className="font-mono text-xs text-destructive">0x9de3392c</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {getErrorHint("0x9de3392c")}
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <div className="font-mono text-xs text-destructive">0x118cdaa7</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {getErrorHint("0x118cdaa7")}
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <div className="font-mono text-xs text-destructive">Not authorized to user decrypt</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {getErrorHint("Not authorized to user decrypt")}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Status Messages */}
      {message && (
        <Alert variant={message.includes("failed") ? "destructive" : "default"}>
          {message.includes("failed") ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <Info className="h-4 w-4" />
          )}
          <AlertDescription>
            <div className="font-mono text-xs">{message}</div>
            {message.includes("failed") && (
              <div className="text-xs text-muted-foreground mt-1">
                Hint: {getErrorHint(message)}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Performance Timers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Performance</span>
          </CardTitle>
          <CardDescription>
            Operation timing and performance metrics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <Label className="text-xs text-muted-foreground">Encrypt Time</Label>
              <p className="text-sm font-mono">~200ms</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Tx Mine Time</Label>
              <p className="text-sm font-mono">~2-5s</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Decrypt Time</Label>
              <p className="text-sm font-mono">~500ms</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
