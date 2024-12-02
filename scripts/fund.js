const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
    const { deployer } = await getNamedAccounts();
    const FundMe = await ethers.getContract("FundMe", deployer);
    console.log("Funding the contract");
    const transactionResponse = await FundMe.fund({
        value: ethers.parseEther("1"),
    });

    await transactionResponse.wait(1);

    console.log("Funded");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
