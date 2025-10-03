import { ethers } from "hardhat";

async function main() {
  console.log("Deploying UserIdentityRegistry...");
  const userIdentityRegistry = await ethers.deployContract("UserIdentityRegistry");
  await userIdentityRegistry.waitForDeployment();
  const userIdentityRegistryAddress = await userIdentityRegistry.getAddress();
  console.log(`UserIdentityRegistry deployed to: ${userIdentityRegistryAddress}`);

  console.log("\nDeploying ProductProvenance...");
  const productProvenance = await ethers.deployContract("ProductProvenance", [userIdentityRegistryAddress]);
  await productProvenance.waitForDeployment();
  console.log(`ProductProvenance deployed to: ${await productProvenance.getAddress()}`);

  console.log("\nDeploying IoTConditionRegistry...");
  const iotConditionRegistry = await ethers.deployContract("IoTConditionRegistry");
  await iotConditionRegistry.waitForDeployment();
  console.log(`IoTConditionRegistry deployed to: ${await iotConditionRegistry.getAddress()}`);
  
  console.log("\nDeploying EscrowPayment...");
  const escrowPayment = await ethers.deployContract("EscrowPayment");
  await escrowPayment.waitForDeployment();
  console.log(`EscrowPayment deployed to: ${await escrowPayment.getAddress()}`);

  console.log("\nDeploying SustainabilityToken...");
  const sustainabilityToken = await ethers.deployContract("SustainabilityToken");
  await sustainabilityToken.waitForDeployment();
  console.log(`SustainabilityToken deployed to: ${await sustainabilityToken.getAddress()}`);

  console.log("\nDeploying ReputationSystem...");
  const reputationSystem = await ethers.deployContract("ReputationSystem");
  await reputationSystem.waitForDeployment();
  console.log(`ReputationSystem deployed to: ${await reputationSystem.getAddress()}`);
  
  console.log("\nDeployment complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
