# 🎨 Confidential Token UI - ERC-7984 Demo

## 📋 Tổng quan

Giao diện mới được thiết kế theo kiểu **"dễ demo – dễ debug – sẵn đường mở rộng"** với sidebar navigation và các tính năng được phân chia rõ ràng theo vai trò người dùng.

## 🏗️ Kiến trúc UI

### Cấu trúc Layout
```
Header (Logo, Network, Contract Info, Wallet Connect)
├── Sidebar (Navigation Tabs)
└── Main Content (Page-specific components)
```

### Sidebar Navigation
- **Overview** - Dashboard và balance overview
- **Send** - Transfer confidential tokens
- **Mint** - Mint tokens (Owner only)
- **Burn** - Burn tokens (Coming Soon)
- **Allowance** - Approve spending (Coming Soon)
- **Observers** - Grant view access (Coming Soon)
- **Advanced** - Strict mode & Supply (Coming Soon)
- **Developer** - Debug tools và logs

## 🎯 Tính năng chính

### 1. Overview Page
- **BalanceCard**: Hiển thị encrypted balance handle và decrypted balance
- **Stats Grid**: Contract status, user role, privacy level
- **Token Information**: Chi tiết về token contract
- **Activity Feed**: Lịch sử giao dịch (placeholder)

### 2. Send Page
- **TransferForm**: Form chuyển token với validation
- **Privacy Notice**: Thông báo về tính bảo mật
- **Dev Info**: Thông tin debug (collapsible)

### 3. Mint Page (Owner Only)
- **MintForm**: Form mint token với owner validation
- **Owner Badge**: Hiển thị quyền owner
- **Mint to Self**: Nút tiện ích

### 4. Developer Page
- **Context Info**: Thông tin contract và wallet
- **Balance Debug**: Debug balance operations
- **ACL Tests**: Test access control
- **Error Decoder**: Giải thích lỗi thường gặp
- **Performance**: Metrics thời gian

## 🎨 Design System

### Components (shadcn/ui)
- **Card**: Container chính với rounded-2xl
- **Button**: Actions với variants khác nhau
- **Input**: Form inputs với validation
- **Badge**: Status indicators
- **Alert**: Notifications và warnings
- **Tabs**: Navigation (sidebar)
- **Accordion**: Collapsible content
- **Popover**: Contract info popup

### Color Scheme
- **Primary**: Dark blue cho actions chính
- **Secondary**: Light gray cho secondary actions
- **Destructive**: Red cho errors
- **Success**: Green cho success states
- **Muted**: Gray cho disabled states

### Typography
- **Headings**: Font-semibold, tracking-tight
- **Body**: Text-sm cho descriptions
- **Code**: Font-mono cho addresses và handles
- **Labels**: Text-xs cho form labels

## 🔧 Technical Features

### State Management
- **Real-time Updates**: Balance và status tự động cập nhật
- **Loading States**: Spinner và disabled states
- **Error Handling**: Toast notifications và error hints
- **Form Validation**: Real-time validation cho addresses và amounts

### Privacy Features
- **Encrypted Display**: Chỉ hiển thị handles, không lộ amounts
- **Decrypt on Demand**: User phải chủ động decrypt balance
- **Session Management**: Reset decrypt session khi cần
- **Context Validation**: Kiểm tra contract context

### Developer Tools
- **Debug Panel**: Thông tin chi tiết cho debugging
- **Error Decoder**: Giải thích lỗi FHEVM thường gặp
- **Performance Metrics**: Timing cho các operations
- **ACL Testing**: Test access control permissions

## 🚀 Cách sử dụng

### 1. Khởi động
```bash
cd packages/site
npm run dev
```

### 2. Kết nối Wallet
- Click "Connect Wallet" ở header
- Chọn Hardhat network (localhost:8545, chainId: 31337)
- Import account từ Hardhat node

### 3. Sử dụng các tính năng

#### Overview
- Xem contract status và user role
- Refresh balance handle
- Decrypt balance để xem số dư thực tế

#### Send
- Nhập recipient address
- Nhập amount (6 decimal places)
- Click "Send Confidential Transfer"

#### Mint (Owner only)
- Chỉ owner mới thấy tab này
- Nhập recipient và amount
- Click "Mint Confidential Tokens"

#### Developer
- Xem context information
- Test ACL permissions
- Debug balance operations
- Xem error explanations

## 🎯 UX Highlights

### 1. Role-based UI
- **User**: Chỉ thấy Send, Overview, Developer
- **Owner**: Thêm tab Mint với owner badge
- **Coming Soon**: Các tính năng chưa implement có badge "Soon"

### 2. Privacy-first Design
- **Encrypted by Default**: Tất cả amounts đều encrypted
- **Decrypt on Demand**: User phải chủ động decrypt
- **Visual Indicators**: Badges và icons cho trạng thái privacy

### 3. Developer-friendly
- **Debug Panel**: Tất cả thông tin cần thiết cho debugging
- **Error Hints**: Giải thích lỗi và cách fix
- **Context Display**: Hiển thị contract, chain, user context

### 4. Responsive Design
- **Mobile-first**: Responsive trên mọi device
- **Sidebar**: Collapsible trên mobile
- **Cards**: Stack vertically trên mobile

## 🔮 Roadmap

### Sprint 1 (Current)
- ✅ Overview, Send, Mint, Developer
- ✅ Basic UI/UX với shadcn/ui
- ✅ Role-based navigation

### Sprint 2 (Next)
- 🔄 Burn functionality
- 🔄 Allowance management
- 🔄 Observer permissions

### Sprint 3 (Future)
- 🔄 Advanced features (Strict mode)
- 🔄 Supply management
- 🔄 Activity feed với real data

## 🐛 Troubleshooting

### Common Issues

1. **"Not owner" Error**
   - Connect với Hardhat account 0 (0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)
   - Check network (localhost:8545)

2. **"Contract not deployed"**
   - Deploy contract: `npx hardhat deploy --network localhost`
   - Check contract address trong Developer panel

3. **"Decryption failed"**
   - Click "Reset Session" trong BalanceCard
   - Refresh balance handle trước khi decrypt

4. **"Wrong context" Error**
   - Check ENC.contract vs tx.to trong Developer panel
   - Ensure same chain và signer

### Debug Tools
- **Developer Panel**: Xem tất cả context info
- **Error Decoder**: Giải thích lỗi codes
- **Console Logs**: Chi tiết debug info

## 📚 Dependencies

### Core
- **Next.js 15**: React framework
- **React 19**: UI library
- **TypeScript**: Type safety

### UI Components
- **shadcn/ui**: Component library
- **Radix UI**: Headless components
- **Tailwind CSS**: Styling
- **Lucide React**: Icons

### Blockchain
- **@zama-fhe/relayer-sdk**: FHEVM integration
- **ethers.js**: Ethereum interactions
- **MetaMask**: Wallet connection

## 🎉 Kết luận

UI mới cung cấp:
- ✅ **Dễ demo**: Interface trực quan, dễ hiểu
- ✅ **Dễ debug**: Developer tools đầy đủ
- ✅ **Sẵn mở rộng**: Architecture modular, dễ thêm tính năng
- ✅ **Privacy-first**: Thiết kế bảo mật từ đầu
- ✅ **Role-based**: Phân quyền rõ ràng
- ✅ **Production-ready**: Sẵn sàng cho deployment

**Perfect cho demo FHEVM confidential tokens!** 🚀
