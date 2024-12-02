const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let FundMe;
          let deployer;
          // let secondAccount;
          let MockV3Aggregator;
          const sendValue = ethers.parseEther("1"); // 1Eth
          beforeEach(async function () {
              // const accounts = await ethers.getSigners();
              // const accountZero = accounts[0];

              deployer = (await getNamedAccounts()).deployer;
              // secondAccount = (await getNamedAccounts()).secondAccount;
              await deployments.fixture(["all"]);
              FundMe = await ethers.getContract("FundMe", deployer);

              MockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              );
          });

          describe("Constructor", function () {
              it("Sets the Aggregator address correctly", async function () {
                  const response = await FundMe.getPriceFeed();
                  const mockAddress = await MockV3Aggregator.getAddress();
                  assert.equal(response, mockAddress);
              });

              it("Sets the owner correctly", async function () {
                  const owner = await FundMe.getOwner();
                  assert.equal(owner, deployer);
              });
          });

          describe("Fund function", function () {
              it("Fails if you dont send enough Eth", async function () {
                  await expect(FundMe.fund()).to.be.revertedWith(
                      "Didnt send enough amount"
                  );
              });

              it("Adds funder to the funders array", async function () {
                  await FundMe.fund({ value: sendValue });
                  const funder = await FundMe.getFunder(0);
                  // console.log(funder);
                  // console.log(deployer);
                  assert.equal(funder, deployer);
              });

              it("Correctly updates the addressToAmountFunded mapping", async function () {
                  await FundMe.fund({ value: sendValue });
                  const amount = await FundMe.getAddressToAmountFunded(
                      deployer
                  );
                  assert.equal(amount.toString(), sendValue.toString());
                  // console.log(amount);
                  // console.log(sendValue);
              });
          });

          describe("Withdraw function", function () {
              // since withdraw function takes funds out of the contract, we need to deposit some funds before withdrawing it
              beforeEach(async function () {
                  await FundMe.fund({ value: sendValue });
              });

              it("Withdraw Eth from a single founder", async function () {
                  const address = await FundMe.getAddress();
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(address);
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  const transactionResponse = await FundMe.cheaperWithdraw();
                  const transactionReceipt = await transactionResponse.wait(1);

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      address
                  );
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  assert.equal(endingFundMeBalance, 0);
                  assert(
                      startingDeployerBalance + startingFundMeBalance,
                      endingDeployerBalance
                  );
              });

              it("Withdraws when funded with multiple accounts", async function () {
                  const accounts = await ethers.getSigners();
                  // console.log(accounts);

                  // funding with multiple accounts
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await FundMe.connect(
                          accounts[i]
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }

                  const address = await FundMe.getAddress();
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(address);
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer);
                  // withdrawing the funds
                  const transactionResponse = await FundMe.cheaperWithdraw();
                  const transactionReceipt = await transactionResponse.wait(1);

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      address
                  );
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  // checking if funders array is reset
                  await expect(FundMe.getFunder(0)).to.be.reverted;

                  // checking if addressToAmountFunded is reset
                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await FundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }

                  // checking if all funds are withdrawn
                  assert.equal(endingFundMeBalance, 0);

                  // checking if deployer has recieved the funds
                  assert(
                      startingDeployerBalance + startingFundMeBalance,
                      endingDeployerBalance
                  );
              });

              it("It only allows owner to withdraw funds", async function () {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];

                  // console.log(attacker);
                  const attackerConnectedContract = await FundMe.connect(
                      attacker
                  );
                  await expect(
                      attackerConnectedContract.cheaperWithdraw()
                  ).to.be.revertedWithCustomError(FundMe, "FundMe__NotOwner");
              });
          });
      });
