# Confidential Token PoC - ERC-7984 Implementation

## Tổng quan

PoC này triển khai "chuyển token ẩn số lượng" theo chuẩn ERC-7984 (Confidential Fungible Token) chạy trên fhEVM. Token cho phép:

- **Mint token ẩn**: Tạo token với số lượng được mã hóa
- **Transfer ẩn**: Chuyển token mà không lộ số lượng
- **Balance riêng tư**: Chỉ chủ sở hữu mới có thể xem số dư của mình
- **On-chain privacy**: Số lượng được lưu trữ dưới dạng ciphertext (euint64)

## Kiến trúc

### Smart Contract
- **ConfidentialToken.sol**: Kế thừa ERC-7984 từ OpenZeppelin
- Sử dụng `euint64` cho tất cả số lượng
- FHEVM oracle để giải mã balance
- Access control cho minting

### Frontend
- **useConfidentialToken.tsx**: React hook tương tác với contract
- **ConfidentialTokenDemo.tsx**: UI component demo
- Tích hợp với FHEVM SDK để mã hóa/giải mã

## Cài đặt và Chạy

### 1. Cài đặt Dependencies

```bash
cd packages/fhevm-hardhat-template
npm install
```

### 2. Cấu hình Hardhat

Tạo file `.env` với:
```
MNEMONIC="your mnemonic phrase"
INFURA_API_KEY="your infura key"
```

### 3. Deploy Contract

#### Local Development
```bash
# Terminal 1: Start Hardhat node
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

## Sử dụng

### 1. Khởi tạo Address
Trước khi nhận token, địa chỉ cần được khởi tạo:
```solidity
confidentialToken.initializeAddress(userAddress);
```

### 2. Mint Token (Owner only)
```solidity
// Frontend sẽ mã hóa amount và tạo proof
confidentialToken.mintConfidential(to, encryptedAmount, proof);
```

### 3. Transfer Token
```solidity
// Frontend mã hóa amount trước khi gửi
confidentialToken.transferConfidential(to, encryptedAmount, proof);
```

### 4. Xem Balance
```solidity
// Chỉ chủ sở hữu mới có thể giải mã
euint64 balance = confidentialToken.getEncryptedBalance(account);
```

## Tính năng Bảo mật

### 1. Mã hóa Số lượng
- Tất cả amounts được lưu dưới dạng `euint64`
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

## Testing

### Unit Tests
```bash
npx hardhat test test/ConfidentialToken.ts
```

### Integration Tests
```bash
npx hardhat test test/ConfidentialTokenSepolia.ts --network sepolia
```

## Mở rộng Nâng cao

### 1. Multi-signature Minting
- Thêm multi-sig cho minting operations
- Tăng cường bảo mật cho token creation

### 2. Time-locked Transfers
- Thêm time-lock cho transfers
- Compliance và regulatory features

### 3. Batch Operations
- Batch mint/transfer để giảm gas cost
- Efficient cho large-scale operations

### 4. Cross-chain Bridge
- Bridge confidential tokens giữa các chains
- Maintain privacy across networks

### 5. Advanced Access Control
- Role-based permissions
- Granular control over operations

## Lưu ý Quan trọng

1. **FHEVM Setup**: Cần cấu hình đúng FHEVM node và oracle
2. **Gas Costs**: FHE operations tốn gas hơn operations thông thường
3. **Network Support**: Hiện tại hỗ trợ Sepolia và local devnet
4. **Key Management**: Cần quản lý private keys cẩn thận cho decryption

## Troubleshooting

### Common Issues

1. **Contract not deployed**: Chạy deploy script trước
2. **FHEVM not connected**: Kiểm tra network configuration
3. **Decryption failed**: Đảm bảo có quyền truy cập oracle
4. **Gas estimation failed**: Tăng gas limit cho FHE operations

### Debug Mode
```bash
# Enable debug logging
DEBUG=fhevm* npm run dev
```

## Tài liệu Tham khảo

- [ERC-7984 Specification](https://docs.openzeppelin.com/confidential-contracts/erc-7984/)
- [FHEVM Documentation](https://docs.zama.ai/protocol/solidity-guides/)
- [OpenZeppelin Confidential Contracts](https://github.com/OpenZeppelin/confidential-contracts)
- [Zama FHEVM](https://github.com/zama-ai/fhevm)
