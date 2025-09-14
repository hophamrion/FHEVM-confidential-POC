
/*
  This file is auto-generated.
  Command: 'npm run genabi:confidential'
*/
export const ConfidentialTokenFixedABI = {
  "abi": [
    "constructor()",
    "error OwnableInvalidOwner(address)",
    "error OwnableUnauthorizedAccount(address)",
    "event ConfidentialMint(address indexed,bytes32 indexed)",
    "event ConfidentialTransfer(address indexed,address indexed,bytes32 indexed)",
    "event OwnershipTransferred(address indexed,address indexed)",
    "function allowSelfBalanceDecrypt()",
    "function confidentialBalanceOf(address) view returns (bytes32)",
    "function decimals() view returns (uint8)",
    "function getEncryptedBalance(address) view returns (bytes32)",
    "function initializeAddress(address)",
    "function isInitialized(address) view returns (bool)",
    "function mintConfidential(address,bytes32,bytes)",
    "function name() view returns (string)",
    "function owner() view returns (address)",
    "function protocolId() pure returns (uint256)",
    "function renounceOwnership()",
    "function symbol() view returns (string)",
    "function transferConfidential(address,bytes32,bytes)",
    "function transferOwnership(address)"
  ]
} as const;

