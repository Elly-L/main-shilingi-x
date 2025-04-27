// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ShilingiXInvestmentManager
 * @dev Contract for managing investments on the Shillingi X platform
 */
contract ShilingiXInvestmentManager {
    address public owner;
    uint256 public nextAssetId = 1;
    uint256 public nextTransactionId = 1;

    enum AssetType { BOND, EQUITY }
    enum AssetStatus { ACTIVE, SOLD_OUT, EXPIRED, SUSPENDED }

    struct Asset {
        uint256 id;
        string name;
        string description;
        AssetType assetType;
        uint256 price;  // in cents
        uint256 totalSupply;
        uint256 availableSupply;
        uint256 interestRate;  // in basis points (1% = 100 basis points)
        uint256 maturityDate;  // timestamp
        AssetStatus status;
        string metadata;
    }

    struct AssetBalance {
        uint256 quantity;
        uint256 purchasePrice;  // in cents
        uint256 purchaseDate;   // timestamp
    }

    struct Transaction {
        uint256 id;
        address userAddress;
        uint256 assetId;
        bool isBuy;
        uint256 quantity;
        uint256 price;  // in cents
        uint256 timestamp;
    }

    mapping(uint256 => Asset) public assets;
    mapping(address => uint256) public userBalances;
    mapping(address => mapping(uint256 => AssetBalance)) public userAssetBalances;
    mapping(address => uint256[]) public userTransactionIds;
    mapping(uint256 => Transaction) public transactions;
    uint256[] public assetIds;

    event AssetIssued(uint256 assetId, string name, AssetType assetType);
    event AssetBought(uint256 transactionId, address user, uint256 assetId, uint256 quantity, uint256 price);
    event AssetSold(uint256 transactionId, address user, uint256 assetId, uint256 quantity, uint256 price);
    event AssetStatusChanged(uint256 assetId, AssetStatus status);
    event FundsDeposited(address user, uint256 amount);
    event FundsWithdrawn(address user, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

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
    ) public onlyOwner returns (uint256) {
        uint256 assetId = nextAssetId++;
        
        Asset memory newAsset = Asset({
            id: assetId,
            name: name,
            description: description,
            assetType: assetType,
            price: price,
            totalSupply: totalSupply,
            availableSupply: totalSupply,
            interestRate: interestRate,
            maturityDate: maturityDate,
            status: AssetStatus.ACTIVE,
            metadata: metadata
        });
        
        assets[assetId] = newAsset;
        assetIds.push(assetId);
        
        emit AssetIssued(assetId, name, assetType);
        
        return assetId;
    }

    /**
     * @dev Change the status of an asset
     */
    function changeAssetStatus(uint256 assetId, AssetStatus status) public onlyOwner {
        require(assets[assetId].id != 0, "Asset does not exist");
        assets[assetId].status = status;
        emit AssetStatusChanged(assetId, status);
    }

    /**
     * @dev Deposit funds into user's account
     */
    function depositFunds(address user, uint256 amount) public onlyOwner {
        userBalances[user] += amount;
        emit FundsDeposited(user, amount);
    }

    /**
     * @dev Withdraw funds from user's account
     */
    function withdrawFunds(address user, uint256 amount) public onlyOwner {
        require(userBalances[user] >= amount, "Insufficient balance");
        userBalances[user] -= amount;
        emit FundsWithdrawn(user, amount);
    }

    /**
     * @dev Buy an asset directly by the user
     */
    function buyAsset(uint256 assetId, uint256 quantity) public returns (uint256) {
        require(assets[assetId].id != 0, "Asset does not exist");
        require(assets[assetId].status == AssetStatus.ACTIVE, "Asset is not active");
        require(assets[assetId].availableSupply >= quantity, "Insufficient supply");
        
        uint256 totalPrice = assets[assetId].price * quantity;
        require(userBalances[msg.sender] >= totalPrice, "Insufficient balance");
        
        // Update user balance
        userBalances[msg.sender] -= totalPrice;
        
        // Update asset supply
        assets[assetId].availableSupply -= quantity;
        
        // Update user's asset balance
        AssetBalance storage balance = userAssetBalances[msg.sender][assetId];
        balance.quantity += quantity;
        balance.purchasePrice = assets[assetId].price;
        balance.purchaseDate = block.timestamp;
        
        // Record transaction
        uint256 transactionId = recordTransaction(msg.sender, assetId, true, quantity, totalPrice);
        
        // Check if asset is sold out
        if (assets[assetId].availableSupply == 0) {
            assets[assetId].status = AssetStatus.SOLD_OUT;
            emit AssetStatusChanged(assetId, AssetStatus.SOLD_OUT);
        }
        
        emit AssetBought(transactionId, msg.sender, assetId, quantity, totalPrice);
        
        return transactionId;
    }

    /**
     * @dev Buy an asset on behalf of a user (for platform use)
     */
    function buyAssetFor(address user, uint256 assetId, uint256 quantity, uint256 amount) public onlyOwner returns (uint256) {
        require(assets[assetId].id != 0, "Asset does not exist");
        require(assets[assetId].status == AssetStatus.ACTIVE, "Asset is not active");
        require(assets[assetId].availableSupply >= quantity, "Insufficient supply");
        
        // Update asset supply
        assets[assetId].availableSupply -= quantity;
        
        // Update user's asset balance
        AssetBalance storage balance = userAssetBalances[user][assetId];
        balance.quantity += quantity;
        balance.purchasePrice = assets[assetId].price;
        balance.purchaseDate = block.timestamp;
        
        // Record transaction
        uint256 transactionId = recordTransaction(user, assetId, true, quantity, amount);
        
        // Check if asset is sold out
        if (assets[assetId].availableSupply == 0) {
            assets[assetId].status = AssetStatus.SOLD_OUT;
            emit AssetStatusChanged(assetId, AssetStatus.SOLD_OUT);
        }
        
        emit AssetBought(transactionId, user, assetId, quantity, amount);
        
        return transactionId;
    }

    /**
     * @dev Sell an asset
     */
    function sellAsset(uint256 assetId, uint256 quantity) public returns (uint256) {
        require(assets[assetId].id != 0, "Asset does not exist");
        require(userAssetBalances[msg.sender][assetId].quantity >= quantity, "Insufficient asset balance");
        
        uint256 salePrice = assets[assetId].price * quantity;
        
        // Update user balance
        userBalances[msg.sender] += salePrice;
        
        // Update user's asset balance
        userAssetBalances[msg.sender][assetId].quantity -= quantity;
        
        // Update asset supply
        assets[assetId].availableSupply += quantity;
        
        // If asset was sold out, change status back to active
        if (assets[assetId].status == AssetStatus.SOLD_OUT) {
            assets[assetId].status = AssetStatus.ACTIVE;
            emit AssetStatusChanged(assetId, AssetStatus.ACTIVE);
        }
        
        // Record transaction
        uint256 transactionId = recordTransaction(msg.sender, assetId, false, quantity, salePrice);
        
        emit AssetSold(transactionId, msg.sender, assetId, quantity, salePrice);
        
        return transactionId;
    }

    /**
     * @dev Sell an asset on behalf of a user (for platform use)
     */
    function sellAssetFor(address user, uint256 assetId, uint256 quantity) public onlyOwner returns (uint256) {
        require(assets[assetId].id != 0, "Asset does not exist");
        require(userAssetBalances[user][assetId].quantity >= quantity, "Insufficient asset balance");
        
        uint256 salePrice = assets[assetId].price * quantity;
        
        // Update user balance
        userBalances[user] += salePrice;
        
        // Update user's asset balance
        userAssetBalances[user][assetId].quantity -= quantity;
        
        // Update asset supply
        assets[assetId].availableSupply += quantity;
        
        // If asset was sold out, change status back to active
        if (assets[assetId].status == AssetStatus.SOLD_OUT) {
            assets[assetId].status = AssetStatus.ACTIVE;
            emit AssetStatusChanged(assetId, AssetStatus.ACTIVE);
        }
        
        // Record transaction
        uint256 transactionId = recordTransaction(user, assetId, false, quantity, salePrice);
        
        emit AssetSold(transactionId, user, assetId, quantity, salePrice);
        
        return transactionId;
    }

    /**
     * @dev Record a transaction
     */
    function recordTransaction(address user, uint256 assetId, bool isBuy, uint256 quantity, uint256 price) internal returns (uint256) {
        uint256 transactionId = nextTransactionId++;
        
        Transaction memory newTransaction = Transaction({
            id: transactionId,
            userAddress: user,
            assetId: assetId,
            isBuy: isBuy,
            quantity: quantity,
            price: price,
            timestamp: block.timestamp
        });
        
        transactions[transactionId] = newTransaction;
        userTransactionIds[user].push(transactionId);
        
        return transactionId;
    }

    /**
     * @dev Get asset details
     */
    function getAsset(uint256 assetId) public view returns (
        uint256 id,
        string memory name,
        string memory description,
        AssetType assetType,
        uint256 price,
        uint256 totalSupply,
        uint256 availableSupply,
        uint256 interestRate,
        uint256 maturityDate,
        AssetStatus status,
        string memory metadata
    ) {
        Asset memory asset = assets[assetId];
        require(asset.id != 0, "Asset does not exist");
        
        return (
            asset.id,
            asset.name,
            asset.description,
            asset.assetType,
            asset.price,
            asset.totalSupply,
            asset.availableSupply,
            asset.interestRate,
            asset.maturityDate,
            asset.status,
            asset.metadata
        );
    }

    /**
     * @dev Get all asset IDs
     */
    function getAssetIds() public view returns (uint256[] memory) {
        return assetIds;
    }

    /**
     * @dev Get user balance
     */
    function getUserBalance(address user) public view returns (uint256) {
        return userBalances[user];
    }

    /**
     * @dev Get user's asset balance
     */
    function getUserAssetBalance(address user, uint256 assetId) public view returns (
        uint256 quantity,
        uint256 purchasePrice,
        uint256 purchaseDate
    ) {
        AssetBalance memory balance = userAssetBalances[user][assetId];
        return (balance.quantity, balance.purchasePrice, balance.purchaseDate);
    }

    /**
     * @dev Get user's transaction IDs
     */
    function getUserTransactionIds(address user) public view returns (uint256[] memory) {
        return userTransactionIds[user];
    }

    /**
     * @dev Get transaction details
     */
    function getTransaction(uint256 transactionId) public view returns (
        uint256 id,
        address userAddress,
        uint256 assetId,
        bool isBuy,
        uint256 quantity,
        uint256 price,
        uint256 timestamp
    ) {
        Transaction memory transaction = transactions[transactionId];
        require(transaction.id != 0, "Transaction does not exist");
        
        return (
            transaction.id,
            transaction.userAddress,
            transaction.assetId,
            transaction.isBuy,
            transaction.quantity,
            transaction.price,
            transaction.timestamp
        );
    }

    /**
     * @dev Transfer ownership of the contract
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be the zero address");
        owner = newOwner;
    }
}
