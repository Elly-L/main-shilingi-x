# Shilingi X Smart Contract Integration Guide

This document provides guidance on integrating the Shilingi X Asset Manager smart contract with your frontend and backend systems.

## Overview

The Shilingi X platform uses a centralized wallet model where:

1. Users don't have personal blockchain wallets
2. All transactions route through the platform's system wallet
3. User balances and asset ownership are tracked internally
4. Only admins can issue new assets, configure prices, and manage supply

## Integration Points

### Backend Integration

1. **Admin Operations**:
   - Use the admin functions to issue new assets, update prices, and manage supply
   - Implement a secure admin panel that connects to the contract with admin privileges

2. **User Balance Management**:
   - When users deposit funds via M-Pesa, call `setUserBalance` to update their balance
   - When users withdraw funds, update their balance accordingly

3. **Transaction Monitoring**:
   - Listen for events like `AssetBought`, `AssetSold`, and `UserBalanceUpdated`
   - Update your database with transaction records

### Frontend Integration

1. **Asset Display**:
   - Use `getAssetIds()` and `getAssets()` to fetch available assets
   - Display asset details, prices, and availability

2. **User Portfolio**:
   - Use `getUserAssetBalance()` to show users their holdings
   - Use `getUserTransactionIds()` and `getTransactions()` to display transaction history

3. **Trading Interface**:
   - Implement buy/sell forms that call `buyAsset()` and `sellAsset()`
   - Show confirmation dialogs and success/error messages

## Deployment

1. Deploy the contract using the UUPS proxy pattern for upgradeability
2. Set up proper access control by assigning admin and operator roles
3. Configure environment variables for contract addresses

## Security Considerations

1. Always use proper access control for admin functions
2. Implement rate limiting for user operations
3. Add comprehensive error handling for all contract interactions
4. Use the emergency pause functionality in case of issues

## Testing

1. Test all functions in a development environment before production
2. Verify event emissions and state changes
3. Test edge cases like insufficient balance, sold-out assets, etc.

For more information, contact the Shilingi X development team.
