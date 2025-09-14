# 🏗️ Registry On-Chain System

## 📋 Tổng quan

Hệ thống **Registry on-chain** thay thế localStorage bằng một giải pháp chuyên nghiệp hơn, cho phép nhiều người dùng chia sẻ và quản lý địa chỉ contract một cách minh bạch và bảo mật.

## 🎯 Kiến trúc hệ thống

### **CTRegistry Contract**
- **Mục đích**: Lưu trữ danh bạ `owner → slug → [versions]`
- **Tính năng**: 
  - Tra cứu: `latest(owner, slug)` → địa chỉ token hiện hành
  - Lịch sử: `getByVersion(owner, slug, version)` → phiên bản cụ thể
  - Đếm: `count(owner, slug)` → số lượng phiên bản

### **CTFactory Contract**
- **Mục đích**: Deploy + Register trong 1 transaction
- **Tính năng**:
  - `deployAndRegister(slug)` → deploy token + transfer ownership + register
  - Tự động whitelist factory trong registry
  - Event `Deployed(owner, token, slug)`

## 🚀 Workflow hoàn chỉnh

### **1. Deploy Registry & Factory**
```bash
cd packages/fhevm-hardhat-template
npx hardhat run deploy/deployRegistry.ts --network sepolia
```

### **2. Frontend Integration**
```typescript
// Factory Deploy (1-Click)
const factory = new ethers.Contract(factoryAddress, CTFactoryABI, signer);
const tx = await factory.deployAndRegister("main");
await tx.wait();

// Registry Lookup
const registry = new ethers.Contract(registryAddress, CTRegistryABI, provider);
const tokenAddress = await registry.latest(userAddress, "main");
```

### **3. App Usage**
- **Auto-detection**: Hook tự động lookup từ Registry
- **Fallback**: Sử dụng localStorage nếu Registry không có
- **Multiple slugs**: "main", "payroll", "airdrop-2025"

## 📱 UI Features

### **Deploy Page (`/deploy`)**
- **3 Tabs**: Factory (1-Click), Manual Deploy, Use Existing
- **Registry Info**: Hiển thị Registry và Factory addresses
- **Slug Input**: Tùy chỉnh project identifier
- **Progress Tracking**: Loading states và results

### **Factory Benefits**
- ✅ Deploy + Register trong 1 transaction
- ✅ Automatic ownership transfer
- ✅ On-chain registry cho easy lookup
- ✅ Multiple versions per slug

### **Manual Deploy**
- ✅ Deploy contract trước
- ✅ Register to registry sau
- ✅ 2 separate transactions
- ✅ More control over process

## 🔧 Technical Implementation

### **Contract Structure**
```solidity
// CTRegistry
struct Entry {
    address token;
    uint64  chainId;
    uint64  createdAt;
}

mapping(address => mapping(bytes32 => Entry[])) private _book;

// CTFactory
function deployAndRegister(string calldata slug) external returns (address token) {
    ConfidentialTokenFixed t = new ConfidentialTokenFixed();
    t.transferOwnership(msg.sender);
    registry.registerFor(msg.sender, address(t), slug);
    return address(t);
}
```

### **Frontend Integration**
```typescript
// Registry Lookup
async function lookupFromRegistry(
  ownerAddress: string,
  slug: string = "main",
  chainId: number,
  provider: any
): Promise<string | null> {
  const registry = new ethers.Contract(registryAddress, CTRegistryABI, provider);
  return await registry.latest(ownerAddress, slug);
}

// Hook Integration
const { contractAddress } = useConfidentialToken({
  // Auto-detects from Registry or localStorage
});
```

## 🎯 Use Cases

### **1. Multi-User Projects**
- **Team**: Nhiều developer cùng project
- **Sharing**: Chia sẻ contract address qua slug
- **Versions**: Deploy nhiều phiên bản, latest luôn available

### **2. Production Deployment**
- **Deterministic**: Địa chỉ có thể predict được
- **Transparent**: Tất cả deployments visible on-chain
- **Scalable**: Không giới hạn số lượng projects

### **3. Development Workflow**
- **Local**: Deploy local với slug "dev"
- **Testnet**: Deploy testnet với slug "test"
- **Mainnet**: Deploy mainnet với slug "main"

## 🔒 Security Features

