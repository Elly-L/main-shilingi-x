/**
 * Utility functions for Hedera blockchain integration
 */

import { ethers } from "ethers"

/**
 * Convert a Hedera account ID (0.0.12345) to an Ethereum-compatible address
 * This is needed because the smart contract expects Ethereum addresses
 */
export function hederaIdToAddress(accountId: string): string {
  try {
    // Parse the account ID
    const parts = accountId.split(".")
    if (parts.length !== 3) {
      throw new Error("Invalid Hedera account ID format")
    }

    // Convert to a number (last part is the account number)
    const accountNum = Number.parseInt(parts[2], 10)

    // Convert to hex and pad to 20 bytes (40 hex chars)
    return ethers.utils.hexZeroPad(ethers.utils.hexlify(accountNum), 20)
  } catch (error) {
    console.error("Error converting Hedera ID to address:", error)
    throw error
  }
}

/**
 * Convert an Ethereum address to a Hedera account ID format
 * This is an approximation as the actual mapping depends on the Hedera network
 */
export function addressToHederaId(address: string): string {
  try {
    // Remove 0x prefix if present
    const cleanAddress = address.startsWith("0x") ? address.substring(2) : address

    // Convert to a number
    const accountNum = Number.parseInt(cleanAddress, 16)

    // Format as Hedera account ID (assuming testnet 0.0.X format)
    return `0.0.${accountNum}`
  } catch (error) {
    console.error("Error converting address to Hedera ID:", error)
    throw error
  }
}

/**
 * Format a blockchain transaction hash for display
 */
export function formatTxHash(hash: string, length = 8): string {
  if (!hash) return ""
  if (hash.length <= length * 2) return hash

  return `${hash.substring(0, length)}...${hash.substring(hash.length - length)}`
}

/**
 * Get Hashscan URL for a transaction
 */
export function getHashscanUrl(txHash: string, network: "mainnet" | "testnet" = "testnet"): string {
  return `https://hashscan.io/${network}/transaction/${txHash}`
}
