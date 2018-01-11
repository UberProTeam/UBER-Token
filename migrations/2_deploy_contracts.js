const UberCrowdsale = artifacts.require('UberCrowdsale.sol');
const UberToken = artifacts.require('UberToken.sol');
const VestingStrategy = artifacts.require('VestingStrategy.sol');

module.exports = async(deployer) =>  {
    await deployer.deploy(UberCrowdsale);
    await deployer.deploy(VestingStrategy);
    await deployer.deploy(UberToken,UberCrowdsale.address,VestingStrategy.address);
}