### **Ownership Verification**
```solidity
// Registry chỉ accept token nếu caller là owner
require(IOwnable(token).owner() == msg.sender, "not token owner");

// Factory tự động transfer ownership
t.transferOwnership(msg.sender);
```

### **Registrar Whitelist**
```solidity
// Chỉ whitelisted contracts có thể register thay user
require(isRegistrar[msg.sender], "unauthorized registrar");
```

### **EOA Protection**
```solidity
// PoC: chỉ EOA có thể set registrar
require(tx.origin == msg.sender, "EOA only (demo)");
```

## 📊 Registry Queries

### **Basic Lookup**
```typescript
// Latest version
const latest = await registry.latest(owner, "main");

// Specific version
const version = await registry.getByVersion(owner, "main", 0);

// Count versions
const count = await registry.count(owner, "main");
```

### **Event Monitoring**
```typescript
// Listen for new deployments
registry.on("Registered", (owner, slugKey, token, version) => {
  console.log(`New deployment: ${token} for ${owner}`);
});

// Listen for factory deployments
factory.on("Deployed", (owner, token, slug) => {
  console.log(`Factory deployed: ${token} for ${owner}`);
});
```

## 🚀 Advanced Features

### **Multiple Slugs**
- **"main"**: Production contract
- **"payroll"**: Payroll system
- **"airdrop-2025"**: Airdrop campaign
- **"dev"**: Development testing

### **Version History**
- **v0**: First deployment
- **v1**: Updated contract
- **v2**: Latest version
- **Rollback**: Có thể rollback về version cũ

### **Global Aliases** (Future)
- **Public slugs**: Ai cũng có thể đọc được
- **Organization ownership**: Tổ chức quản lý public contracts
- **Cross-chain**: Registry cho multiple chains

## 🧪 Testing Workflow

### **1. Deploy Infrastructure**
```bash
# Deploy Registry + Factory
npx hardhat run deploy/deployRegistry.ts --network sepolia

# Update addresses in frontend
# CTRegistryAddresses.ts
# CTFactoryAddresses.ts
```

### **2. Test Factory Deploy**
```typescript
// 1-Click deploy
const tx = await factory.deployAndRegister("test");
await tx.wait();

// Verify in registry
const address = await registry.latest(userAddress, "test");
console.log("Deployed:", address);
```

### **3. Test Manual Deploy**
```typescript
// Deploy manually
const token = await deployContract();
await token.transferOwnership(userAddress);

// Register manually
await registry.register(tokenAddress, "test");
```

### **4. Test Lookup**
```typescript
// App should auto-detect
const { contractAddress } = useConfidentialToken();
console.log("Detected:", contractAddress);
```

## 🎉 Benefits

### **vs localStorage**
- ✅ **Shared**: Nhiều user cùng access
- ✅ **Transparent**: Visible on-chain
- ✅ **Persistent**: Không bị mất khi clear browser
- ✅ **Versioned**: Lịch sử deployments

### **vs Hardcoded Addresses**
- ✅ **Dynamic**: Deploy mới không cần update code
- ✅ **Flexible**: Multiple projects per user
- ✅ **Scalable**: Không giới hạn số lượng

### **vs Manual Management**
- ✅ **Automated**: Factory tự động register
- ✅ **Standardized**: Consistent workflow
- ✅ **Error-proof**: Không thể quên register

## 🔮 Future Enhancements

### **CREATE2 Support**
- **Deterministic addresses**: Địa chỉ có thể predict
- **Salt-based deployment**: Custom salt cho địa chỉ
- **Upgradeable**: Có thể upgrade contract

### **Cross-Chain Registry**
- **Multi-chain**: Registry cho nhiều chains
- **Bridge integration**: Cross-chain token transfers
- **Universal lookup**: Same slug across chains

### **Graph Integration**
- **Subgraph**: Index events cho UI
- **Analytics**: Deployment statistics
- **Search**: Find contracts by metadata

## 🎯 Kết luận

Hệ thống **Registry on-chain** cung cấp:
- **Professional**: Giải pháp enterprise-grade
- **Scalable**: Hỗ trợ multiple projects và users
- **Transparent**: Tất cả deployments visible
- **Flexible**: Nhiều deployment strategies

**Perfect cho production và team collaboration!** 🚀
