import { ethers } from "ethers"
import ShilingiXAssetManagerABI from "../contracts/ShilingiXAssetManager.json"

// Contract address for Hedera testnet
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0.0.5895928"

// Hedera RPC URL
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://testnet.hashio.io/api"

// Hedera platform wallet credentials
const HEDERA_ACCOUNT_ID = process.env.HEDERA_ACCOUNT_ID || "0.0.5771173"
const HEDERA_PRIVATE_KEY =
  process.env.HEDERA_PRIVATE_KEY || "9f4f65ac66abe554e6213fadc6cc72af5b085a40296e454c25ead25f8f80d3ea"

// Asset types from the smart contract
export enum AssetType {
  BOND = 0,
  EQUITY = 1,
}

// Asset status from the smart contract
export enum AssetStatus {
  ACTIVE = 0,
  SOLD_OUT = 1,
  EXPIRED = 2,
  SUSPENDED = 3,
}

// Initialize ethers provider
const getProvider = () => {
  // For server-side or when window.ethereum is not available
  return new ethers.providers.JsonRpcProvider(RPC_URL)
}

// Get platform wallet
const getPlatformWallet = () => {
  const provider = getProvider()
  return new ethers.Wallet(HEDERA_PRIVATE_KEY, provider)
}

// Get contract instance
const getContract = (withSigner = false) => {
  const provider = getProvider()
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ShilingiXAssetManagerABI, provider)

  if (withSigner) {
    // Use the platform wallet for signing transactions
    const platformWallet = getPlatformWallet()
    return contract.connect(platformWallet)
  }

  return contract
}

