import { ethers } from "ethers"

// Convert a Hedera account ID (0.0.123456) to an Ethereum address format
export const hederaIdToAddress = (accountId: string): string => {
  try {
    // Remove the '0.0.' prefix if present
    const cleanId = accountId.replace(/^0\.0\./, "")

    // Convert to a number
    const idNumber = Number.parseInt(cleanId, 10)

    // Convert to hex and pad to 20 bytes (40 hex chars)
    return ethers.utils.hexZeroPad(ethers.utils.hexlify(idNumber), 20)
  } catch (error) {
    console.error("Error converting Hedera ID to address:", error)
    throw error
  }
}

// Convert an Ethereum address to a Hedera account ID format
export const addressToHederaId = (address: string): string => {
  try {
    // Remove '0x' prefix and convert to number
    const idNumber = Number.parseInt(address.replace(/^0x0+/, ""), 16)

    // Format as Hedera account ID
    return `0.0.${idNumber}`
  } catch (error) {
    console.error("Error converting address to Hedera ID:", error)
    throw error
  }
}

// Format gas fees for display
export const formatGasFee = (gasFee: ethers.BigNumber): string => {
  return ethers.utils.formatUnits(gasFee, 8) + " HBAR"
}

// Estimate gas for a transaction
export const estimateGas = async (contract: ethers.Contract, method: string, params: any[]): Promise<string> => {
  try {
    const gasEstimate = await contract.estimateGas[method](...params)
    return formatGasFee(gasEstimate)
  } catch (error) {
    console.error("Error estimating gas:", error)
    return "Unknown"
  }
}
