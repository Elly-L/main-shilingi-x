// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ShillingiXAssetManager
 * @dev Contract for managing tokenized assets like bonds and equities
 */
contract ShillingiXAssetManager is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Counters for IDs
    Counters.Counter private _assetIdCounter;
    Counters.Counter private _transactionIdCounter;
    
    // Enums
    enum AssetType { BOND, EQUITY }
    enum AssetStatus { ACTIVE, SOLD_OUT, EXPIRED, SUSPENDED }
    
    // Structs
    struct Asset {
        uint256 id;
        string name;
        string description;
        AssetType assetType;
        uint256 price; // in cents (KES)
        uint256 totalSupply;
        uint256 availableSupply;
        uint256 interestRate; // in basis points (1% = 100)
        uint256 maturityDate; // timestamp
        AssetStatus status;
        string metadata; // additional JSON data
    }
    
    struct UserAssetBalance {
        uint256 quantity;
        uint256 purchasePrice; // average purchase price
        uint256 purchaseDate; // timestamp of first purchase
    }
    
    struct Transaction {
        uint256 id;
        address userAddress;
        uint256 assetId;
        bool isBuy; // true for buy, false for sell
        uint256 quantity;
        uint256 price; // price per unit at transaction time
        uint256 timestamp;
    }
    
    // Mappings
    mapping(uint256 => Asset) private _assets;
    mapping(address => uint256) private _userBalances;
    mapping(address => mapping(uint256 => UserAssetBalance)) private _userAssetBalances;
    mapping(uint256 => Transaction) private _transactions;
    mapping(address => uint256[]) private _userTransactions;
    
    uint256[] private _assetIds;
    
    // Events
    event AssetIssued(uint256 assetId, string name, AssetType assetType, uint256 totalSupply);
    event AssetBought(uint256 transactionId, address indexed user, uint256 indexed assetId, uint256 quantity, uint256 price);
    event AssetSold(uint256 transactionId, address indexed user, uint256 indexed assetId, uint256 quantity, uint256 price);
    event AssetStatusChanged(uint256 indexed assetId, AssetStatus status);
    event UserBalanceChanged(address indexed user, uint256 newBalance);
    
    // Constructor
    constructor() {
        // Initialize with contract owner
    }
    
    // External functions
    
    /**
     * @dev Issue a new asset
     */
    function issueAsset(
        string memory name,
        string memory description,
        AssetType assetType,
        uint256 price,
        uint256 totalSupply,
        uint256 interestRate,
        uint256 maturityDate,
        string memory metadata
    ) external onlyOwner returns (uint256) {
        _assetIdCounter.increment();
        uint256 assetId = _assetIdCounter.current();
        
        Asset storage asset = _assets[assetId];
        asset.id = assetId;
        asset.name = name;
        asset.description = description;
        asset.assetType = assetType;
        asset.price = price;
        asset.totalSupply = totalSupply;
        asset.availableSupply = totalSupply;
        asset.interestRate = interestRate;
        asset.maturityDate = maturityDate;
        asset.status = AssetStatus.ACTIVE;
        asset.metadata = metadata;
        
        _assetIds.push(assetId);
        
        emit AssetIssued(assetId, name, assetType, totalSupply);
        
        return assetId;
    }
    
    /**
     * @dev Buy an asset directly
     */
    function buyAsset(uint256 assetId, uint256 quantity) external payable nonReentrant returns (uint256) {
        Asset storage asset = _assets[assetId];
        require(asset.id == assetId, "Asset does not exist");
        require(asset.status == AssetStatus.ACTIVE, "Asset is not active");
        require(asset.availableSupply >= quantity, "Insufficient supply");
        
        uint256 totalPrice = asset.price * quantity;
        
        // Update user balance
        _userBalances[msg.sender] -= totalPrice;
        
        // Update asset supply
        asset.availableSupply -= quantity;
        
        // Update user asset balance
        UserAssetBalance storage userAssetBalance = _userAssetBalances[msg.sender][assetId];
        if (userAssetBalance.quantity == 0) {
            userAssetBalance.purchaseDate = block.timestamp;
            userAssetBalance.purchasePrice = asset.price;
        } else {
            // Calculate new average purchase price
            userAssetBalance.purchasePrice = (userAssetBalance.purchasePrice * userAssetBalance.quantity + asset.price * quantity) / (userAssetBalance.quantity + quantity);
        }
        userAssetBalance.quantity += quantity;
        
        // Record transaction
        uint256 transactionId = _recordTransaction(msg.sender, assetId, true, quantity, asset.price);
        
        // Check if asset is sold out
        if (asset.availableSupply == 0) {
            asset.status = AssetStatus.SOLD_OUT;
            emit AssetStatusChanged(assetId, AssetStatus.SOLD_OUT);
        }
        
        emit AssetBought(transactionId, msg.sender, assetId, quantity, asset.price);
        
        return transactionId;
    }
    
    /**
     * @dev Buy an asset on behalf of a user (platform function)
     */
    function buyAssetFor(address user, uint256 assetId, uint256 quantity, uint256 amount) external onlyOwner returns (uint256) {
        Asset storage asset = _assets[assetId];
        require(asset.id == assetId, "Asset does not exist");
        require(asset.status == AssetStatus.ACTIVE, "Asset is not active");
        require(asset.availableSupply >= quantity, "Insufficient supply");
        
        uint256 totalPrice = asset.price * quantity;
        require(amount >= totalPrice, "Insufficient payment");
        
        // Update user balance (add any excess to their balance)
        _userBalances[user] += (amount - totalPrice);
        
        // Update asset supply
        asset.availableSupply -= quantity;
        
        // Update user asset balance
        UserAssetBalance storage userAssetBalance = _userAssetBalances[user][assetId];
        if (userAssetBalance.quantity == 0) {
            userAssetBalance.purchaseDate = block.timestamp;
            userAssetBalance.purchasePrice = asset.price;
        } else {
            // Calculate new average purchase price
            userAssetBalance.purchasePrice = (userAssetBalance.purchasePrice * userAssetBalance.quantity + asset.price * quantity) / (userAssetBalance.quantity + quantity);
        }
        userAssetBalance.quantity += quantity;
        
        // Record transaction
        uint256 transactionId = _recordTransaction(user, assetId, true, quantity, asset.price);
        
        // Check if asset is sold out
        if (asset.availableSupply == 0) {
            asset.status = AssetStatus.SOLD_OUT;
            emit AssetStatusChanged(assetId, AssetStatus.SOLD_OUT);
        }
        
        emit AssetBought(transactionId, user, assetId, quantity, asset.price);
        emit UserBalanceChanged(user, _userBalances[user]);
        
        return transactionId;
    }
    
    /**
     * @dev Sell an asset
     */
    function sellAsset(uint256 assetId, uint256 quantity) external nonReentrant returns (uint256) {
        Asset storage asset = _assets[assetId];
        require(asset.id == assetId, "Asset does not exist");
        require(asset.status != AssetStatus.SUSPENDED, "Asset is suspended");
        
        UserAssetBalance storage userAssetBalance = _userAssetBalances[msg.sender][assetId];
        require(userAssetBalance.quantity >= quantity, "Insufficient balance");
        
        uint256 totalPrice = asset.price * quantity;
        
        // Update user balance
        _userBalances[msg.sender] += totalPrice;
        
        // Update asset supply
        asset.availableSupply += quantity;
        
        // Update user asset balance
        userAssetBalance.quantity -= quantity;
        
        // Record transaction
        uint256 transactionId = _recordTransaction(msg.sender, assetId, false, quantity, asset.price);
        
        // Update asset status if it was sold out
        if (asset.status == AssetStatus.SOLD_OUT) {
            asset.status = AssetStatus.ACTIVE;
            emit AssetStatusChanged(assetId, AssetStatus.ACTIVE);
        }
        
        emit AssetSold(transactionId, msg.sender, assetId, quantity, asset.price);
        emit UserBalanceChanged(msg.sender, _userBalances[msg.sender]);
        
        return transactionId;
    }
    
    /**
     * @dev Sell an asset on behalf of a user (platform function)
     */
    function sellAssetFor(address user, uint256 assetId, uint256 quantity) external onlyOwner returns (uint256) {
        Asset storage asset = _assets[assetId];
        require(asset.id == assetId, "Asset does not exist");
        require(asset.status != AssetStatus.SUSPENDED, "Asset is suspended");
        
        UserAssetBalance storage userAssetBalance = _userAssetBalances[user][assetId];
        require(userAssetBalance.quantity >= quantity, "Insufficient balance");
        
        uint256 totalPrice = asset.price * quantity;
        
        // Update user balance
        _userBalances[user] += totalPrice;
        
        // Update asset supply
        asset.availableSupply += quantity;
        
        // Update user asset balance
        userAssetBalance.quantity -= quantity;
        
        // Record transaction
        uint256 transactionId = _recordTransaction(user, assetId, false, quantity, asset.price);
        
        // Update asset status if it was sold out
        if (asset.status == AssetStatus.SOLD_OUT) {
            asset.status = AssetStatus.ACTIVE;
            emit AssetStatusChanged(assetId, AssetStatus.ACTIVE);
        }
        
        emit AssetSold(transactionId, user, assetId, quantity, asset.price);
        emit UserBalanceChanged(user, _userBalances[user]);
        
        return transactionId;
    }
    
    /**
     * @dev Update asset status
     */
    function updateAssetStatus(uint256 assetId, AssetStatus status) external onlyOwner {
        Asset storage asset = _assets[assetId];
        require(asset.id == assetId, "Asset does not exist");
        
        asset.status = status;
        emit AssetStatusChanged(assetId, status);
    }
    
    /**
     * @dev Add funds to user balance (platform function)
     */
    function addFunds(address user, uint256 amount) external onlyOwner {
        _userBalances[user] += amount;
        emit UserBalanceChanged(user, _userBalances[user]);
    }
    
    /**
     * @dev Withdraw funds from user balance (platform function)
     */
    function withdrawFunds(address user, uint256 amount) external onlyOwner {
        require(_userBalances[user] >= amount, "Insufficient balance");
        
        _userBalances[user] -= amount;
        emit UserBalanceChanged(user, _userBalances[user]);
    }
    
    // View functions
    
    /**
     * @dev Get asset details
     */
    function getAsset(uint256 assetId) external view returns (Asset memory) {
        require(_assets[assetId].id == assetId, "Asset does not exist");
        return _assets[assetId];
    }
    
    /**
     * @dev Get all asset IDs
     */
    function getAssetIds() external view returns (uint256[] memory) {
        return _assetIds;
    }
    
    /**
     * @dev Get user balance
     */
    function getUserBalance(address user) external view returns (uint256) {
        return _userBalances[user];
    }
    
    /**
     * @dev Get user asset balance
     */
    function getUserAssetBalance(address user, uint256 assetId) external view returns (UserAssetBalance memory) {
        return _userAssetBalances[user][assetId];
    }
    
    /**
     * @dev Get transaction details
     */
    function getTransaction(uint256 transactionId) external view returns (Transaction memory) {
        require(_transactions[transactionId].id == transactionId, "Transaction does not exist");
        return _transactions[transactionId];
    }
    
    /**
     * @dev Get user transaction IDs
     */
    function getUserTransactionIds(address user) external view returns (uint256[] memory) {
        return _userTransactions[user];
    }
    
    // Internal functions
    
    /**
     * @dev Record a transaction
     */
    function _recordTransaction(
        address user,
        uint256 assetId,
        bool isBuy,
        uint256 quantity,
        uint256 price
    ) internal returns (uint256) {
        _transactionIdCounter.increment();
        uint256 transactionId = _transactionIdCounter.current();
        
        Transaction storage transaction = _transactions[transactionId];
        transaction.id = transactionId;
        transaction.userAddress = user;
        transaction.assetId = assetId;
        transaction.isBuy = isBuy;
        transaction.quantity = quantity;
        transaction.price = price;
        transaction.timestamp = block.timestamp;
        
        _userTransactions[user].push(transactionId);
        
        return transactionId;
    }
}
