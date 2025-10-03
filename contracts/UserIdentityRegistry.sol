// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract UserIdentityRegistry is Ownable {
    enum Role { NONE, FARMER, MSME, BUYER, LOGISTICS, ADMIN }

    struct User {
        Role role;
        bytes32 identityHash; // e.g., hash of Aadhaar or other documents
        bool isVerified;
        uint256 registrationTimestamp;
    }

    mapping(address => User) public users;

    event UserRegistered(address indexed userAddress, Role role, uint256 timestamp);
    event UserVerified(address indexed userAddress, bool isVerified);

    modifier onlyAdmin() {
        require(users[msg.sender].role == Role.ADMIN, "Caller is not an admin");
        _;
    }

    constructor() Ownable(msg.sender) {
        // The deployer is automatically set as the first admin
        users[msg.sender] = User({
            role: Role.ADMIN,
            identityHash: bytes32(0),
            isVerified: true,
            registrationTimestamp: block.timestamp
        });
        emit UserRegistered(msg.sender, Role.ADMIN, block.timestamp);
    }
    
    function registerUser(address userAddress, Role role, bytes32 identityHash) public onlyAdmin {
        require(users[userAddress].registrationTimestamp == 0, "User is already registered");
        require(role != Role.NONE, "Cannot register with NONE role");

        users[userAddress] = User({
            role: role,
            identityHash: identityHash,
            isVerified: false, // Verification is a separate step
            registrationTimestamp: block.timestamp
        });

        emit UserRegistered(userAddress, role, block.timestamp);
    }

    function verifyUser(address userAddress, bool verifiedStatus) public onlyAdmin {
        require(users[userAddress].registrationTimestamp != 0, "User not found");
        users[userAddress].isVerified = verifiedStatus;
        emit UserVerified(userAddress, verifiedStatus);
    }
    
    function getUserRole(address userAddress) public view returns (Role) {
        return users[userAddress].role;
    }

    function isUserVerified(address userAddress) public view returns (bool) {
        return users[userAddress].isVerified;
    }
}
