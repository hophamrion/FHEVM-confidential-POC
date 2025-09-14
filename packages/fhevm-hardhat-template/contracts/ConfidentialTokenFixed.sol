// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title ConfidentialTokenFixed
 * @dev PoC: số dư/amount ở dạng euint64; nhận input kiểu externalEuint64 + proof
 *      Tính toán bằng FHE; không reveal plaintext. Đã clamp transfer để tránh underflow.
 */
contract ConfidentialTokenFixed is Ownable, SepoliaConfig {
    // Event chỉ log hash/handle để tránh lộ amount
    event ConfidentialMint(address indexed to, bytes32 indexed encHash);
    event ConfidentialTransfer(address indexed from, address indexed to, bytes32 indexed encHash);

    // Metadata: gợi ý dùng 6 dp cho demo
    string public name;
    string public symbol;
    uint8  public decimals;

    // Trạng thái
    mapping(address => bool)    private _initialized;
    mapping(address => euint64) private _balances;

    constructor()
        Ownable(msg.sender)
        SepoliaConfig() // cấu hình coprocessor + decryption oracle cho Sepolia
    {
        name = "ConfidentialToken";
        symbol = "CT";
        decimals = 6; // khớp UI: add64(amount * 10^6)
    }

    // ------------------------
    // Helpers (không lộ amount)
    // ------------------------

    function _persistBalance(address who) internal {
        // 1) Cho contract tái dùng ciphertext ở các tx sau
        FHE.allowThis(_balances[who]);
        // 2) Cho chính chủ ví được user-decrypt handle hiện tại
        FHE.allow(_balances[who], who);
    }

    function _ensureInit(address who) internal {
        if (!_initialized[who]) {
            _initialized[who] = true;
            _balances[who] = FHE.asEuint64(0);
            _persistBalance(who); // NEW
        }
    }

    /// @notice Cho chính chủ tự giải mã số dư qua user-decrypt (frontend)
    function allowSelfBalanceDecrypt() external {
        _ensureInit(msg.sender);
        euint64 bal = _balances[msg.sender];
        FHE.allow(bal, msg.sender); // cấp quyền decrypt cho chủ ví
    }

    // Alias để tương thích các hook/ABI khác nhau
    function getEncryptedBalance(address account) external view returns (euint64) {
        return _balances[account];
    }

    function confidentialBalanceOf(address account) external view returns (euint64) {
        return _balances[account];
    }

    function isInitialized(address account) external view returns (bool) {
        return _initialized[account];
    }

    function initializeAddress(address account) external {
        require(!_initialized[account], "Already initialized");
        _ensureInit(account);
    }

    // ------------------------
    // Mint (owner)
    // ------------------------

    /**
     * @dev Mint bí mật: nhận externalEuint64 + proof từ client → euint64
     * @param to Người nhận
     * @param encAmount externalEuint64 (handle do SDK tạo)
     * @param proof inputProof do SDK tạo
     */
    function mintConfidential(
        address to,
        externalEuint64 encAmount,
        bytes calldata proof
    ) external onlyOwner {
        _ensureInit(to);

        // Chuyển external → internal (verify context: contract, sender, chainId)
        euint64 amt = FHE.fromExternal(encAmount, proof);

        _balances[to] = FHE.add(_balances[to], amt);

        // Persist ACL cho balance đã cập nhật
        _persistBalance(to); // NEW

        // log hash của handle (hoặc chính handle) — không lộ plaintext
        emit ConfidentialMint(to, keccak256(abi.encode(encAmount)));
    }

    // ------------------------
    // Transfer (clamp để tránh underflow)
    // ------------------------

    /**
     * @dev Chuyển bí mật: clamp amount = min(balance, amount) để an toàn cho PoC.
     *     Nếu muốn "fail khi thiếu tiền" đúng nghĩa, cần reveal 1-bit ok qua oracle (phức tạp hơn).
     */
    function transferConfidential(
        address to,
        externalEuint64 encAmount,
        bytes calldata proof
    ) external {
        _ensureInit(msg.sender);
        _ensureInit(to);

        // amount (euint64) sau verify proof
        euint64 amt = FHE.fromExternal(encAmount, proof);

        euint64 fromBal = _balances[msg.sender];
        euint64 toBal   = _balances[to];

        // so sánh: fromBal < amt ? (ebool)
        ebool lt = FHE.lt(fromBal, amt);

        // delta = lt ? fromBal : amt
        euint64 delta = FHE.select(lt, fromBal, amt);

        // newFrom = fromBal - delta; newTo = toBal + delta
        _balances[msg.sender] = FHE.sub(fromBal, delta);
        _balances[to]         = FHE.add(toBal,   delta);

        // Persist ACL cho cả hai balance sau khi cập nhật
        _persistBalance(msg.sender); // NEW
        _persistBalance(to);         // NEW

        emit ConfidentialTransfer(msg.sender, to, keccak256(abi.encode(encAmount)));
    }
}