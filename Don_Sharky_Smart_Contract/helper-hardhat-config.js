const networkConfig = {
    31337: {
        name: "localhost",
    },
    5: {
        name: "goerli",
    },
    80001: {
        name: "mumbai",
    },
    137: {
        name: "polygon",
    },
};

const developmentChains = ["hardhat", "localhost", "goerli"];
const deploymentChains = ["goerli", "polygon"];
const VERIFICATION_BLOCK_CONFIRMATIONS = 6;
const frontendContractsFile = "../Frontend_Don_Sharky/web3Constants/networkMapping.json";
const frontendAbiLocation = "../Frontend_Don_Sharky/web3Constants/";
module.exports = {
    networkConfig,
    developmentChains,
    deploymentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
    frontendContractsFile,
    frontendAbiLocation,
};
