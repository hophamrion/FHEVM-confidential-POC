"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useConfidentialToken } from "@/hooks/useConfidentialToken";
import { useFhevm } from "@/fhevm/useFhevm";
import { useMetaMask } from "@/hooks/metamask/useMetaMaskProvider";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { 
  Home, 
  Send, 
  Plus, 
  Minus, 
  Shield, 
  Eye, 
  Settings, 
  Code,
  Lock,
  Clock,
  Rocket
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/overview", icon: Home, description: "Balance & Activity" },
  { name: "Send", href: "/send", icon: Send, description: "Transfer tokens" },
  { name: "Mint", href: "/mint", icon: Plus, description: "Create tokens", ownerOnly: true },
  { name: "Burn", href: "/burn", icon: Minus, description: "Destroy tokens", comingSoon: true },
  { name: "Allowance", href: "/allowance", icon: Shield, description: "Approve spending", comingSoon: true },
  { name: "Deploy", href: "/deploy", icon: Rocket, description: "Deploy contract" },
  { name: "Observers", href: "/observers", icon: Eye, description: "Grant view access", comingSoon: true },
  { name: "Advanced", href: "/advanced", icon: Settings, description: "Strict mode & Supply", comingSoon: true },
  { name: "Developer", href: "/developer", icon: Code, description: "Debug & Logs" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { provider, chainId } = useMetaMask();
  const { ethersSigner } = useMetaMaskEthersSigner();
  const { instance } = useFhevm({ provider, chainId });
  const fhevmDecryptionSignatureStorage = useInMemoryStorage();
  
  const sameChain = { current: (id: number | undefined) => id === chainId };
  const sameSigner = { current: (signer: any) => signer === ethersSigner };

  const { contractAddress, isDeployed, isOwner } = useConfidentialToken({
    instance,
    fhevmDecryptionSignatureStorage: fhevmDecryptionSignatureStorage as any,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider: ethersSigner,
    sameChain,
    sameSigner,
  });

  const handleNavigation = (href: string, comingSoon: boolean = false) => {
    if (comingSoon) {
      return; // Don't navigate for coming soon features
    }
    router.push(href);
  };

  return (
    <div className="flex h-full w-64 flex-col bg-muted/40">
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const isDisabled = item.ownerOnly && !isOwner;
            const isComingSoon = item.comingSoon;
            
            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href, isComingSoon)}
                disabled={isDisabled || isComingSoon}
                className={cn(
                  "group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isDisabled || isComingSoon
                    ? "text-muted-foreground cursor-not-allowed"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="flex items-center space-x-2">
                      <span>{item.name}</span>
                      {item.ownerOnly && !isOwner && (
                        <Badge variant="outline" className="text-xs">
                          Owner Only
                        </Badge>
                      )}
                      {isComingSoon && (
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Soon
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs opacity-70">
                      {item.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Contract Status</span>
            <Badge variant={isDeployed ? "default" : "destructive"} className="text-xs">
              {isDeployed ? "Deployed" : "Not Deployed"}
            </Badge>
          </div>
          {isDeployed && contractAddress && (
            <div className="text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Lock className="h-3 w-3" />
                <span>Confidential Mode</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
