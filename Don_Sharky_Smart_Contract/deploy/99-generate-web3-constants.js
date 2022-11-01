const {
    frontendContractsFile,
    frontendAbiLocation,
    networkConfig,
} = require("../helper-hardhat-config");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { network } = require("hardhat");

module.exports = async () => {
    console.log("Exporting addresses and abi...");
    await updateContractAddresses();
    await updateAbi();
    console.log("Json written!");
};

async function updateAbi() {
    const chainId = network.config.chainId.toString();
    const donSharky = await ethers.getContract("DonSharky");

    fs.writeFileSync(
        `${frontendAbiLocation}${networkConfig[chainId].name}/DonSharky.json`,
        donSharky.interface.format(ethers.utils.FormatTypes.json)
    );
}

async function updateContractAddresses() {
    const chainId = network.config.chainId.toString();
    const donSharky = await ethers.getContract("DonSharky");
    const contractAddresses = JSON.parse(fs.readFileSync(frontendContractsFile, "utf8"));

    contractAddresses[chainId] = {
        DonSharky: [donSharky.address],
    };

    fs.writeFileSync(frontendContractsFile, JSON.stringify(contractAddresses));
}
module.exports.tags = ["all", "json"];
