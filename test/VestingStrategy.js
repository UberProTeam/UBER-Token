const VESTING = artifacts.require('VestingStrategy.sol');
const UBER = artifacts.require('UberToken.sol');
const Utils = require('./helpers/Utils');
const BigNumber = require('bignumber.js');



contract("VestingStrategy", (accounts) => {
    let crowdsaleAddress;
    let vestingAddress;
    let teamAddress;
    let marketingAddress;
    let founder;
    let FounderMultisigAddress2;
    let holder1;
    let holder2;
    let slotAmount = 3375000;

    before(async() => {
        founder = accounts[0];
        holder1 = accounts[1];
        holder2 = accounts[2];
        crowdsaleAddress = accounts[3];
        vestingAddress = accounts[4];
        teamAddress = accounts[5];
        marketingAddress = accounts[6];
        
    });

    it("Verify constructors",async()=>{
        let vesting = await VESTING.new(teamAddress, marketingAddress);

        let currentTime = Math.floor(new Date().getTime()/1000);
        
        let marketAddr = await vesting.marketingAddress();
        assert.equal(marketAddr.toString(), marketingAddress);

        let teamAddr = await vesting.teamAddress();
        assert.equal(teamAddr.toString(), teamAddress);

        let founderAddr = await vesting.founderAddress();
        assert.equal(founderAddr.toString(), founder);

        let firstSlotTimestamp = new BigNumber(await vesting.firstSlotTimestamp()).toNumber();
        let secondSlotTimestamp = new BigNumber(await vesting.secondSlotTimestamp()).toNumber();
        assert.equal( await Utils.timeDifference(secondSlotTimestamp, firstSlotTimestamp), 15552000); // 15552000 = 180 days
        
        let thirdSlotTimestamp = new BigNumber(await vesting.thirdSlotTimestamp()).toNumber();
        assert.equal( await Utils.timeDifference(thirdSlotTimestamp, secondSlotTimestamp), 15552000); // 15552000 = 180 days
        
        let finalSlotTimestamp = new BigNumber(await vesting.finalSlotTimestamp()).toNumber();
        assert.equal( await Utils.timeDifference(finalSlotTimestamp, thirdSlotTimestamp), 15552000); // 15552000 = 180 days
        
        let vestingPeriod = new BigNumber(await vesting.vestingPeriod()).toNumber();
        assert.equal( await Utils.timeDifference(vestingPeriod, currentTime), 63072000); // 63072000 = 2*365 = 730 days
        
    });

    it('setTokenAddress: token address will be set', async() => {
        let vesting = await VESTING.new(teamAddress, marketingAddress);
        let uber = await UBER.new(crowdsaleAddress, vesting.address, founder);
        await vesting.setTokenAddress(uber.address, {from: founder}); 
    });

    it('setTokenAddress: try to set token address using address different from founder (Should fail)', async() => {
        let vesting = await VESTING.new(teamAddress, marketingAddress);
        try{
            let uber = await UBER.new(crowdsaleAddress, vesting.address, founder);
            await vesting.setTokenAddress(uber.address, {from: holder1});        
        }catch (error) {
           // console.log(error);
           return Utils.ensureException(error);
        }        
    });
    

    it('setTokenAddress: should NOT let a founder address to set the token address when token is set (will fail)', async() => {
        let vesting = await VESTING.new(teamAddress, marketingAddress);
        let uber1 = await UBER.new(crowdsaleAddress, vesting.address, founder);
        await vesting.setTokenAddress(uber1.address, {from: founder});
        try{
            let uber2 = await UBER.new(crowdsaleAddress, vesting.address, founder);
            await vesting.setTokenAddress(uber2.address, {from: founder});
        }catch (error) {
            //console.log(error);
            return Utils.ensureException(error);
        }        
    });

    

});



