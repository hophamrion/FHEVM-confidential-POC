"use client";

import { useState } from "react";
import { useConfidentialToken } from "@/hooks/useConfidentialToken";
import { useFhevm } from "@/fhevm/useFhevm";
import { useMetaMask } from "@/hooks/metamask/useMetaMaskProvider";
import { formatUnits } from "ethers";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { GenericStringStorage } from "@/fhevm/GenericStringStorage";

export function ConfidentialTokenDemo() {
  const [mintAmount, setMintAmount] = useState<string>("100");
  const [transferAmount, setTransferAmount] = useState<string>("50");
  const [transferTo, setTransferTo] = useState<string>("");
  const [initializeAddress, setInitializeAddress] = useState<string>("");

  // MetaMask provider and signer
  const { provider, chainId, connect, isConnected } = useMetaMask();
  const { ethersSigner, ethersReadonlyProvider } = useMetaMaskEthersSigner();

  // FHEVM instance
  const { instance } = useFhevm({
    provider,
    chainId,
  });

  // Storage for decryption signatures
  const fhevmDecryptionSignatureStorage = useInMemoryStorage();

  // Same chain/signer refs for stale detection
  const sameChain = { current: (id: number | undefined) => id === chainId };
  const sameSigner = { current: (signer: any) => signer === ethersSigner };

  // ConfidentialToken hook
  const {
    contractAddress,
    canDecrypt,
    canGetBalance,
    canInitialize,
    canMint,
    canTransfer,
    initializeAddress: initAddress,
    mintConfidential,
    transferConfidential,
    decryptBalanceHandle,
    refreshBalanceHandle,
    resetDecryptSession,
    isDecrypted,
    message,
    clear: clearBalance,
    handle: balanceHandle,
    isDecrypting,
    isRefreshing,
    isMinting,
    isTransferring,
    isInitializing,
    isDeployed,
  } = useConfidentialToken({
    instance,
    fhevmDecryptionSignatureStorage: fhevmDecryptionSignatureStorage as any,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  const handleMint = () => {
    const amount = parseFloat(mintAmount);
    if (amount > 0 && ethersSigner) {
      mintConfidential(ethersSigner.address, amount);
    }
  };

  const handleTransfer = () => {
    const amount = parseFloat(transferAmount);
    if (amount > 0 && transferTo && ethersSigner) {
      transferConfidential(transferTo, amount);
    }
  };

  const handleInitialize = () => {
    if (initializeAddress && ethersSigner) {
      initAddress(initializeAddress);
    }
  };

  if (!isDeployed) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            ConfidentialToken Not Deployed
          </h2>
          <p className="text-red-600">
            The ConfidentialToken contract is not deployed on this network (Chain ID: {chainId}).
            Please deploy the contract first or switch to a network where it's deployed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Confidential Token Demo
        </h1>
        
        {/* Connect Wallet Section */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-lg font-semibold text-green-800 mb-2">Connect Wallet</h2>
          {!isConnected ? (
            <div>
              <p className="text-green-600 mb-4">Connect your MetaMask wallet to interact with the contract.</p>
              <button
                onClick={connect}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Connect MetaMask
              </button>
            </div>
          ) : (
            <div>
              <p className="text-green-600">
                <strong>Connected:</strong> {ethersSigner?.address}
              </p>
              <p className="text-green-600">
                <strong>Chain ID:</strong> {chainId}
              </p>
            </div>
          )}
        </div>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Contract Info</h2>
          <p className="text-blue-600">
            <strong>Address:</strong> {contractAddress}
          </p>
          <p className="text-blue-600">
            <strong>Chain ID:</strong> {chainId}
          </p>
        </div>

        {/* Balance Section */}
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Balance</h2>
          
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={refreshBalanceHandle}
              disabled={!canGetBalance || !isConnected}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isRefreshing ? "Refreshing..." : "Refresh Balance"}
            </button>
            
            <button
              onClick={decryptBalanceHandle}
              disabled={!canDecrypt || !isConnected}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isDecrypting ? "Decrypting..." : "Decrypt Balance"}
            </button>
            
            <button
              onClick={resetDecryptSession}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Reset Decrypt Session
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-gray-600">
              <strong>Encrypted Balance Handle:</strong> {balanceHandle || "Not loaded"}
            </p>
            {isDecrypted && clearBalance && (
              <p className="text-green-600 font-semibold">
                <strong>Decrypted Balance:</strong> {formatUnits(clearBalance, 6)} CT
              </p>
            )}
          </div>
        </div>

        {/* Initialize Address Section */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="text-lg font-semibold text-yellow-800 mb-4">Initialize Address</h2>
          <p className="text-yellow-600 mb-4">
            Initialize an address before it can receive confidential tokens.
          </p>
          
          <div className="flex gap-4">
            <input
              type="text"
              value={initializeAddress}
              onChange={(e) => setInitializeAddress(e.target.value)}
              placeholder="0x..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleInitialize}
              disabled={!canInitialize || !initializeAddress || !isConnected}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isInitializing ? "Initializing..." : "Initialize"}
            </button>
          </div>
        </div>

        {/* Mint Section */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-lg font-semibold text-green-800 mb-4">Mint Confidential Tokens</h2>
          <p className="text-green-600 mb-4">
            Mint confidential tokens to your address. Only the contract owner can mint.
          </p>
          
          <div className="flex gap-4">
            <input
              type="number"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              placeholder="Amount to mint (in CT)"
              min="0.000001"
              step="0.000001"
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleMint}
              disabled={!canMint || !mintAmount || parseFloat(mintAmount) <= 0 || !isConnected}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isMinting ? "Minting..." : "Mint Tokens"}
            </button>
          </div>
        </div>

        {/* Transfer Section */}
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h2 className="text-lg font-semibold text-purple-800 mb-4">Transfer Confidential Tokens</h2>
          <p className="text-purple-600 mb-4">
            Transfer confidential tokens to another address. The amount will be encrypted.
          </p>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                placeholder="Recipient address (0x...)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-4">
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="Amount to transfer (in CT)"
                min="0.000001"
                step="0.000001"
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleTransfer}
                disabled={!canTransfer || !transferTo || !transferAmount || parseFloat(transferAmount) <= 0 || !isConnected}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isTransferring ? "Transferring..." : "Transfer Tokens"}
              </button>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Status</h3>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">How it works</h3>
          <ul className="text-gray-600 space-y-1 text-sm">
            <li>• <strong>Initialize:</strong> Set up an address to receive confidential tokens</li>
            <li>• <strong>Mint:</strong> Create confidential tokens (owner only)</li>
            <li>• <strong>Transfer:</strong> Send confidential tokens to another address</li>
            <li>• <strong>Decrypt:</strong> View your own balance (only you can see the amount)</li>
            <li>• <strong>Privacy:</strong> All amounts are encrypted on-chain and invisible to others</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
