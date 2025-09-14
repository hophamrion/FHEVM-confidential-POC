// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title ConfidentialTokenExtended
 * @dev Extended version with Batch Send, Allowance, and Burn functionality
 *      All amounts use euint64 with 6 decimals for privacy
 */
contract ConfidentialTokenExtended is Ownable, SepoliaConfig {
    // Events
    event ConfidentialMint(address indexed to, bytes32 indexed encHash);
    event ConfidentialTransfer(address indexed from, address indexed to, bytes32 indexed encHash);
    event ConfidentialBatchTransfer(address indexed from, uint256 count);
    event ConfidentialApproval(address indexed owner, address indexed spender, bytes32 indexed encHash);
    event ConfidentialBurn(address indexed from, bytes32 indexed encHash);

    // Constants
    uint256 public constant MAX_BATCH = 100;

    // Metadata
    string public name;
    string public symbol;
    uint8 public decimals;

    // State
    mapping(address => bool) private _initialized;
    mapping(address => euint64) private _balances;
    mapping(address => mapping(address => euint64)) private _allowances;
    euint64 private _totalSupply;

    constructor()
        Ownable(msg.sender)
        SepoliaConfig()
    {
        name = "ConfidentialToken";
        symbol = "CT";
        decimals = 6;
    }

    // ------------------------
    // Helpers
    // ------------------------

    function _persistBalance(address who) internal {
        FHE.allowThis(_balances[who]);
        FHE.allow(_balances[who], who);
    }

    function _persistAllowance(address owner, address spender) internal {
        FHE.allowThis(_allowances[owner][spender]);
        FHE.allow(_allowances[owner][spender], owner);
        FHE.allow(_allowances[owner][spender], spender);
    }

    function _ensureInit(address who) internal {
        if (!_initialized[who]) {
            _initialized[who] = true;
            _balances[who] = FHE.asEuint64(0);
            _persistBalance(who);
        }
    }

    // ------------------------
    // View Functions
    // ------------------------

    function getEncryptedBalance(address account) external view returns (euint64) {
        return _balances[account];
    }

    function confidentialBalanceOf(address account) external view returns (euint64) {
        return _balances[account];
    }

    function confidentialAllowance(address owner, address spender) external view returns (euint64) {
        return _allowances[owner][spender];
    }

    function encryptedTotalSupply() external view returns (euint64) {
        return _totalSupply;
    }

    function isInitialized(address account) external view returns (bool) {
        return _initialized[account];
    }

    // ------------------------
    // Initialization
    // ------------------------

    function initializeAddress(address account) external {
        require(!_initialized[account], "Already initialized");
        _ensureInit(account);
    }

    function allowSelfBalanceDecrypt() external {
        _ensureInit(msg.sender);
        euint64 bal = _balances[msg.sender];
        FHE.allow(bal, msg.sender);
    }

    // ------------------------
    // Mint (Owner only)
    // ------------------------

    function mintConfidential(
        address to,
        externalEuint64 encAmount,
        bytes calldata proof
    ) external onlyOwner {
        _ensureInit(to);

        euint64 amt = FHE.fromExternal(encAmount, proof);
        _balances[to] = FHE.add(_balances[to], amt);
        _totalSupply = FHE.add(_totalSupply, amt);

        _persistBalance(to);
        FHE.allowThis(_totalSupply);

        emit ConfidentialMint(to, keccak256(abi.encode(encAmount)));
    }

    // ------------------------
    // Transfer
    // ------------------------

    function transferConfidential(
        address to,
        externalEuint64 encAmount,
        bytes calldata proof
    ) external {
        _ensureInit(msg.sender);
        _ensureInit(to);

        euint64 amt = FHE.fromExternal(encAmount, proof);
        euint64 fromBal = _balances[msg.sender];
        euint64 toBal = _balances[to];

        ebool lt = FHE.lt(fromBal, amt);
        euint64 delta = FHE.select(lt, fromBal, amt);

        _balances[msg.sender] = FHE.sub(fromBal, delta);
        _balances[to] = FHE.add(toBal, delta);

        _persistBalance(msg.sender);
        _persistBalance(to);

        emit ConfidentialTransfer(msg.sender, to, keccak256(abi.encode(encAmount)));
    }

    // ------------------------
    // Batch Transfer
    // ------------------------

    function batchTransferConfidential(
        address[] calldata to,
        externalEuint64[] calldata encAmounts,
        bytes calldata proof
    ) external {
        uint256 n = to.length;
        require(n == encAmounts.length, "Length mismatch");
        require(n > 0 && n <= MAX_BATCH, "Invalid batch size");

        _ensureInit(msg.sender);

        euint64 fromBal = _balances[msg.sender];

        for (uint256 i = 0; i < n; i++) {
            address recipient = to[i];
            _ensureInit(recipient);

            euint64 amt = FHE.fromExternal(encAmounts[i], proof);
            ebool lt = FHE.lt(fromBal, amt);
            euint64 delta = FHE.select(lt, fromBal, amt);

            fromBal = FHE.sub(fromBal, delta);
            _balances[recipient] = FHE.add(_balances[recipient], delta);

            _persistBalance(recipient);
            emit ConfidentialTransfer(msg.sender, recipient, keccak256(abi.encode(encAmounts[i])));
        }

        _balances[msg.sender] = fromBal;
        _persistBalance(msg.sender);

        emit ConfidentialBatchTransfer(msg.sender, n);
    }

    // ------------------------
    // Allowance
    // ------------------------

    function approveConfidential(
        address spender,
        externalEuint64 encAmount,
        bytes calldata proof
    ) external {
        _ensureInit(msg.sender);
        _ensureInit(spender);

        euint64 amt = FHE.fromExternal(encAmount, proof);
        _allowances[msg.sender][spender] = amt;

        _persistAllowance(msg.sender, spender);

        emit ConfidentialApproval(msg.sender, spender, keccak256(abi.encode(encAmount)));
    }

    function transferFromConfidential(
        address from,
        address to,
        externalEuint64 encAmount,
        bytes calldata proof
    ) external {
        _ensureInit(from);
        _ensureInit(to);

        euint64 amt = FHE.fromExternal(encAmount, proof);
        euint64 fromBal = _balances[from];
        euint64 allowance = _allowances[from][msg.sender];

        // delta = min(balance, allowance, amount)
        ebool bal_lt_amt = FHE.lt(fromBal, amt);
        euint64 min1 = FHE.select(bal_lt_amt, fromBal, amt);
        ebool allo_lt_min1 = FHE.lt(allowance, min1);
        euint64 delta = FHE.select(allo_lt_min1, allowance, min1);

        _balances[from] = FHE.sub(fromBal, delta);
        _balances[to] = FHE.add(_balances[to], delta);
        _allowances[from][msg.sender] = FHE.sub(allowance, delta);

        _persistBalance(from);
        _persistBalance(to);
        _persistAllowance(from, msg.sender);

        emit ConfidentialTransfer(from, to, keccak256(abi.encode(encAmount)));
    }

    // ------------------------
    // Burn
    // ------------------------

    function burnConfidential(
        externalEuint64 encAmount,
        bytes calldata proof
    ) external {
        _ensureInit(msg.sender);

        euint64 amt = FHE.fromExternal(encAmount, proof);
        euint64 balance = _balances[msg.sender];

        ebool lt = FHE.lt(balance, amt);
        euint64 delta = FHE.select(lt, balance, amt);

        _balances[msg.sender] = FHE.sub(balance, delta);
        _totalSupply = FHE.sub(_totalSupply, delta);

        _persistBalance(msg.sender);
        FHE.allowThis(_totalSupply);

        emit ConfidentialBurn(msg.sender, keccak256(abi.encode(encAmount)));
    }
}
