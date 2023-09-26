// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const { ethers, artifacts } = hre;

async function main() {
  if (network.name === "hardhat") {
    console.warn("You are trying to deploy a contract to the Hardhat Network");
  }
  const [acc1, acc2] = await ethers.getSigners();
  console.log("Deploying with", await acc1.getAddress());
  const contract = await ethers.deployContract("AucEngine");
  await contract.waitForDeployment();
  const auctions = fs.readFileSync(path.join(__dirname, "../server/db.json"));
  const data = await JSON.parse(auctions);
  for (let i = 0; i < data.auctions.length; i++) {
    const { stopped, startPrice, discount, id, duration } = data.auctions[i];
    if (!stopped) {
      const tx = await contract
        .connect(acc2)
        .createAuction(BigInt(startPrice), BigInt(discount), id, duration);
      await tx.wait();
    }
  }

  await saveFrontendFiles({
    AucEngine: contract,
  });
}

async function saveFrontendFiles(contracts) {
  const dir = path.join(__dirname, "../client/src/lib/contracts");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  Object.entries(contracts).forEach(async (item) => {
    const [name, contract] = item;
    if (contract) {
      const address = await contract.getAddress();
      const p = path.join(dir, "/", `${name}-contract-address.json`);
      fs.writeFileSync(
        path.join(dir, "/", `${name}-contract-address.json`),
        JSON.stringify({ [name]: address }, undefined, 2)
      );
    }
    const ContractArtifact = artifacts.readArtifactSync(name);
    fs.writeFileSync(
      path.join(dir, "/", name + ".json"),
      JSON.stringify(ContractArtifact, null, 2)
    );
  });
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
