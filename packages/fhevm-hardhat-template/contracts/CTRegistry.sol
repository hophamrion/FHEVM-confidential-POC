// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IOwnable {
    function owner() external view returns (address);
}

contract CTRegistry {
    struct Entry {
        address token;
        uint64  chainId;
        uint64  createdAt; // block.timestamp
    }

    // owner => slugKey => versions
    mapping(address => mapping(bytes32 => Entry[])) private _book;

    // factory/registrar whitelist (để cho phép "register thay" người dùng)
    mapping(address => bool) public isRegistrar;

    event Registered(address indexed owner, bytes32 indexed slugKey, address indexed token, uint256 version);
    event RegistrarSet(address indexed registrar, bool allowed);
    event SlugCreated(address indexed owner, string slug); // New event to track slug creation

    // ---- utils ----
    function _key(string memory slug) internal pure returns (bytes32) {
        // đơn giản: phân biệt hoa/thường; nếu muốn không phân biệt, lowercase trước
        return keccak256(bytes(slug));
    }

    // ---- read ----
    function count(address owner_, string calldata slug) external view returns (uint256) {
        return _book[owner_][_key(slug)].length;
    }

    function latest(address owner_, string calldata slug) public view returns (address token) {
        Entry[] storage v = _book[owner_][_key(slug)];
        require(v.length > 0, "No entry");
        return v[v.length - 1].token;
    }

    function getByVersion(address owner_, string calldata slug, uint256 version)
        external view returns (Entry memory)
    {
        Entry[] storage v = _book[owner_][_key(slug)];
        require(version < v.length, "bad version");
        return v[version];
    }

    // Get all slugs for an owner (returns empty array - need to implement differently)
    // Note: This is a limitation of Solidity - we can't iterate over mapping keys
    // Alternative: Use events to track slugs
    function getAllSlugs(address owner_) external pure returns (string[] memory) {
        // This function cannot be implemented in Solidity due to mapping limitations
        // We need to use events or off-chain indexing
        revert("Not implemented - use events or off-chain indexing");
    }

    // ---- write: user tự đăng ký (yêu cầu token.owner == msg.sender) ----
    function register(address token, string calldata slug) external {
        require(token != address(0), "zero token");
        // yêu cầu người gọi thực sự là owner của token đó
        require(IOwnable(token).owner() == msg.sender, "not token owner");

        bytes32 k = _key(slug);
        _book[msg.sender][k].push(Entry({
            token: token,
            chainId: uint64(block.chainid),
            createdAt: uint64(block.timestamp)
        }));
        emit Registered(msg.sender, k, token, _book[msg.sender][k].length - 1);
        
        // Emit SlugCreated event for first-time slug creation
        if (_book[msg.sender][k].length == 1) {
            emit SlugCreated(msg.sender, slug);
        }
    }

    // ---- write: factory/registrar đăng ký thay người dùng ----
    function setRegistrar(address registrar, bool allowed) external {
        // simple governance: chủ registry là deployer (msg.sender ở đây); 
        // nếu cần chặt chẽ hơn thêm Ownable cho registry
        require(tx.origin == msg.sender, "EOA only (demo)"); // PoC: tránh contract lạ
        isRegistrar[registrar] = allowed;
        emit RegistrarSet(registrar, allowed);
    }

    function registerFor(address owner_, address token, string calldata slug) external {
        require(isRegistrar[msg.sender], "unauthorized registrar");
        require(token != address(0) && owner_ != address(0), "bad args");
        // đảm bảo quyền sở hữu thực sự thuộc về owner_
        require(IOwnable(token).owner() == owner_, "owner mismatch");

        bytes32 k = _key(slug);
        _book[owner_][k].push(Entry({
            token: token,
            chainId: uint64(block.chainid),
            createdAt: uint64(block.timestamp)
        }));
        emit Registered(owner_, k, token, _book[owner_][k].length - 1);
    }
}
