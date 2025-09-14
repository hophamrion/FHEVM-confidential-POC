// Auto-generated from Hardhat artifacts
// Run 'npm run load-artifacts' to update this file

export const CONTRACT_ABI = [
  "constructor()",
  "function name() external view returns (string)",
  "function symbol() external view returns (string)", 
  "function decimals() external view returns (uint8)",
  "function owner() external view returns (address)",
  "function getEncryptedBalance(address account) external view returns (bytes32)",
  "function confidentialBalanceOf(address account) external view returns (bytes32)",
  "function confidentialAllowance(address owner, address spender) external view returns (bytes32)",
  "function encryptedTotalSupply() external view returns (bytes32)",
  "function isInitialized(address account) external view returns (bool)",
  "function initializeAddress(address account) external",
  "function allowSelfBalanceDecrypt() external",
  "function mintConfidential(address to, bytes32 encAmount, bytes proof) external",
  "function transferConfidential(address to, bytes32 encAmount, bytes proof) external",
  "function batchTransferConfidential(address[] calldata to, bytes32[] calldata encAmounts, bytes calldata proof) external",
  "function approveConfidential(address spender, bytes32 encAmount, bytes calldata proof) external",
  "function transferFromConfidential(address from, address to, bytes32 encAmount, bytes calldata proof) external",
  "function burnConfidential(bytes32 encAmount, bytes calldata proof) external",
  "event ConfidentialMint(address indexed to, bytes32 indexed encHash)",
  "event ConfidentialTransfer(address indexed from, address indexed to, bytes32 indexed encHash)",
  "event ConfidentialBatchTransfer(address indexed from, uint256 count)",
  "event ConfidentialApproval(address indexed owner, address indexed spender, bytes32 indexed encHash)",
  "event ConfidentialBurn(address indexed from, bytes32 indexed encHash)"
];

export const CONTRACT_BYTECODE = "0x608060405234801561001057600080fd5b506004361061..."; // Placeholder

export const CONTRACT_DEPLOYED_BYTECODE = "0x608060405234801561001057600080fd5b506004361061..."; // Placeholder