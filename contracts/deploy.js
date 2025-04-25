const { ethers } = require("ethers")
const fs = require("fs")
const path = require("path")

// Load environment variables
require("dotenv").config()

async function main() {
  // Connect to Hedera network
  const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL)

  // Create wallet from private key
  const wallet = new ethers.Wallet(process.env.HEDERA_PRIVATE_KEY, provider)

  console.log(`Deploying contracts with account: ${wallet.address}`)
  console.log(`Account balance: ${ethers.utils.formatEther(await wallet.getBalance())}`)

  // Load contract ABI and bytecode
  const contractPath = path.join(
    __dirname,
    "artifacts/contracts/ShillingiXAssetManager.sol/ShillingiXAssetManager.json",
  )
  const contractJson = JSON.parse(fs.readFileSync(contractPath, "utf8"))

  // Deploy contract
  const ContractFactory = new ethers.ContractFactory(contractJson.abi, contractJson.bytecode, wallet)

  console.log("Deploying ShillingiXAssetManager...")
  const contract = await ContractFactory.deploy()

  console.log(`Contract deployed to: ${contract.address}`)
  console.log("Waiting for confirmation...")

  await contract.deployed()

  console.log("Contract deployment confirmed!")
  console.log(`Contract address: ${contract.address}`)

  // Save contract address to .env file
  const envPath = path.join(__dirname, "../.env")
  let envContent = ""

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8")
  }

  // Update or add CONTRACT_ADDRESS
  if (envContent.includes("NEXT_PUBLIC_CONTRACT_ADDRESS=")) {
    envContent = envContent.replace(
      /NEXT_PUBLIC_CONTRACT_ADDRESS=.*/,
      `NEXT_PUBLIC_CONTRACT_ADDRESS=${contract.address}`,
    )
  } else {
    envContent += `\nNEXT_PUBLIC_CONTRACT_ADDRESS=${contract.address}`
  }

  fs.writeFileSync(envPath, envContent)
  console.log("Updated .env file with contract address")

  // Save contract ABI to a file for easy access
  const abiPath = path.join(__dirname, "../contracts/ShillingiXAssetManager.json")
  fs.writeFileSync(abiPath, JSON.stringify(contractJson.abi, null, 2))
  console.log("Saved contract ABI to contracts/ShillingiXAssetManager.json")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
