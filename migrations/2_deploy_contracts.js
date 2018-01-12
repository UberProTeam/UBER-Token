const UberCrowdsale = artifacts.require('UberCrowdsale.sol');
const UberToken = artifacts.require('UberToken.sol');
const VestingStrategy = artifacts.require('VestingStrategy.sol');
const operatorAddress = 0x0;
const beneficiaryAddress = 0x0;
const teamAddress = 0x0;
const marketingAddress = 0x0;

module.exports = async(deployer) =>  {
    await deployer.deploy(UberCrowdsale,operatorAddress,beneficiaryAddress);
    await deployer.deploy(VestingStrategy,teamAddress,marketingAddress);
    await deployer.deploy(UberToken,UberCrowdsale.address,VestingStrategy.address,operatorAddress);
}