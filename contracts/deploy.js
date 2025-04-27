const {
  Client,
  PrivateKey,
  FileCreateTransaction,
  ContractCreateTransaction,
  Hbar,
  ContractFunctionParameters,
} = require("@hashgraph/sdk")
const fs = require("fs")
const path = require("path")

// Get compiled contract data
const contractBytecode = fs.readFileSync(
  path.join(__dirname, "ShilingiXInvestmentManager_sol_ShilingiXInvestmentManager.bin"),
)

async function deployContract() {
  // Configure your Hedera testnet account
  const myAccountId = process.env.HEDERA_ACCOUNT_ID || "0.0.5771173"
  const myPrivateKey =
    process.env.HEDERA_PRIVATE_KEY || "9f4f65ac66abe554e6213fadc6cc72af5b085a40296e454c25ead25f8f80d3ea"

  // Create Hedera client
  const client = Client.forTestnet()
  client.setOperator(myAccountId, myPrivateKey)

  console.log(`Using account: ${myAccountId}`)
  console.log("Deploying contract to Hedera Testnet...")

  // Create a file on Hedera containing the contract bytecode
  const fileCreateTx = new FileCreateTransaction()
    .setKeys([PrivateKey.fromString(myPrivateKey)])
    .setContents(contractBytecode)

  const fileCreateSubmit = await fileCreateTx.execute(client)
  const fileCreateRx = await fileCreateSubmit.getReceipt(client)
  const bytecodeFileId = fileCreateRx.fileId
  console.log(`- The bytecode file ID is: ${bytecodeFileId}`)

  // Create the smart contract
  const contractCreateTx = new ContractCreateTransaction()
    .setBytecodeFileId(bytecodeFileId)
    .setGas(100000)
    .setConstructorParameters(new ContractFunctionParameters())

  const contractCreateSubmit = await contractCreateTx.execute(client)
  const contractCreateRx = await contractCreateSubmit.getReceipt(client)
  const contractId = contractCreateRx.contractId

  console.log(`- The smart contract ID is: ${contractId}`)
  console.log(`- Contract successfully deployed to Hedera Testnet!`)
  console.log(`- Use this contract ID in your application: ${contractId}`)

  return contractId
}

// Run the deployment function
deployContract().catch((error) => {
  console.error("Deployment failed:", error)
  process.exit(1)
})
