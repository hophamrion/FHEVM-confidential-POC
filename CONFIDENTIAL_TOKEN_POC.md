# 🎯 PoC: Confidential Token Transfer - ERC-7984 Implementation

## 📋 Tổng quan

PoC này triển khai **"chuyển token ẩn số lượng"** theo chuẩn **ERC-7984 (Confidential Fungible Token)** chạy trên **fhEVM**. 

### ✨ Tính năng chính:
- 🔐 **Mint token ẩn**: Tạo token với số lượng được mã hóa (euint64)
- 💸 **Transfer ẩn**: Chuyển token mà không lộ số lượng trên blockchain
- 👁️ **Balance riêng tư**: Chỉ chủ sở hữu mới có thể xem số dư của mình
- 🔒 **On-chain privacy**: Số lượng được lưu trữ dưới dạng ciphertext

## 🏗️ Kiến trúc

### Smart Contracts
```
packages/fhevm-hardhat-template/
├── contracts/
│   └── ConfidentialToken.sol          # ERC-7984 implementation
├── deploy/
│   └── deployConfidentialToken.ts     # Deploy script
├── test/
│   └── ConfidentialToken.ts           # Unit tests
└── scripts/
    └── demoConfidentialToken.ts       # Demo script
```

### Frontend
```
packages/site/
├── hooks/
│   └── useConfidentialToken.tsx       # React hook
├── components/
│   └── ConfidentialTokenDemo.tsx      # UI component
└── scripts/
    └── genabiConfidentialToken.mjs    # ABI generator
```

## 🚀 Cài đặt và Chạy

### 1. Cài đặt Dependencies

```bash
# Cài đặt dependencies cho contracts
cd packages/fhevm-hardhat-template
npm install

# Cài đặt dependencies cho frontend
cd ../site
npm install
```

### 2. Cấu hình Environment

Tạo file `.env` trong `packages/fhevm-hardhat-template/`:
```env
MNEMONIC="your mnemonic phrase here"
INFURA_API_KEY="your infura api key"
```

### 3. Deploy Contracts

#### Local Development
```bash
# Terminal 1: Start Hardhat node
cd packages/fhevm-hardhat-template
npx hardhat node --verbose

# Terminal 2: Deploy to localhost
npx hardhat deploy --network localhost
```

#### Sepolia Testnet
```bash
npx hardhat deploy --network sepolia
```

### 4. Chạy Frontend

```bash
cd packages/site
npm run dev
```

Truy cập: `http://localhost:3000`

## 🧪 Testing

### Unit Tests
```bash
cd packages/fhevm-hardhat-template
npx hardhat test test/ConfidentialToken.ts
```

### Demo Script
```bash
npx hardhat run scripts/demoConfidentialToken.ts
```

### Frontend Testing
1. Kết nối MetaMask với Hardhat network (localhost:8545)
2. Sử dụng UI để test các chức năng:
   - Initialize address
   - Mint confidential tokens
   - Transfer confidential tokens
   - Decrypt balance

## 📱 Sử dụng UI

### 1. Khởi tạo Address
- Nhập địa chỉ cần khởi tạo
- Click "Initialize" để setup address

### 2. Mint Token (Owner only)
- Nhập số lượng token cần mint
- Click "Mint Tokens"
- Số lượng sẽ được mã hóa trước khi gửi

### 3. Transfer Token
- Nhập địa chỉ người nhận
- Nhập số lượng cần chuyển
- Click "Transfer Tokens"
- Số lượng được mã hóa và không lộ trên blockchain

### 4. Xem Balance
- Click "Refresh Balance" để lấy encrypted balance handle
- Click "Decrypt Balance" để xem số dư thực tế
- Chỉ bạn mới có thể xem số dư của mình

## 🔧 API Reference

### Smart Contract Functions

```solidity
// Initialize an address
function initializeAddress(address account) external

// Mint confidential tokens (owner only)
function mintConfidential(
    address to, 
    bytes calldata encryptedAmount, 
    bytes calldata proof
) external onlyOwner

// Transfer confidential tokens
function transferConfidential(
    address to,
    bytes calldata encryptedAmount,
    bytes calldata proof
) external

// Get encrypted balance
function getEncryptedBalance(address account) external view returns (euint64)

// Check if address is initialized
function isInitialized(address account) external view returns (bool)
```

