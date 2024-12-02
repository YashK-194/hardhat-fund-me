const { ethers, run, network } = require("hardhat");
require("dotenv").config();

const verify = async (contractAddress, args) => {
    console.log("Verifying contract on Etherscan...");
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Contract is already verified");
        } else {
            console.log(e);
        }
    }
};

module.exports = { verify };
