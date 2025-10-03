// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/Counters.sol";
import "./UserIdentityRegistry.sol";

contract ProductProvenance {
    using Counters for Counters.Counter;
    Counters.Counter private _productIds;

    UserIdentityRegistry private _identityRegistry;

    enum ProductStage { CREATED, HARVESTED, PACKED, IN_TRANSIT, DELIVERED }
    
    struct Product {
        uint256 id;
        address farmerId;
        string name;
        string category;
        bytes32 qualityCertHash;
        uint256 creationTimestamp;
        ProductStage currentStage;
    }

    struct StageLog {
        ProductStage stage;
        uint256 timestamp;
    }

    mapping(uint256 => Product) public products;
    mapping(uint256 => StageLog[]) public stageHistory;

    event ProductCreated(uint256 indexed productId, address indexed farmerId, string name, uint256 timestamp);
    event ProductStageUpdated(uint256 indexed productId, ProductStage stage, uint256 timestamp);

    constructor(address identityRegistryAddress) {
        _identityRegistry = UserIdentityRegistry(identityRegistryAddress);
    }

    modifier onlyVerifiedFarmer(address farmerAddress) {
        require(_identityRegistry.isUserVerified(farmerAddress), "User is not verified");
        require(
            _identityRegistry.getUserRole(farmerAddress) == UserIdentityRegistry.Role.FARMER,
            "User is not a farmer"
        );
        _;
    }

    function createProduct(string memory name, string memory category, bytes32 qualityCertHash) public onlyVerifiedFarmer(msg.sender) returns (uint256) {
        _productIds.increment();
        uint256 newProductId = _productIds.current();

        products[newProductId] = Product({
            id: newProductId,
            farmerId: msg.sender,
            name: name,
            category: category,
            qualityCertHash: qualityCertHash,
            creationTimestamp: block.timestamp,
            currentStage: ProductStage.CREATED
        });

        stageHistory[newProductId].push(StageLog({
            stage: ProductStage.CREATED,
            timestamp: block.timestamp
        }));
        
        emit ProductCreated(newProductId, msg.sender, name, block.timestamp);
        return newProductId;
    }

    function updateProductStage(uint256 productId, ProductStage newStage) public {
        // Access control should be more granular here, e.g. only logistics can set IN_TRANSIT
        require(products[productId].id != 0, "Product does not exist");
        
        products[productId].currentStage = newStage;
        stageHistory[productId].push(StageLog({
            stage: newStage,
            timestamp: block.timestamp
        }));

        emit ProductStageUpdated(productId, newStage, block.timestamp);
    }
    
    function getProductHistory(uint256 productId) public view returns (StageLog[] memory) {
        return stageHistory[productId];
    }
}
