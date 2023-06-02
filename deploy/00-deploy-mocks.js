const { network, ethers } = require("hardhat")
const { developmentChains, DECIMALS, INITIAL_ANSWER } = require("../helper-hardhat-config")

const BASE_FEE = ethers.utils.parseEther("0.25") //LINK it costs per request
const GAS_PRICE_LINK = 1e9 //link per gas // calculated value based on the gas price of the chain

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: [BASE_FEE, GAS_PRICE_LINK],
        })
        log("Mocks deployed!")
        log("-----------------------------------------------------------------")
    }
}
module.exports.tags = ["all", "mocks"]
