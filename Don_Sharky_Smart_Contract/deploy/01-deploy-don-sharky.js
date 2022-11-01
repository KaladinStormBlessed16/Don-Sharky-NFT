const { network } = require("hardhat");
const {
    developmentChains,
    deploymentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS;

    const arguments = ["Don Sharky", "DSK", "ipfs://", "ipfs://"];
    const donSharky = await deploy("DonSharky", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    });

    if (deploymentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...");
        await verify(donSharky.address, arguments);
    }
    log("----------------------------------------------------");
};

module.exports.tags = ["all", "nft"];
