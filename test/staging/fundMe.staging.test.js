const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");
const { getNamedAccounts, ethers, network } = require("hardhat");

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let FundMe;
          let deployer;
          const sendValue = ethers.parseEther("1"); // 1Eth
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer;
              // secondAccount = (await getNamedAccounts()).secondAccount;
              // await deployments.fixture(["all"]); // we are not doing any fixtures because we are assuming our contract has already been deployed on the chain
              FundMe = await ethers.getContract("FundMe", deployer);
          });

          it("Allows people to fund and withdraw", async function () {
              await FundMe.fund({ value: sendValue });
              await FundMe.withdraw();
              const address = await FundMe.getAddress();
              const enndingBalance = await ethers.provider.getBalance(address);
              assert.equal(enndingBalance.toString(), "0");
          });
      });
