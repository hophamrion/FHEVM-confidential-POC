// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ConfidentialTokenExtended.sol"; // token hiện tại của bạn
import "./CTRegistry.sol";

contract CTFactory {
    CTRegistry public immutable registry;

    event Deployed(address indexed owner, address indexed token, string slug);

    constructor(CTRegistry _registry) {
        registry = _registry;
    }

    // Deploy token, chuyển owner cho user, và ghi vào registry
    function deployAndRegister(string calldata slug)
        external
        returns (address token)
    {
        // 1) deploy token (owner tạm là Factory)
        ConfidentialTokenExtended t = new ConfidentialTokenExtended();
        
        // 2) chuyển quyền về cho user
        t.transferOwnership(msg.sender);

        // 3) whitelist factory & đăng ký thay user
        registry.registerFor(msg.sender, address(t), slug);

        emit Deployed(msg.sender, address(t), slug);
        return address(t);
    }

    // Helper function để check registry status
    function isFactoryRegistered() external view returns (bool) {
        return registry.isRegistrar(address(this));
    }
}
