const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Don Sharky Unit Tests", function () {
          let donSharky, deployer, user1, user2;

          beforeEach(async () => {
              accounts = await ethers.getSigners();
              [deployer, user1, user2] = accounts;

              await deployments.fixture(["nft"]);

              const donSharkyContract = await ethers.getContract("DonSharky");
              donSharky = donSharkyContract.connect(deployer);
              await donSharky.switchPause();
          });

          describe("constructor", () => {
              it("sets starting values correctly", async function () {
                  const isPaused = await donSharky.isPaused();
                  assert.equal(isPaused, false);
              });
          });

          describe("Mint NFT on WhiteList", () => {
              it("emits an event", async function () {
                  await donSharky.setMintPhase(0);
                  await donSharky.addToWhitelist([user1.address]);
                  const fee = await donSharky.getCost();
                  assert.equal(ethers.utils.formatEther(fee), 70);
                  await expect(donSharky.connect(user1).mint(1, { value: fee.toString() })).to.emit(
                      donSharky,
                      "NftMinted"
                  );
              });
          });

          describe("Mint NFT on Public Sale", () => {
              it("fails if payment isn't sent with the request", async function () {
                  await donSharky.setMintPhase(2);
                  await expect(donSharky.connect(user1).mint(1)).to.be.revertedWithCustomError(
                      donSharky,
                      "payAmountErr"
                  );
              });

              it("reverts if payment amount is less than the mint fee", async function () {
                  await donSharky.setMintPhase(2);
                  const fee = await donSharky.getCost();
                  await expect(
                      donSharky.connect(user1).mint(1, {
                          value: fee.sub(ethers.utils.parseEther("0.001")),
                      })
                  ).to.be.revertedWithCustomError(donSharky, "payAmountErr");
              });

              it("reverts if mint amount is 0 or bigger than maxMintAmount", async function () {
                  await donSharky.setMintPhase(2);
                  const fee = await donSharky.getCost();

                  await expect(
                      donSharky.connect(user1).mint(0, {
                          value: fee.sub(ethers.utils.parseEther("0.001")),
                      })
                  ).to.be.revertedWithCustomError(donSharky, "mintAmountErr");

                  await expect(
                      donSharky.connect(user1).mint(21, {
                          value: fee.sub(ethers.utils.parseEther("0.001")),
                      })
                  ).to.be.revertedWithCustomError(donSharky, "mintAmountErr");
              });

              it("emits an event", async function () {
                  await donSharky.setMintPhase(2);
                  const fee = await donSharky.getCost();
                  await expect(donSharky.connect(user1).mint(1, { value: fee.toString() })).to.emit(
                      donSharky,
                      "NftMinted"
                  );
              });
          });
      });