// Service functions
export const contractService = {
  // Get all available assets
  getAssets: async () => {
    try {
      const contract = getContract()
      const assetIds = await contract.getAssetIds()
      const assets = await Promise.all(
        assetIds.map(async (id) => {
          const asset = await contract.getAsset(id)
          return asset
        }),
      )

      return assets.map((asset) => ({
        id: asset.id.toString(),
        name: asset.name,
        description: asset.description,
        assetType: asset.assetType === AssetType.BOND ? "bond" : "equity",
        price: ethers.utils.formatUnits(asset.price, 2), // Assuming price is in cents
        totalSupply: asset.totalSupply.toString(),
        availableSupply: asset.availableSupply.toString(),
        interestRate: asset.interestRate.toNumber() / 100, // Convert basis points to percentage
        maturityDate:
          asset.maturityDate.toNumber() > 0 ? new Date(asset.maturityDate.toNumber() * 1000).toISOString() : null,
        status: AssetStatus[asset.status],
        metadata: asset.metadata,
      }))
    } catch (error) {
      console.error("Error fetching assets:", error)
      throw error
    }
  },

  // Get user balance
  getUserBalance: async (userId) => {
    try {
      const contract = getContract()
      // Convert Supabase user ID to Ethereum address format if needed
      const userAddress = ethers.utils.hexZeroPad(ethers.utils.hexlify(userId), 20)
      const balance = await contract.getUserBalance(userAddress)
      return ethers.utils.formatUnits(balance, 2) // Assuming balance is in cents
    } catch (error) {
      console.error("Error fetching user balance:", error)
      throw error
    }
  },

  // Get user's asset holdings
  getUserAssetBalance: async (userId, assetId) => {
    try {
      const contract = getContract()
      // Convert Supabase user ID to Ethereum address format if needed
      const userAddress = ethers.utils.hexZeroPad(ethers.utils.hexlify(userId), 20)
      const assetBalance = await contract.getUserAssetBalance(userAddress, assetId)

      return {
        quantity: assetBalance.quantity.toString(),
        purchasePrice: ethers.utils.formatUnits(assetBalance.purchasePrice, 2),
        purchaseDate: new Date(assetBalance.purchaseDate.toNumber() * 1000).toISOString(),
      }
    } catch (error) {
      console.error("Error fetching user asset balance:", error)
      throw error
    }
  },

  // Buy an asset on behalf of a user
  buyAsset: async (userId, assetId, quantity, amount) => {
    try {
      const contract = getContract(true)
      // Convert Supabase user ID to Ethereum address format if needed
      const userAddress = ethers.utils.hexZeroPad(ethers.utils.hexlify(userId), 20)

      // Convert amount to wei (smallest unit)
      const amountInCents = ethers.utils.parseUnits(amount.toString(), 2)

      // Call the buyAssetFor function which allows the platform to buy on behalf of the user
      const tx = await contract.buyAssetFor(userAddress, assetId, quantity, amountInCents)
      const receipt = await tx.wait()

      // Find the AssetBought event
      const event = receipt.events.find((e) => e.event === "AssetBought")
      return {
        transactionId: event.args.transactionId.toString(),
        success: true,
        blockchainTxHash: receipt.transactionHash,
      }
    } catch (error) {
      console.error("Error buying asset:", error)
      throw error
    }
  },

  // Sell an asset on behalf of a user
  sellAsset: async (userId, assetId, quantity) => {
    try {
      const contract = getContract(true)
      // Convert Supabase user ID to Ethereum address format if needed
      const userAddress = ethers.utils.hexZeroPad(ethers.utils.hexlify(userId), 20)

      // Call the sellAssetFor function which allows the platform to sell on behalf of the user
      const tx = await contract.sellAssetFor(userAddress, assetId, quantity)
      const receipt = await tx.wait()

      // Find the AssetSold event
      const event = receipt.events.find((e) => e.event === "AssetSold")
      return {
        transactionId: event.args.transactionId.toString(),
        success: true,
        blockchainTxHash: receipt.transactionHash,
      }
    } catch (error) {
      console.error("Error selling asset:", error)
      throw error
    }
  },

  // Issue a new asset (admin only)
  issueAsset: async (name, description, assetType, price, totalSupply, interestRate, maturityDate, metadata) => {
    try {
      const contract = getContract(true)

      // Convert price to cents
      const priceInCents = ethers.utils.parseUnits(price.toString(), 2)

      // Convert interest rate to basis points (multiply by 100)
      const interestRateBps = Math.floor(interestRate * 100)

      // Convert maturity date to timestamp
      const maturityTimestamp = maturityDate ? Math.floor(new Date(maturityDate).getTime() / 1000) : 0

      const tx = await contract.issueAsset(
        name,
        description,
        assetType === "bond" ? AssetType.BOND : AssetType.EQUITY,
        priceInCents,
        totalSupply,
        interestRateBps,
        maturityTimestamp,
        metadata || "",
      )

      const receipt = await tx.wait()

      // Find the AssetIssued event
      const event = receipt.events.find((e) => e.event === "AssetIssued")
      return {
        assetId: event.args.assetId.toString(),
        success: true,
        blockchainTxHash: receipt.transactionHash,
      }
    } catch (error) {
      console.error("Error issuing asset:", error)
      throw error
    }
  },

  // Get user's transaction history
  getUserTransactions: async (userId) => {
    try {
      const contract = getContract()
      // Convert Supabase user ID to Ethereum address format if needed
      const userAddress = ethers.utils.hexZeroPad(ethers.utils.hexlify(userId), 20)

      const transactionIds = await contract.getUserTransactionIds(userAddress)
      const transactions = await Promise.all(
        transactionIds.map(async (id) => {
          const tx = await contract.getTransaction(id)
          return tx
        }),
      )

      return transactions.map((tx) => ({
        id: tx.id.toString(),
        assetId: tx.assetId.toString(),
        isBuy: tx.isBuy,
        quantity: tx.quantity.toString(),
        price: ethers.utils.formatUnits(tx.price, 2),
        timestamp: new Date(tx.timestamp.toNumber() * 1000).toISOString(),
      }))
    } catch (error) {
      console.error("Error fetching user transactions:", error)
      throw error
    }
  },

  // Check if contract is connected
  isConnected: async () => {
    try {
      const provider = getProvider()
      await provider.getNetwork()
      return true
    } catch (error) {
      console.error("Contract connection error:", error)
      return false
    }
  },
}
