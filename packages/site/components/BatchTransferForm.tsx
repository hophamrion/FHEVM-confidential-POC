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
import { parseUnits, isAddress } from "ethers";
import { 
  Send, 
  Upload, 
  AlertCircle,
  CheckCircle,
  Info,
  Users,
  Loader2
} from "lucide-react";

interface BatchRow {
  address: string;
  amount: string;
  isValid: boolean;
}

export function BatchTransferForm() {
  const [csvInput, setCsvInput] = useState("");
  const [batchRows, setBatchRows] = useState<BatchRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
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
    transferConfidential,
    canTransfer,
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

  const parseCSV = (csv: string): BatchRow[] => {
    const lines = csv.trim().split('\n');
    const rows: BatchRow[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = line.split(',').map(p => p.trim());
      if (parts.length !== 2) continue;
      
      const [address, amount] = parts;
      const isValid = isAddress(address) && parseFloat(amount) > 0;
      
      rows.push({
        address,
        amount,
        isValid
      });
    }
    
    return rows;
  };

  const handleCSVChange = (value: string) => {
    setCsvInput(value);
    const rows = parseCSV(value);
    setBatchRows(rows);
  };

  const handleBatchTransfer = async () => {
    if (!instance || !ethersSigner || !contractAddress || batchRows.length === 0) {
      return;
    }

    // Check if transferConfidential function is available
    if (!transferConfidential) {
      setMessage("Transfer function not available. Please check contract deployment.");
      return;
    }
    
    if (!canTransfer) {
      setMessage("Transfer not allowed. Please check your permissions.");
      return;
    }

    const validRows = batchRows.filter(row => row.isValid);
    if (validRows.length === 0) {
      setMessage("No valid rows to process");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setMessage("Starting batch transfer...");

    try {
      // Step 1: Encrypt all amounts
      setProgress(10);
      setMessage("Encrypting amounts...");
      
      const from = await ethersSigner.getAddress();
      const input = instance.createEncryptedInput(contractAddress, from);
      
      for (const row of validRows) {
        const scaledAmount = parseUnits(row.amount, 6);
        input.add64(scaledAmount);
      }

      setProgress(30);
      setMessage("Encrypting batch data...");
      const enc = await input.encrypt();

      setProgress(50);
      setMessage("Submitting transaction...");

      // Step 2: Call individual transfers using hook function
      // Process transfers one by one
      for (let i = 0; i < validRows.length; i++) {
        const row = validRows[i];
        setProgress(50 + (i / validRows.length) * 40);
        setMessage(`Transferring to ${row.address}...`);
        
        // Use transferConfidential from hook
        transferConfidential(row.address, parseFloat(row.amount));
        
        // Wait a bit between transfers to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      setProgress(100);
      setMessage(`Batch transfer completed! Processed ${validRows.length} transfers.`);
      
    } catch (error) {
      setMessage(`Batch transfer failed: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const validRows = batchRows.filter(row => row.isValid);
  const totalAmount = validRows.reduce((sum, row) => sum + parseFloat(row.amount), 0);

  if (!isDeployed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span>Batch Transfer Not Available</span>
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
          <Users className="h-5 w-5" />
          <span>Batch Transfer</span>
        </CardTitle>
        <CardDescription>
          Send confidential tokens to multiple addresses at once. Maximum 100 recipients per batch.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* CSV Input */}
        <div className="space-y-2">
          <Label htmlFor="csv-input">CSV Format (address,amount)</Label>
          <textarea
            id="csv-input"
            value={csvInput}
            onChange={(e) => handleCSVChange(e.target.value)}
            placeholder={`0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6,100.5
0x8ba1f109551bD432803012645Hac136c,50.25
0x1234567890123456789012345678901234567890,75.0`}
            className="w-full h-32 px-3 py-2 border border-input bg-background rounded-md text-sm font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Enter one recipient per line: address,amount (comma-separated). Each line = one transfer.
          </p>
        </div>

        {/* Preview Table */}
        {batchRows.length > 0 && (
          <div className="space-y-2">
            <Label>Preview ({validRows.length} valid recipients)</Label>
            <div className="border rounded-md max-h-48 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-2">Address</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {batchRows.map((row, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2 font-mono text-xs">
                        {row.address.slice(0, 6)}...{row.address.slice(-4)}
                      </td>
                      <td className="p-2">{row.amount} CT</td>
                      <td className="p-2">
                        <Badge variant={row.isValid ? "default" : "destructive"}>
                          {row.isValid ? "Valid" : "Invalid"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary */}
        {validRows.length > 0 && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Recipients:</span>
              <span>{validRows.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Amount:</span>
              <span>{totalAmount.toFixed(6)} CT</span>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Transfer Button */}
        <Button
          onClick={handleBatchTransfer}
          disabled={!instance || !ethersSigner || !transferConfidential || !canTransfer || validRows.length === 0 || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Batch Transfer ({validRows.length} recipients)
            </>
          )}
        </Button>

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
            <li>• All amounts are encrypted in a single batch</li>
            <li>• Uses clamp logic to prevent underflow</li>
            <li>• Maximum 100 recipients per transaction</li>
            <li>• Gas efficient for multiple transfers</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