### React Hook

```typescript
const {
  contractAddress,
  canDecrypt,
  canMint,
  canTransfer,
  initializeAddress,
  mintConfidential,
  transferConfidential,
  decryptBalanceHandle,
  clear: clearBalance,
  isDecrypted,
  message
} = useConfidentialToken({
  instance,
  fhevmDecryptionSignatureStorage,
  eip1193Provider: provider,
  chainId,
  ethersSigner,
  ethersReadonlyProvider,
  sameChain,
  sameSigner,
});
```

## 🔒 Bảo mật

### 1. Mã hóa Số lượng
- Tất cả amounts sử dụng `euint64` (encrypted uint64)
- Không thể xem số lượng trên blockchain explorer
- Chỉ có thể thực hiện phép toán FHE

### 2. Proof Verification
- Mỗi transaction cần proof từ FHEVM
- Đảm bảo tính hợp lệ của encrypted input
- Ngăn chặn double-spending

### 3. Access Control
- Chỉ owner có thể mint token
- Chỉ chủ sở hữu có thể xem balance
- Decryption oracle bảo vệ quyền riêng tư

## 🚀 Mở rộng Nâng cao

### 1. Multi-signature Minting
```solidity
// Thêm multi-sig cho minting operations
modifier onlyMultiSig() {
    require(multiSigApproved[msg.sender], "Not authorized");
    _;
}
```

### 2. Time-locked Transfers
```solidity
// Thêm time-lock cho transfers
mapping(address => uint256) public transferLocks;

function transferWithLock(address to, uint256 amount, uint256 lockTime) external {
    // Implementation
}
```

### 3. Batch Operations
```solidity
// Batch mint/transfer để giảm gas cost
function batchMint(address[] calldata recipients, uint256[] calldata amounts) external {
    // Implementation
}
```

### 4. Cross-chain Bridge
```solidity
// Bridge confidential tokens giữa các chains
function bridgeToChain(uint256 targetChain, uint256 amount) external {
    // Implementation
}
```

### 5. Advanced Access Control
```solidity
// Role-based permissions
mapping(address => Role) public userRoles;

enum Role { NONE, USER, MINTER, ADMIN }
```

## 🐛 Troubleshooting

### Common Issues

1. **Contract not deployed**
   ```bash
   # Chạy deploy script
   npx hardhat deploy --network localhost
   ```

2. **FHEVM not connected**
   ```bash
   # Kiểm tra FHEVM node
   curl http://localhost:8545 -X POST -H "Content-Type: application/json" \
     --data '{"jsonrpc":"2.0","method":"fhevm_relayer_metadata","params":[],"id":1}'
   ```

3. **Decryption failed**
   - Đảm bảo có quyền truy cập oracle
   - Kiểm tra FHEVM signature storage

4. **Gas estimation failed**
   - Tăng gas limit cho FHE operations
   - Sử dụng `--gas-limit` flag

### Debug Mode
```bash
# Enable debug logging
DEBUG=fhevm* npm run dev
```

## 📚 Tài liệu Tham khảo

- [ERC-7984 Specification](https://docs.openzeppelin.com/confidential-contracts/erc-7984/)
- [FHEVM Documentation](https://docs.zama.ai/protocol/solidity-guides/)
- [OpenZeppelin Confidential Contracts](https://github.com/OpenZeppelin/confidential-contracts)
- [Zama FHEVM](https://github.com/zama-ai/fhevm)

## 🎯 Kết luận

PoC này đã triển khai thành công:
- ✅ Smart contract ERC-7984 với mint/transfer ẩn
- ✅ Frontend React với UI thân thiện
- ✅ Integration với FHEVM SDK
- ✅ Tests và demo scripts
- ✅ Documentation đầy đủ

**Điểm nổi bật:**
- Số lượng token hoàn toàn ẩn trên blockchain
- Chỉ chủ sở hữu mới có thể xem balance
- Tương thích với chuẩn ERC-7984
- Sẵn sàng cho production với FHEVM setup

**Hướng phát triển:**
- Deploy lên Sepolia testnet
- Thêm các tính năng nâng cao
- Tối ưu gas costs
- Cross-chain integration
