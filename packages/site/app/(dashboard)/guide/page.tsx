"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Rocket, 
  Shield, 
  Users, 
  Zap, 
  CheckCircle, 
  Clock, 
  Star,
  ArrowRight,
  ExternalLink,
  Code,
  Database,
  Lock,
  Send,
  Plus,
  Minus,
  Eye
} from "lucide-react";

export default function GuidePage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">FHEVM Confidential Token</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          User guide and development roadmap for privacy-preserving tokens using Fully Homomorphic Encryption
        </p>
        <div className="flex justify-center space-x-2">
          <Badge variant="secondary" className="text-sm">
            <Shield className="h-3 w-3 mr-1" />
            Privacy-Preserving
          </Badge>
          <Badge variant="secondary" className="text-sm">
            <Zap className="h-3 w-3 mr-1" />
            FHEVM Powered
          </Badge>
          <Badge variant="secondary" className="text-sm">
            <Database className="h-3 w-3 mr-1" />
            On-Chain Registry
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="guide">Guide</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          <TabsTrigger value="tech">Technology</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* What is FHEVM Confidential Token */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>What is this project?</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  FHEVM Confidential Token is a Web3 application using <strong>Fully Homomorphic Encryption (FHE)</strong> 
                  to create confidential tokens, enabling transactions without revealing token amounts.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Fully confidential transactions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Batch transfer with CSV</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">On-chain registry</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Key Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Plus className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Mint Tokens</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Send className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Transfer</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Minus className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Burn Tokens</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Batch Transfer</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Architecture Overview */}
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="h-5 w-5" />
                  <span>System Architecture</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                    <Database className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">Smart Contracts</h3>
                  <p className="text-sm text-muted-foreground">
                    ConfidentialToken, Registry, Factory
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                    <Lock className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold">FHEVM Layer</h3>
                  <p className="text-sm text-muted-foreground">
                    Encryption, Decryption, Proofs
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                    <Rocket className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">Frontend</h3>
                  <p className="text-sm text-muted-foreground">
                    Next.js, React, MetaMask
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guide Tab */}
        <TabsContent value="guide" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Start */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Rocket className="h-5 w-5" />
                  <span>Quick Start</span>
                </CardTitle>
                <CardDescription>
                  Step-by-step guide to use the project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <h4 className="font-semibold">Connect MetaMask</h4>
                      <p className="text-sm text-muted-foreground">Switch to Sepolia testnet</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <h4 className="font-semibold">Deploy Contract</h4>
                      <p className="text-sm text-muted-foreground">Use Factory (1-click) or Manual</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <h4 className="font-semibold">Mint Tokens</h4>
                      <p className="text-sm text-muted-foreground">Create new tokens (owner only)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <div>
                      <h4 className="font-semibold">Transfer</h4>
                      <p className="text-sm text-muted-foreground">Send confidential tokens</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Feature Guide</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold">Single Transfer</h4>
                    <p className="text-sm text-muted-foreground">Send tokens to one address</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold">Batch Transfer</h4>
                    <p className="text-sm text-muted-foreground">Send tokens to multiple addresses via CSV</p>
                  </div>
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold">Burn Tokens</h4>
                    <p className="text-sm text-muted-foreground">Burn tokens to reduce supply</p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold">Allowance</h4>
                    <p className="text-sm text-muted-foreground">Approve token spending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CSV Format Guide */}
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>CSV Format for Batch Transfer</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm font-mono">
{`0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6,100.5
0x8ba1f109551bD432803012645Hac136c,50.25
0x1234567890123456789012345678901234567890,75.0`}
                </pre>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Each line = 1 recipient</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Format: address,amount</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Maximum 100 recipients</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roadmap Tab */}
        <TabsContent value="roadmap" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Completed</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Smart contracts với FHE</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Frontend dashboard</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Registry & Factory system</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Batch transfer với CSV</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Deployment automation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Error handling & validation</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* In Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <span>In Development</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Observers feature</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Strict mode & Supply</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Performance optimization</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Multi-chain support</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Future Plans */}
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-blue-500" />
                  <span>Future Plans</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">Community</h3>
                  <p className="text-sm text-muted-foreground">
                    Build developer community
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                    <Rocket className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold">Mainnet</h3>
                  <p className="text-sm text-muted-foreground">
                    Deploy to mainnet
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                    <Code className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">SDK</h3>
                  <p className="text-sm text-muted-foreground">
                    Create SDK for developers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tech Tab */}
        <TabsContent value="tech" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Frontend Stack */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Rocket className="h-5 w-5" />
                  <span>Frontend Stack</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Next.js 15</span>
                    <Badge variant="secondary">Framework</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">TypeScript</span>
                    <Badge variant="secondary">Type Safety</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tailwind CSS</span>
                    <Badge variant="secondary">Styling</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Ethers.js v6</span>
                    <Badge variant="secondary">Ethereum</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">FHEVM SDK</span>
                    <Badge variant="secondary">FHE</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Backend Stack */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Backend Stack</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Hardhat</span>
                    <Badge variant="secondary">Dev Environment</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Solidity ^0.8.24</span>
                    <Badge variant="secondary">Smart Contracts</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">FHEVM</span>
                    <Badge variant="secondary">FHE Precompiles</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">OpenZeppelin</span>
                    <Badge variant="secondary">Security</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Features */}
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Features</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">FHE Features</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Encrypted Balances</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Private Transfers</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Clamp Logic</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Proof Verification</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Access Control</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Owner-only Mint</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Address Initialization</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Registry Management</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center space-y-4 pt-8 border-t">
        <p className="text-muted-foreground">
          FHEVM Confidential Token Project - Proof of Concept for Privacy-Preserving DeFi
        </p>
        <div className="flex justify-center space-x-4">
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            GitHub
          </Button>
          <Button variant="outline" size="sm">
            <BookOpen className="h-4 w-4 mr-2" />
            Documentation
          </Button>
        </div>
      </div>
    </div>
  );
}
