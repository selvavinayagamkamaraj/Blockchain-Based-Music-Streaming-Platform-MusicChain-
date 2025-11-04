// scripts/deploy.js
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying MusicRoyalty_Marketplace...");

  // 1️⃣ Compile contracts (optional but safe)
  await hre.run("compile");

  // 2️⃣ Deploy contract
  const MusicRoyalty = await hre.ethers.getContractFactory("MusicRoyalty_Marketplace");
  const musicRoyalty = await MusicRoyalty.deploy();

  await musicRoyalty.waitForDeployment();

  const contractAddress = await musicRoyalty.getAddress();
  console.log(`✅ Deployed at: ${contractAddress}`);

  // 3️⃣ Build contract info object
  const contractInfo = {
    address: contractAddress,
    abi: JSON.parse(musicRoyalty.interface.formatJson()),
    network: hre.network.name,
    deployedAt: new Date().toISOString()
  };

  // 4️⃣ Define frontend output path
  const frontendDir = path.join(__dirname, "../client/src");
  const outputPath = path.join(frontendDir, "contractInfo.json");

  // Ensure directory exists
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  // 5️⃣ Save JSON file
  fs.writeFileSync(outputPath, JSON.stringify(contractInfo, null, 2));

  console.log(`📝 Contract info saved to ${outputPath}`);
  console.log("📦 ABI preview:", Object.keys(contractInfo.abi).length, "entries");
  console.log("🌐 Network:", hre.network.name);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
