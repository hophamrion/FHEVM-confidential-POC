"use client";

import { useState } from "react";

export function ConfidentialTokenDemoMock() {
  const [mintAmount, setMintAmount] = useState<string>("100");
  const [transferAmount, setTransferAmount] = useState<string>("50");
  const [transferTo, setTransferTo] = useState<string>("");
  const [initializeAddress, setInitializeAddress] = useState<string>("");
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [message, setMessage] = useState<string>("Demo mode - Mock implementation");
  const [userAddress, setUserAddress] = useState<string>("0x963a2d0BE2eb5d785C6E73ec904fcE8d65691773");
  const [contractAddress, setContractAddress] = useState<string>("0x1234567890123456789012345678901234567890");
  const [checkBalanceAddress, setCheckBalanceAddress] = useState<string>("");

  const handleMint = () => {
    const amount = parseInt(mintAmount);
    if (amount > 0) {
      setBalances(prev => ({
        ...prev,
        [userAddress]: (prev[userAddress] || 0) + amount
      }));
      setMessage(`✅ Minted ${amount} CT tokens to ${userAddress}! (Mock)`);
    }
  };

  const handleTransfer = () => {
    const amount = parseInt(transferAmount);
    const fromBalance = balances[userAddress] || 0;
    
    if (amount > 0 && transferTo && amount <= fromBalance) {
      setBalances(prev => ({
        ...prev,
        [userAddress]: prev[userAddress] - amount,
        [transferTo]: (prev[transferTo] || 0) + amount
      }));
      setMessage(`✅ Transferred ${amount} CT from ${userAddress} to ${transferTo}! (Mock)`);
    } else if (amount > fromBalance) {
      setMessage(`❌ Insufficient balance! You have ${fromBalance} CT, trying to transfer ${amount} CT`);
    }
  };

  const handleInitialize = () => {
    if (initializeAddress) {
      setMessage(`✅ Initialized address ${initializeAddress}! (Mock)`);
    }
  };

  const handleDecrypt = () => {
    const balance = balances[userAddress] || 0;
    setMessage(`🔓 Decrypted balance for ${userAddress}: ${balance} CT (Mock)`);
  };

  const handleCheckBalance = () => {
    if (checkBalanceAddress) {
      const balance = balances[checkBalanceAddress] || 0;
      setMessage(`🔍 Balance for ${checkBalanceAddress}: ${balance} CT (Mock)`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🔐 Confidential Token Demo (Mock Mode)
        </h1>
        
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Mock Mode</h2>
          <p className="text-yellow-600">
            This is a mock implementation for testing the UI. In production, this would use FHEVM for real encryption.
          </p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Contract Info</h2>
          <div className="space-y-2">
            <div className="flex gap-4">
              <input
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="Contract Address"
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-4">
              <input
                type="text"
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
                placeholder="Your Address"
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-blue-600">
              <strong>Chain ID:</strong> 31337 (Mock)
            </p>
          </div>
        </div>

        {/* Balance Section */}
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Balance</h2>
          
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setMessage("🔄 Balance refreshed! (Mock)")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh Balance
            </button>
            
            <button
              onClick={handleDecrypt}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Decrypt Balance
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-gray-600">
              <strong>Encrypted Balance Handle:</strong> 0x{contractAddress.slice(2, 10)}...{contractAddress.slice(-8)} (Mock)
            </p>
            <p className="text-green-600 font-semibold">
              <strong>Decrypted Balance:</strong> {balances[userAddress] || 0} CT
            </p>
            <p className="text-gray-600 text-sm">
              <strong>Address:</strong> {userAddress}
            </p>
          </div>
        </div>

        {/* Check Balance Section */}
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <h2 className="text-lg font-semibold text-indigo-800 mb-4">Check Balance</h2>
          <p className="text-indigo-600 mb-4">
            Check the balance of any address.
          </p>
          
          <div className="flex gap-4">
            <input
              type="text"
              value={checkBalanceAddress}
              onChange={(e) => setCheckBalanceAddress(e.target.value)}
              placeholder="Address to check (0x...)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleCheckBalance}
              disabled={!checkBalanceAddress}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Check Balance
            </button>
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
              disabled={!initializeAddress}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Initialize
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
              placeholder="Amount to mint"
              min="1"
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleMint}
              disabled={!mintAmount || parseInt(mintAmount) <= 0}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Mint Tokens
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
                placeholder="Amount to transfer"
                min="1"
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleTransfer}
                disabled={!transferTo || !transferAmount || parseInt(transferAmount) <= 0 || parseInt(transferAmount) > (balances[userAddress] || 0)}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Transfer Tokens
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
          <h3 className="text-lg font-semibold text-gray-800 mb-2">How it works (Mock Mode)</h3>
          <ul className="text-gray-600 space-y-1 text-sm">
            <li>• <strong>Initialize:</strong> Set up an address to receive confidential tokens</li>
            <li>• <strong>Mint:</strong> Create confidential tokens (owner only)</li>
            <li>• <strong>Transfer:</strong> Send confidential tokens to another address</li>
            <li>• <strong>Decrypt:</strong> View your own balance (only you can see the amount)</li>
            <li>• <strong>Privacy:</strong> All amounts are encrypted on-chain and invisible to others</li>
            <li>• <strong>Note:</strong> This is a mock implementation for UI testing</li>
          </ul>
        </div>

        {/* Next Steps */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Next Steps</h3>
          <ul className="text-blue-600 space-y-1 text-sm">
            <li>• Set up FHEVM node for real encryption</li>
            <li>• Deploy ConfidentialToken contract</li>
            <li>• Connect to real blockchain network</li>
            <li>• Test with actual encrypted operations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
