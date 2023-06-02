const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { getNamedAccounts, deployments, network, ethers } = require("hardhat")
const { assert, expect } = require("chai")
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Lottery Staging Test", function () {
          let lottery, lotteryEntranceFee, deployer

          beforeEach(async function () {
              console.log("Before each")
              deployer = (await getNamedAccounts()).deployer
              lottery = await ethers.getContract("Lottery", deployer)
              lotteryEntranceFee = await lottery.getEntranceFee()
          })

          it("works with live Chainlink Keepers and Chainlink VRF, wee get a random winner", async function () {
              console.log("Setting up test...")
              const startingTimestamp = await lottery.getLatestTimeStamp()
              const accounts = await ethers.getSigners()

              //setup listener before we enter the lottery
              //just in case the blockchain moves REALLY fast
              console.log("Setting up Listener...")
              await new Promise(async (resolve, reject) => {
                  lottery.once("WinnerPicked", async () => {
                      console.log("WinnerPicked event fired!")

                      try {
                          //add our asserts here
                          const lotteryWinner = await lottery.getRecentWinner()
                          const lotteryState = await lottery.getLotteryState()
                          const winnerEndingBalance = await accounts[0].getBalance()
                          const endingTimeStamp = await lottery.getLatestTimeStamp()

                          await expect(lottery.getPlayer(0)).to.be.reverted
                          assert.equal(lotteryWinner.toString(), accounts[0].address)
                          assert.equal(lotteryState, 0)
                          assert.equal(
                              winnerEndingBalance.toString(),
                              winnerStartingBalance.add(lotteryEntranceFee).toString()
                          )
                          assert(endingTimeStamp > startingTimestamp)
                          resolve()
                      } catch (e) {
                          console.log(e)
                          reject(e)
                      }
                  })
                  console.log("Entering lottery...")
                  //Then entering the lottery
                  const tx = await lottery.enterLottery({ value: lotteryEntranceFee })
                  await tx.wait(1)
                  const winnerStartingBalance = await accounts[0].getBalance()
                  console.log(`Starting balance for only participant: ${winnerStartingBalance}`)
              })

              //this code won't finish until the listener has finished listening
          })
      })
