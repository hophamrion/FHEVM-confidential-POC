"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useMetaMask } from "@/hooks/metamask/useMetaMaskProvider";
import { 
  Rocket, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  ExternalLink,
  Database,
  Factory
} from "lucide-react";

// Import artifacts
import artifact from "@/abi/ConfidentialTokenExtended.json";
import { CTRegistryABI } from "@/abi/CTRegistryABI";
import { CTFactoryABI } from "@/abi/CTFactoryABI";
import { CTRegistryAddresses } from "@/abi/CTRegistryAddresses";
import { CTFactoryAddresses } from "@/abi/CTFactoryAddresses";

export default function DeployPage() {
  const [contractAddress, setContractAddress] = useState<string>("");
  const [owner, setOwner] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [existingAddress, setExistingAddress] = useState<string>("");
  const [slug, setSlug] = useState<string>("main");
  const [registryAddress, setRegistryAddress] = useState<string>("");
  const [factoryAddress, setFactoryAddress] = useState<string>("");

  const { provider, chainId } = useMetaMask();
  const { ethersSigner } = useMetaMaskEthersSigner();

  // Get registry and factory addresses
  const getRegistryAddress = () => {
    if (chainId) {
      const entry = CTRegistryAddresses[chainId.toString() as keyof typeof CTRegistryAddresses];
      return entry?.address || "";
    }
    return "";
  };

  const getFactoryAddress = () => {
    if (chainId) {
      const entry = CTFactoryAddresses[chainId.toString() as keyof typeof CTFactoryAddresses];
      return entry?.address || "";
    }
    return "";
  };

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
    setMessage("Connecting wallet...");

    try {
      // Check network using chainId from hook
      if (chainId !== 11155111) {
        throw new Error("Please switch to Sepolia testnet");
      }

      setMessage("Deploying contract...");
      
      // Create contract factory
      const factory = new (await import("ethers")).ContractFactory(
        artifact.abi,
        artifact.bytecode,
        ethersSigner
      );

      // Deploy contract (no constructor args needed - SepoliaConfig handles it)
      const contract = await factory.deploy();
      const tx = contract.deploymentTransaction();
      
      if (tx) {
        setMessage("Waiting for deployment confirmation...");
        await tx.wait();
      }

      const deployedAddress = await contract.getAddress();
      const deployerAddress = await ethersSigner.getAddress();

      setContractAddress(deployedAddress);
      setOwner(deployerAddress);
      setMessage(`Contract deployed successfully at ${deployedAddress}`);

      // Register to registry
      await registerToRegistry(deployedAddress, deployerAddress);

    } catch (error: any) {
      console.error(error);
      setMessage(`Deploy failed: ${error.message || error}`);
    } finally {
      setIsDeploying(false);
    }
  };

  const deployAndRegister = async () => {
    if (!ethersSigner || !provider) {
      setMessage("Please connect your wallet first");
      return;
    }

    const factoryAddr = getFactoryAddress();
    if (!factoryAddr || factoryAddr === "0x0000000000000000000000000000000000000000") {
      setMessage("Factory not deployed on this network");
      return;
    }

    setIsDeploying(true);
    setMessage("Deploying and registering...");

    try {
      // Check network
      if (chainId !== 11155111) {
        throw new Error("Please switch to Sepolia testnet");
      }

      // Create factory contract
      const factory = new (await import("ethers")).Contract(
        factoryAddr,
        CTFactoryABI.abi,
        ethersSigner
      );

      // Deploy and register in one transaction
      const tx = await factory.deployAndRegister(slug);
      setMessage("Waiting for deployment and registration...");
      await tx.wait();

      // Get deployed address from registry
      const registryAddr = getRegistryAddress();
      const registry = new (await import("ethers")).Contract(
        registryAddr,
        CTRegistryABI.abi,
        ethersSigner
      );

      const deployerAddress = await ethersSigner.getAddress();
      const deployedAddress = await registry.latest(deployerAddress, slug);

      setContractAddress(deployedAddress);
      setOwner(deployerAddress);
      setMessage(`✅ Deploy and register successful! Contract: ${deployedAddress}`);

    } catch (error: any) {
      console.error(error);
      setMessage(`Deploy and register failed: ${error.message || error}`);
    } finally {
      setIsDeploying(false);
    }
  };

  const deployInfrastructure = async () => {
    if (!ethersSigner || !provider) {
      setMessage("Please connect your wallet first");
      return;
    }

    setIsDeploying(true);
    setMessage("Deploying infrastructure...");

    try {
      // Check network
      if (chainId !== 11155111) {
        throw new Error("Please switch to Sepolia testnet");
      }

      setMessage("Deploying CTRegistry...");
      
      // Deploy CTRegistry
      const registryFactory = new (await import("ethers")).ContractFactory(
        CTRegistryABI.abi,
        "0x608060405234801561001057600080fd5b506004361061...", // You'll need to add the bytecode
        ethersSigner
      );

      const registry = await registryFactory.deploy();
      const registryTx = registry.deploymentTransaction();
      
      if (registryTx) {
        setMessage("Waiting for Registry deployment...");
        await registryTx.wait();
      }

      const registryAddress = await registry.getAddress();
      setMessage(`Registry deployed at ${registryAddress}`);

      setMessage("Deploying CTFactory...");
      
      // Deploy CTFactory
      const factoryFactory = new (await import("ethers")).ContractFactory(
        CTFactoryABI.abi,
        "0x608060405234801561001057600080fd5b506004361061...", // You'll need to add the bytecode
        ethersSigner
      );

      const factory = await factoryFactory.deploy(registryAddress);
      const factoryTx = factory.deploymentTransaction();
      
      if (factoryTx) {
        setMessage("Waiting for Factory deployment...");
        await factoryTx.wait();
      }

      const factoryAddress = await factory.getAddress();
      setMessage(`Factory deployed at ${factoryAddress}`);

      setMessage("Setting up Factory as registrar...");
      
      // Set factory as registrar
      const setRegistrarTx = await (registry as any).setRegistrar(factoryAddress, true);
      await setRegistrarTx.wait();

      setMessage(`✅ Infrastructure deployed successfully!`);
      setMessage(`Registry: ${registryAddress}`);
      setMessage(`Factory: ${factoryAddress}`);

      // Update addresses in localStorage for immediate use
      localStorage.setItem(`registry:address:${chainId}`, registryAddress);
      localStorage.setItem(`factory:address:${chainId}`, factoryAddress);

    } catch (error: any) {
      console.error(error);
      setMessage(`Infrastructure deployment failed: ${error.message || error}`);
    } finally {
      setIsDeploying(false);
    }
  };

  const registerToRegistry = async (tokenAddress: string, ownerAddress: string) => {
    const registryAddr = getRegistryAddress();
    if (!registryAddr || registryAddr === "0x0000000000000000000000000000000000000000") {
      setMessage("Registry not deployed on this network");
      return;
    }

    try {
      setMessage("Registering to registry...");
      
      const registry = new (await import("ethers")).Contract(
        registryAddr,
        CTRegistryABI.abi,
        ethersSigner
      );

      const tx = await registry.register(tokenAddress, slug);
      await tx.wait();
      
      setMessage(`✅ Contract registered to registry with slug: ${slug}`);
    } catch (error: any) {
      console.error(error);
      setMessage(`Registration failed: ${error.message || error}`);
    }
  };

  const useExistingContract = () => {
    if (!existingAddress) {
      setMessage("Please enter a contract address");
      return;
    }

    // Save to localStorage
    const key = `ct:address:${chainId?.toString()}`;
    localStorage.setItem(key, existingAddress);
    
    setContractAddress(existingAddress);
    setMessage(`Using existing contract: ${existingAddress}`);
  };

  // No need to load from localStorage anymore - using Registry

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Deploy Contract</h1>
        <p className="text-muted-foreground">
          Deploy ConfidentialToken contract directly from your wallet or use an existing contract.
        </p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Network Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Rocket className="h-5 w-5" />
              <span>Network Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Network</p>
                <p className="text-xs text-muted-foreground">{getNetworkName(chainId)}</p>
              </div>
              <Badge variant={chainId === 11155111 ? "default" : "destructive"}>
                Chain ID: {chainId || "Unknown"}
              </Badge>
            </div>
            {chainId !== 11155111 && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please switch to Sepolia testnet (Chain ID: 11155111) to deploy.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Registry Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Registry Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Registry Address</Label>
                <div className="flex items-center space-x-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded flex-1">
                    {getRegistryAddress() || "Not deployed"}
                  </code>
                  {getRegistryAddress() && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(getRegistryAddress())}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Factory Address</Label>
                <div className="flex items-center space-x-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded flex-1">
                    {getFactoryAddress() || "Not deployed"}
                  </code>
                  {getFactoryAddress() && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(getFactoryAddress())}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deploy Options */}
        <Card>
          <CardHeader>
            <CardTitle>Deploy Options</CardTitle>
            <CardDescription>
              Choose how to deploy your ConfidentialToken contract.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="manual" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="manual">Manual Deploy</TabsTrigger>
                <TabsTrigger value="factory">Factory (1-Click)</TabsTrigger>
                <TabsTrigger value="existing">Use Existing</TabsTrigger>
              </TabsList>

              {/* Deploy Infrastructure */}
              <TabsContent value="infrastructure" className="space-y-4">
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Deploy Registry and Factory contracts first. This only needs to be done once per network.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Database className="h-5 w-5" />
                            <span>CTRegistry</span>
                          </CardTitle>
                          <CardDescription>
                            On-chain registry for managing contract addresses
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Status:</span>
                              <Badge variant={getRegistryAddress() && getRegistryAddress() !== "0x0000000000000000000000000000000000000000" ? "default" : "destructive"}>
                                {getRegistryAddress() && getRegistryAddress() !== "0x0000000000000000000000000000000000000000" ? "Deployed" : "Not Deployed"}
                              </Badge>
                            </div>
                            {getRegistryAddress() && getRegistryAddress() !== "0x0000000000000000000000000000000000000000" && (
                              <div className="text-xs text-muted-foreground">
                                {getRegistryAddress().slice(0, 6)}...{getRegistryAddress().slice(-4)}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Factory className="h-5 w-5" />
                            <span>CTFactory</span>
                          </CardTitle>
                          <CardDescription>
                            Factory for 1-click deploy and register
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Status:</span>
                              <Badge variant={getFactoryAddress() && getFactoryAddress() !== "0x0000000000000000000000000000000000000000" ? "default" : "destructive"}>
                                {getFactoryAddress() && getFactoryAddress() !== "0x0000000000000000000000000000000000000000" ? "Deployed" : "Not Deployed"}
                              </Badge>
                            </div>
                            {getFactoryAddress() && getFactoryAddress() !== "0x0000000000000000000000000000000000000000" && (
                              <div className="text-xs text-muted-foreground">
                                {getFactoryAddress().slice(0, 6)}...{getFactoryAddress().slice(-4)}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Button
                      onClick={deployInfrastructure}
                      disabled={!ethersSigner || chainId !== 11155111 || isDeploying}
                      className="w-full"
                      size="lg"
                    >
                      {isDeploying ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Deploying Infrastructure...
                        </>
                      ) : (
                        <>
                          <Rocket className="h-4 w-4 mr-2" />
                          Deploy Registry + Factory
                        </>
                      )}
                    </Button>

                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Infrastructure Benefits:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Registry: On-chain contract address management</li>
                        <li>• Factory: 1-click deploy and register</li>
                        <li>• One-time setup per network</li>
                        <li>• Enables team collaboration</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Factory Deploy */}
              <TabsContent value="factory" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="slug">Project Slug</Label>
                    <Input
                      id="slug"
                      type="text"
                      placeholder="main"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      disabled={true}
                      className="bg-muted cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">
                      Fixed to "main" for consistency. Advanced users can modify in Dev Panel.
                    </p>
                  </div>

                  <Button
                    onClick={deployAndRegister}
                    disabled={!ethersSigner || chainId !== 11155111 || isDeploying || !slug}
                    className="w-full"
                    size="lg"
                  >
                    {isDeploying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deploying & Registering...
                      </>
                    ) : (
                      <>
                        <Factory className="h-4 w-4 mr-2" />
                        Deploy & Register (1-Click)
                      </>
                    )}
                  </Button>

                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">Factory Benefits:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Deploy + Register in one transaction</li>
                      <li>• Automatic ownership transfer</li>
                      <li>• On-chain registry for easy lookup</li>
                      <li>• Multiple versions per slug</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

              {/* Manual Deploy */}
              <TabsContent value="manual" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="manual-slug">Project Slug</Label>
                    <Input
                      id="manual-slug"
                      type="text"
                      placeholder="main"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      disabled={true}
                      className="bg-muted cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">
                      Fixed to "main" for consistency. Advanced users can modify in Dev Panel.
                    </p>
                  </div>

                  <Button
                    onClick={deployContract}
                    disabled={!ethersSigner || chainId !== 11155111 || isDeploying}
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
                        Deploy Manually
                      </>
                    )}
                  </Button>

                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">Manual Deploy:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Deploy contract first</li>
                      <li>• Then register to registry</li>
                      <li>• Two separate transactions</li>
                      <li>• More control over process</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

              {/* Use Existing */}
              <TabsContent value="existing" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="existing-address">Contract Address</Label>
                    <Input
                      id="existing-address"
                      type="text"
                      placeholder="0x..."
                      value={existingAddress}
                      onChange={(e) => setExistingAddress(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={useExistingContract}
                    disabled={!existingAddress}
                    variant="outline"
                    className="w-full"
                  >
                    Use This Contract
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Results */}
            {contractAddress && (
              <div className="space-y-3 mt-6">
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
                        {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(contractAddress)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Owner</span>
                    <div className="flex items-center space-x-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {owner.slice(0, 6)}...{owner.slice(-4)}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(owner)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Slug</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {slug}
                    </code>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>


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
        <Card>
          <CardContent className="pt-6">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Important Notes</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Contract uses SepoliaConfig - automatically configured for Sepolia</li>
                <li>• Deployer becomes the owner with mint permissions</li>
                <li>• Contract address is saved to localStorage for the app to use</li>
                <li>• You need Sepolia ETH for gas fees</li>
                <li>• Smoke test runs automatically after deployment</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
