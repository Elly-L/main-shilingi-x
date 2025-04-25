// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title ShillingiXBondManager
 * @dev Smart contract for managing bonds and investments on the Hedera network
 */
contract ShillingiXBondManager is 
    Initializable, 
    PausableUpgradeable, 
    AccessControlUpgradeable, 
    UUPSUpgradeable 
{
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    enum BondType { GOVERNMENT, CORPORATE, INFRASTRUCTURE, EQUITY }
    enum BondStatus { ACTIVE, SOLD_OUT, EXPIRED, SUSPENDED }

    struct Bond {
        uint256 id;
        string name;
        string description;
        BondType bondType;
        uint256 price;          // Price per unit in cents (KES)
        uint256 totalSupply;    // Total number of units
        uint256 availableSupply; // Remaining units
        uint256 interestRate;   // In basis points (1% = 100)
        uint256 maturityDate;   // Unix timestamp
        BondStatus status;
        string metadata;        // Additional JSON metadata
    }

    struct UserBondBalance {
        uint256 quantity;
        uint256 purchasePrice;  // Price per unit at purchase time
        uint256 purchaseDate;   // Unix timestamp
    }

    struct Transaction {
        uint256 id;
        address userAddress;
        uint256 bondId;
        bool isBuy;             // true for buy, false for sell
        uint256 quantity;
        uint256 price;          // Total price in cents (KES)
        uint256 timestamp;
    }

    // State variables
    uint256 private _bondIdCounter;
    uint256 private _transactionIdCounter;
    
    // Mappings
    mapping(uint256 => Bond) private _bonds;
    mapping(address => uint256) private _userBalances;
    mapping(address => mapping(uint256 => UserBondBalance)) private _userBondBalances;
    mapping(uint256 => Transaction) private _transactions;
    mapping(address => uint256[]) private _userTransactionIds;
    uint256[] private _bondIds;

    // Events
    event BondIssued(
        uint256 indexed bondId,
        string name,
        BondType bondType,
        uint256 totalSupply
    );

    event BondUpdated(
        uint256 indexed bondId,
        uint256 price,
        uint256 availableSupply,
        BondStatus status
    );

    event BondBought(
        uint256 indexed transactionId,
        address indexed user,
        uint256 indexed bondId,
        uint256 quantity,
        uint256 price
    );

    event BondSold(
        uint256 indexed transactionId,
        address indexed user,
        uint256 indexed bondId,
        uint256 quantity,
        uint256 price
    );

    event UserBalanceUpdated(
        address indexed user,
        uint256 newBalance
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializes the contract with an admin address
     * @param admin The address to be granted the admin role
     */
    function initialize(address admin) initializer public {
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(OPERATOR_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);

        _bondIdCounter = 1;
        _transactionIdCounter = 1;
    }

    /**
     * @dev Issues a new bond
     * @param name Bond name
     * @param description Bond description
     * @param bondType Type of bond (GOVERNMENT, CORPORATE, etc.)
     * @param price Price per unit in cents (KES)
     * @param totalSupply Total number of units
     * @param interestRate Interest rate in basis points (1% = 100)
     * @param maturityDate Unix timestamp for maturity date
     * @param metadata Additional JSON metadata
     * @return The ID of the newly issued bond
     */
    function issueBond(
        string memory name,
        string memory description,
        BondType bondType,
        uint256 price,
        uint256 totalSupply,
        uint256 interestRate,
        uint256 maturityDate,
        string memory metadata
    ) public onlyRole(OPERATOR_ROLE) whenNotPaused returns (uint256) {
        uint256 bondId = _bondIdCounter++;
        
        Bond storage bond = _bonds[bondId];
        bond.id = bondId;
        bond.name = name;
        bond.description = description;
        bond.bondType = bondType;
        bond.price = price;
        bond.totalSupply = totalSupply;
        bond.availableSupply = totalSupply;
        bond.interestRate = interestRate;
        bond.maturityDate = maturityDate;
        bond.status = BondStatus.ACTIVE;
        bond.metadata = metadata;
        
        _bondIds.push(bondId);
        
        emit BondIssued(bondId, name, bondType, totalSupply);
        
        return bondId;
    }

    /**
     * @dev Updates an existing bond
     * @param bondId ID of the bond to update
     * @param price New price per unit in cents (KES)
     * @param additionalSupply Additional supply to add (0 for no change)
     * @param status New bond status
     * @param metadata Updated metadata
     */
    function updateBond(
        uint256 bondId,
        uint256 price,
        uint256 additionalSupply,
        BondStatus status,
        string memory metadata
    ) public onlyRole(OPERATOR_ROLE) whenNotPaused {
        require(_bonds[bondId].id == bondId, "Bond does not exist");
        
        Bond storage bond = _bonds[bondId];
        
        if (price > 0) {
            bond.price = price;
        }
        
        if (additionalSupply > 0) {
            bond.totalSupply += additionalSupply;
            bond.availableSupply += additionalSupply;
        }
        
        bond.status = status;
        
        if (bytes(metadata).length > 0) {
            bond.metadata = metadata;
        }
        
        emit BondUpdated(bondId, bond.price, bond.availableSupply, bond.status);
    }

    /**
     * @dev Allows a user to buy a bond
     * @param bondId ID of the bond to buy
     * @param quantity Number of units to buy
     * @return The transaction ID
     */
    function buyBond(uint256 bondId, uint256 quantity) public whenNotPaused returns (uint256) {
        Bond storage bond = _bonds[bondId];
        require(bond.id == bondId, "Bond does not exist");
        require(bond.status == BondStatus.ACTIVE, "Bond is not active");
        require(bond.availableSupply >= quantity, "Insufficient bond supply");
        
        uint256 totalPrice = bond.price * quantity;
        require(_userBalances[msg.sender] >= totalPrice, "Insufficient balance");
        
        // Update user balance
        _userBalances[msg.sender] -= totalPrice;
        
        // Update bond supply
        bond.availableSupply -= quantity;
        
        // Update user bond balance
        UserBondBalance storage userBond = _userBondBalances[msg.sender][bondId];
        userBond.quantity += quantity;
        userBond.purchasePrice = bond.price;
        userBond.purchaseDate = block.timestamp;
        
        // Create transaction record
        uint256 transactionId = _transactionIdCounter++;
        _transactions[transactionId] = Transaction({
            id: transactionId,
            userAddress: msg.sender,
            bondId: bondId,
            isBuy: true,
            quantity: quantity,
            price: totalPrice,
            timestamp: block.timestamp
        });
        
        _userTransactionIds[msg.sender].push(transactionId);
        
        // Update bond status if sold out
        if (bond.availableSupply == 0) {
            bond.status = BondStatus.SOLD_OUT;
            emit BondUpdated(bondId, bond.price, bond.availableSupply, bond.status);
        }
        
        emit BondBought(transactionId, msg.sender, bondId, quantity, totalPrice);
        emit UserBalanceUpdated(msg.sender, _userBalances[msg.sender]);
        
        return transactionId;
    }

    /**
     * @dev Allows a user to sell a bond
     * @param bondId ID of the bond to sell
     * @param quantity Number of units to sell
     * @return The transaction ID
     */
    function sellBond(uint256 bondId, uint256 quantity) public whenNotPaused returns (uint256) {
        Bond storage bond = _bonds[bondId];
        require(bond.id == bondId, "Bond does not exist");
        
        UserBondBalance storage userBond = _userBondBalances[msg.sender][bondId];
        require(userBond.quantity >= quantity, "Insufficient bond quantity");
        
        // Calculate sell price (could implement different logic for selling)
        uint256 totalPrice = bond.price * quantity;
        
        // Update user bond balance
        userBond.quantity -= quantity;
        
        // Update user balance
        _userBalances[msg.sender] += totalPrice;
        
        // Update bond supply
        bond.availableSupply += quantity;
        
        // Update bond status if it was sold out
        if (bond.status == BondStatus.SOLD_OUT) {
            bond.status = BondStatus.ACTIVE;
            emit BondUpdated(bondId, bond.price, bond.availableSupply, bond.status);
        }
        
        // Create transaction record
        uint256 transactionId = _transactionIdCounter++;
        _transactions[transactionId] = Transaction({
            id: transactionId,
            userAddress: msg.sender,
            bondId: bondId,
            isBuy: false,
            quantity: quantity,
            price: totalPrice,
            timestamp: block.timestamp
        });
        
        _userTransactionIds[msg.sender].push(transactionId);
        
        emit BondSold(transactionId, msg.sender, bondId, quantity, totalPrice);
        emit UserBalanceUpdated(msg.sender, _userBalances[msg.sender]);
        
        return transactionId;
    }

    /**
     * @dev Allows platform to buy bonds on behalf of a user
     * @param user Address of the user
     * @param bondId ID of the bond to buy
     * @param quantity Number of units to buy
     * @param amount Amount to deduct from user's balance
     * @return The transaction ID
     */
    function buyBondFor(
        address user,
        uint256 bondId,
        uint256 quantity,
        uint256 amount
    ) public onlyRole(OPERATOR_ROLE) whenNotPaused returns (uint256) {
        Bond storage bond = _bonds[bondId];
        require(bond.id == bondId, "Bond does not exist");
        require(bond.status == BondStatus.ACTIVE, "Bond is not active");
        require(bond.availableSupply >= quantity, "Insufficient bond supply");
        
        // Update bond supply
        bond.availableSupply -= quantity;
        
        // Update user bond balance
        UserBondBalance storage userBond = _userBondBalances[user][bondId];
        userBond.quantity += quantity;
        userBond.purchasePrice = bond.price;
        userBond.purchaseDate = block.timestamp;
        
        // Create transaction record
        uint256 transactionId = _transactionIdCounter++;
        _transactions[transactionId] = Transaction({
            id: transactionId,
            userAddress: user,
            bondId: bondId,
            isBuy: true,
            quantity: quantity,
            price: amount,
            timestamp: block.timestamp
        });
        
        _userTransactionIds[user].push(transactionId);
        
        // Update bond status if sold out
        if (bond.availableSupply == 0) {
            bond.status = BondStatus.SOLD_OUT;
            emit BondUpdated(bondId, bond.price, bond.availableSupply, bond.status);
        }
        
        emit BondBought(transactionId, user, bondId, quantity, amount);
        
        return transactionId;
    }

    /**
     * @dev Allows platform to sell bonds on behalf of a user
     * @param user Address of the user
     * @param bondId ID of the bond to sell
     * @param quantity Number of units to sell
     * @return The transaction ID
     */
    function sellBondFor(
        address user,
        uint256 bondId,
        uint256 quantity
    ) public onlyRole(OPERATOR_ROLE) whenNotPaused returns (uint256) {
        Bond storage bond = _bonds[bondId];
        require(bond.id == bondId, "Bond does not exist");
        
        UserBondBalance storage userBond = _userBondBalances[user][bondId];
        require(userBond.quantity >= quantity, "Insufficient bond quantity");
        
        // Calculate sell price
        uint256 totalPrice = bond.price * quantity;
        
        // Update user bond balance
        userBond.quantity -= quantity;
        
        // Update bond supply
        bond.availableSupply += quantity;
        
        // Update bond status if it was sold out
        if (bond.status == BondStatus.SOLD_OUT) {
            bond.status = BondStatus.ACTIVE;
            emit BondUpdated(bondId, bond.price, bond.availableSupply, bond.status);
        }
        
        // Create transaction record
        uint256 transactionId = _transactionIdCounter++;
        _transactions[transactionId] = Transaction({
            id: transactionId,
            userAddress: user,
            bondId: bondId,
            isBuy: false,
            quantity: quantity,
            price: totalPrice,
            timestamp: block.timestamp
        });
        
        _userTransactionIds[user].push(transactionId);
        
        emit BondSold(transactionId, user, bondId, quantity, totalPrice);
        
        return transactionId;
    }

    /**
     * @dev Sets a user's balance
     * @param user Address of the user
     * @param amount New balance amount
     */
    function setUserBalance(address user, uint256 amount) public onlyRole(OPERATOR_ROLE) {
        _userBalances[user] = amount;
        emit UserBalanceUpdated(user, amount);
    }

    /**
     * @dev Gets a bond by ID
     * @param bondId ID of the bond
     * @return The bond details
     */
    function getBond(uint256 bondId) public view returns (Bond memory) {
        require(_bonds[bondId].id == bondId, "Bond does not exist");
        return _bonds[bondId];
    }

    /**
     * @dev Gets multiple bonds by IDs
     * @param bondIds Array of bond IDs
     * @return Array of bond details
     */
    function getBonds(uint256[] memory bondIds) public view returns (Bond[] memory) {
        Bond[] memory bonds = new Bond[](bondIds.length);
        for (uint256 i = 0; i < bondIds.length; i++) {
            bonds[i] = _bonds[bondIds[i]];
        }
        return bonds;
    }

    /**
     * @dev Gets all bond IDs
     * @return Array of bond IDs
     */
    function getBondIds() public view returns (uint256[] memory) {
        return _bondIds;
    }

    /**
     * @dev Gets a user's balance
     * @param user Address of the user
     * @return The user's balance
     */
    function getUserBalance(address user) public view returns (uint256) {
        return _userBalances[user];
    }

    /**
     * @dev Gets a user's bond balance
     * @param user Address of the user
     * @param bondId ID of the bond
     * @return The user's bond balance
     */
    function getUserBondBalance(address user, uint256 bondId) public view returns (UserBondBalance memory) {
        return _userBondBalances[user][bondId];
    }

    /**
     * @dev Gets a transaction by ID
     * @param transactionId ID of the transaction
     * @return The transaction details
     */
    function getTransaction(uint256 transactionId) public view returns (Transaction memory) {
        require(_transactions[transactionId].id == transactionId, "Transaction does not exist");
        return _transactions[transactionId];
    }

    /**
     * @dev Gets multiple transactions by IDs
     * @param transactionIds Array of transaction IDs
     * @return Array of transaction details
     */
    function getTransactions(uint256[] memory transactionIds) public view returns (Transaction[] memory) {
        Transaction[] memory transactions = new Transaction[](transactionIds.length);
        for (uint256 i = 0; i < transactionIds.length; i++) {
            transactions[i] = _transactions[transactionIds[i]];
        }
        return transactions;
    }

    /**
     * @dev Gets all transaction IDs for a user
     * @param user Address of the user
     * @return Array of transaction IDs
     */
    function getUserTransactionIds(address user) public view returns (uint256[] memory) {
        return _userTransactionIds[user];
    }

    /**
     * @dev Pauses the contract
     */
    function pause() public onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses the contract
     */
    function unpause() public onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Function that should revert when `msg.sender` is not authorized to upgrade the contract
     */
    function _authorizeUpgrade(address newImplementation)
        internal
        onlyRole(UPGRADER_ROLE)
        override
    {}
}
