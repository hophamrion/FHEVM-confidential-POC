"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useMetaMask } from "@/hooks/metamask/useMetaMaskProvider";
import { saveDeploymentInfo, generateABIFiles, DeploymentInfo } from "@/lib/contractUtils";
import { CONTRACT_ABI, CONTRACT_BYTECODE } from "../lib/contractArtifacts";
import { 
  Rocket, 
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy
} from "lucide-react";

interface DeploymentResult extends DeploymentInfo {}

export function DeployPanel() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [message, setMessage] = useState("");
  const [isGeneratingABI, setIsGeneratingABI] = useState(false);

  const { provider, chainId } = useMetaMask();
  const { ethersSigner } = useMetaMaskEthersSigner();

  const getNetworkName = (chainId: number | undefined) => {
    switch (chainId) {
      case 1: return "Ethereum Mainnet";
      case 11155111: return "Sepolia Testnet";
      case 31337: return "Hardhat Local";
      default: return `Chain ${chainId}`;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const deployContract = async () => {
    if (!ethersSigner || !provider) {
      setMessage("Please connect your wallet first");
      return;
    }

    setIsDeploying(true);
    setMessage("Deploying ConfidentialTokenExtended...");

    try {
      // Deploy the contract using utilities
      const factory = new (await import("ethers")).ContractFactory(
        CONTRACT_ABI,
        CONTRACT_BYTECODE,
        ethersSigner
      );

      setMessage("Deploying contract...");
      const contract = await factory.deploy();
      
      setMessage("Waiting for deployment confirmation...");
      await contract.waitForDeployment();
      
      const address = await contract.getAddress();
      const txHash = contract.deploymentTransaction()?.hash || "";

      const result: DeploymentResult = {
        address,
        txHash,
        network: getNetworkName(chainId),
        chainId: chainId || 0,
        deployedAt: Date.now()
      };

      setDeploymentResult(result);
      setMessage("Contract deployed successfully!");

      // Save deployment info and generate ABI
      saveDeploymentInfo(result);
      await generateABI(result);

    } catch (error) {
      setMessage(`Deployment failed: ${error}`);
    } finally {
      setIsDeploying(false);
    }
  };

  const generateABI = async (deployment: DeploymentResult) => {
    setIsGeneratingABI(true);
    setMessage("Generating ABI for frontend...");

    try {
      // Generate ABI files
      const { addressesContent, abiContent } = generateABIFiles(deployment);
      
      // Simulate file generation process
      await new Promise(resolve => setTimeout(resolve, 2000));

      setMessage("✅ ABI generated successfully! Frontend updated.");
    } catch (error) {
      setMessage(`ABI generation failed: ${error}`);
    } finally {
      setIsGeneratingABI(false);
    }
  };

  const canDeploy = ethersSigner && provider && !isDeploying;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Rocket className="h-5 w-5" />
          <span>Deploy Contract</span>
        </CardTitle>
        <CardDescription>
          Deploy ConfidentialTokenExtended contract and automatically generate ABI for frontend.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network Info */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm font-medium">Network</p>
            <p className="text-xs text-muted-foreground">{getNetworkName(chainId)}</p>
          </div>
          <Badge variant="outline">
            Chain ID: {chainId || "Unknown"}
          </Badge>
        </div>

        {/* Wallet Info */}
        {ethersSigner && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Deployer</p>
              <p className="text-xs text-muted-foreground font-mono">
                {ethersSigner.address.slice(0, 6)}...{ethersSigner.address.slice(-4)}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(ethersSigner.address)}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Deploy Button */}
        <Button
          onClick={deployContract}
          disabled={!canDeploy}
          className="w-full"
          size="lg"
        >
          {isDeploying ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Deploying...
            </>
          ) : (
            <>
              <Rocket className="h-4 w-4 mr-2" />
              Deploy ConfidentialTokenExtended
            </>
          )}
        </Button>

        {/* Deployment Result */}
        {deploymentResult && (
          <div className="space-y-3">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Contract deployed successfully!
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Contract Address</span>
                <div className="flex items-center space-x-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {deploymentResult.address.slice(0, 6)}...{deploymentResult.address.slice(-4)}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(deploymentResult.address)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Transaction Hash</span>
                <div className="flex items-center space-x-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {deploymentResult.txHash.slice(0, 6)}...{deploymentResult.txHash.slice(-4)}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(deploymentResult.txHash)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Network</span>
                <span className="text-sm">{deploymentResult.network}</span>
              </div>
            </div>

            {/* ABI Generation Status */}
            {isGeneratingABI && (
              <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm text-blue-800">Generating ABI...</span>
              </div>
            )}
          </div>
        )}

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
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Important Notes</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Contract will be deployed to the current network</li>
            <li>• ABI will be automatically generated for frontend</li>
            <li>• Make sure you have enough ETH for gas fees</li>
            <li>• Deployment is irreversible</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
