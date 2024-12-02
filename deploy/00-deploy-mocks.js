const { network } = require("hardhat");
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    // log(`Network Name: ${network.name}`);
    // log(`Deployer: ${deployer}`);
    // log(`Development Chains: ${developmentChains}`);
    // log(`Decimals: ${DECIMALS}`);
    // log(`Initial Answer: ${INITIAL_ANSWER}`);

    if (developmentChains.includes(network.name)) {
        log("Local network detected, deploying mocks...");

        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        });

        log("Mocks deployed");
        log("-------------------------------------------------------------");
    }
};

module.exports.tags = ["all", "mocks"];
