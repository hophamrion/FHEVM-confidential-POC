# 🚀 Deploy từ Frontend - Hướng dẫn sử dụng

## 📋 Tổng quan

Tính năng **Deploy từ Frontend** cho phép bạn deploy contract ConfidentialToken trực tiếp từ ví MetaMask mà không cần sử dụng terminal hay Hardhat CLI.

## 🎯 Nguyên tắc thiết kế

### ✅ **Tuân thủ gợi ý:**
- **Không nhúng private key** - Chỉ dùng ví trình duyệt
- **Sử dụng artifact đã compile** - Import từ JSON file
- **Kiểm tra chain Sepolia** - Chỉ deploy trên Sepolia testnet
- **Lưu localStorage** - Contract address được lưu local
- **Smoke test** - Tự động test sau deploy

### 🔒 **Bảo mật:**
- Người dùng chịu gas fees
- Deployer trở thành owner của contract
- Không cần private key trong code

## 🚀 Cách sử dụng

### Bước 1: Chuẩn bị
```bash
# Compile contract (nếu chưa có artifacts)
cd packages/fhevm-hardhat-template
npx hardhat compile

# Copy artifact vào frontend
cp artifacts/contracts/ConfidentialTokenFixed.sol/ConfidentialTokenFixed.json ../site/abi/
```

### Bước 2: Deploy từ Frontend
1. **Mở ứng dụng**: `npm run dev`
2. **Truy cập**: `/deploy`
3. **Connect wallet**: MetaMask
4. **Switch network**: Sepolia testnet (Chain ID: 11155111)
5. **Click "Deploy to Sepolia"**
6. **Confirm transaction** trong MetaMask

### Bước 3: Sử dụng Contract
- Contract address được lưu vào localStorage
- Frontend tự động detect và sử dụng contract mới
- Bạn trở thành owner với quyền mint

## 🔧 Technical Details

### Contract Artifact
```typescript
// Import artifact từ compiled contract
import artifact from "@/abi/ConfidentialTokenFixed.json";

// Deploy contract
const factory = new ethers.ContractFactory(
  artifact.abi,
  artifact.bytecode,
  ethersSigner
);
```

### LocalStorage Storage
```typescript
// Lưu contract address
const key = `ct:address:${chainId}`;
localStorage.setItem(key, contractAddress);
localStorage.setItem(`${key}:owner`, deployerAddress);
```

### Hook Integration
```typescript
// Hook tự động detect contract từ localStorage
const { contractAddress } = useConfidentialToken({
  // ... other params
});
```

## 📱 UI Features

### Deploy Page (`/deploy`)
- **Network Info**: Hiển thị network và chain ID
- **Deploy Button**: Deploy contract mới
- **Use Existing**: Nhập contract address có sẵn
- **Progress Tracking**: Loading states và progress bar
- **Result Display**: Contract address, owner, tx hash

### Auto-detection
- **localStorage priority**: Ưu tiên contract từ localStorage
- **Fallback**: Sử dụng generated addresses nếu không có
- **Network switching**: Tự động detect khi chuyển network

## 🧪 Smoke Test

Sau khi deploy, hệ thống tự động chạy smoke test:
1. **Initialize address**: Gọi `initializeAddress(deployer)`
2. **Verify contract**: Kiểm tra contract hoạt động
3. **Success message**: Hiển thị kết quả

## 🔄 Workflow hoàn chỉnh

### 1. Deploy Contract
```
User → Connect Wallet → Switch to Sepolia → Deploy → Save to localStorage
```

### 2. Use Contract
```
App → Load from localStorage → Initialize hook → Use in components
```

### 3. Switch Networks
```
User → Switch network → App → Load different contract → Update UI
```

## 📊 Features Available

### ✅ **Available (Current Contract)**
- **Overview**: Balance display và contract info
- **Send**: Single transfer (có Batch UI nhưng dùng single transfers)
- **Mint**: Mint tokens (owner only)
- **Deploy**: Deploy contract từ frontend

### 🔄 **Coming Soon (Extended Contract)**
- **Batch Send**: True batch transfers
- **Allowance**: Approve/transferFrom
- **Burn**: Burn tokens
- **Observers**: Grant view access
- **Advanced**: Strict mode, supply management

## 🎯 Owner Gating

### Owner Detection
```typescript
// Check if current user is owner
const isOwner = ethersSigner?.address === contractOwner;

// Show/hide owner-only features
{isOwner && <MintForm />}
```

### Owner Features
- **Mint tokens**: Chỉ owner có thể mint
- **Transfer ownership**: Có thể transfer quyền owner
- **Admin functions**: Các tính năng admin khác

## 🔧 Troubleshooting

### Common Issues

1. **"Please switch to Sepolia"**
   - Switch MetaMask to Sepolia testnet
   - Chain ID: 11155111

2. **"Deploy failed"**
   - Check Sepolia ETH balance
   - Ensure MetaMask is connected
   - Try again with higher gas

3. **"Contract not detected"**
   - Check localStorage for saved address
   - Try "Use Existing Contract" option
   - Deploy new contract

4. **"Not owner"**
   - Connect with the deployer wallet
   - Or use "Use Existing Contract" with owner address

### Debug Info
- **Developer tab**: Xem contract info và debug tools
- **Console logs**: Chi tiết deployment process
- **localStorage**: Check saved contract addresses

## 🚀 Production Ready

### Security
- ✅ No private keys in code
- ✅ User controls deployment
- ✅ Gas fees paid by user
- ✅ Owner permissions enforced

### Scalability
- ✅ localStorage per network
- ✅ Multiple contract support
- ✅ Easy network switching
- ✅ Fallback mechanisms

### User Experience
- ✅ One-click deployment
- ✅ Auto-detection
- ✅ Progress tracking
- ✅ Error handling

## 🎉 Kết luận

Tính năng **Deploy từ Frontend** cung cấp:
- **Easy deployment**: Không cần terminal
- **User control**: Người dùng tự deploy
- **Auto-integration**: Tự động tích hợp với app
- **Production ready**: Sẵn sàng cho production

**Perfect cho demo và development!** 🚀
