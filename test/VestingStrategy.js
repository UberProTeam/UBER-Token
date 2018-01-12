const VESTING = artifacts.require('VestingStrategy.sol');
const UBER = artifacts.require('UberToken.sol');
const Utils = require('./helpers/Utils');
const time = require('./helpers/time');
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
        assert.equal( await Utils.timeDifference(finalSlotTimestamp, thirdSlotTimestamp), 16416000); // 16416000 = 190 days
        
        let vestingPeriod = new BigNumber(await vesting.vestingPeriod()).toNumber();
        assert.closeTo( await Utils.timeDifference(vestingPeriod, firstSlotTimestamp), 47520000, 3); // 63072000 = 2*365 = 730 days
        
    });

    it('setTokenAddress: token address will be set, only contract address will be allowed', async() => {
        let vesting = await VESTING.new(teamAddress, marketingAddress);
        let uber = await UBER.new(crowdsaleAddress, vesting.address, founder);
        await vesting.setTokenAddress(uber.address, {from: founder}); 
        assert.notEqual(web3.eth.getCode(uber.address),'0x0'); // Must be a contract address       
        let tokenAddr = await vesting.tokenAddress();
        assert.equal(tokenAddr.toString(), uber.address);
    });

    it('setTokenAddress: trying to set token address with a non-founder address (Should fail)', async() => {
        let vesting = await VESTING.new(teamAddress, marketingAddress);
        try{
            let uber = await UBER.new(crowdsaleAddress, vesting.address, founder);
            await vesting.setTokenAddress(uber.address, {from: holder1});        
        }catch (error) {
            Utils.ensureException(error);
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
                Utils.ensureException(error);
        }        
    });

    it('releaseTokenToMarketing: token assigned to marketing address will be released', async() => {
        let vesting = await VESTING.new(teamAddress, marketingAddress);
        let uber = await UBER.new(crowdsaleAddress, vesting.address, founder);
        await vesting.setTokenAddress(uber.address, {from: founder}); 
        await time.increaseTime(15552000);       
        await vesting.releaseTokenToMarketing({from: founder});
        let _balance1 = await uber
                        .balanceOf
                        .call(marketingAddress);
        assert.strictEqual(_balance1.dividedBy(new BigNumber(10).pow(18)).toNumber(), 2*3375000); 
    });

    it('releaseTokenToMarketing: trying to release marketing token without setting token address (will fail)', async() => {
        let vesting = await VESTING.new(teamAddress, marketingAddress);
        let uber = await UBER.new(crowdsaleAddress, vesting.address, founder); 
        await time.increaseTime(15552000);
        try{
            await vesting.releaseTokenToMarketing({from: founder});
        }catch(error){
            Utils.ensureException(error);
        }
    });

    it('releaseTokenToMarketing: trying to release marketing token before 180 days (will fail)', async() => {
        let vesting = await VESTING.new(teamAddress, marketingAddress);
        let uber = await UBER.new(crowdsaleAddress, vesting.address, founder);
        await vesting.setTokenAddress(uber.address, {from: founder});       
        
        await vesting.releaseTokenToMarketing({from: founder});
        let _balance1 = await uber
                    .balanceOf
                    .call(marketingAddress);
        //Token Balance of marketing Address should be zero
        assert.strictEqual(_balance1.dividedBy(new BigNumber(10).pow(18)).toNumber(), 0);        
    });

    it('releaseTokenToMarketing: trying to release marketing token with a non-founder address (will fail)', async() => {
        let vesting = await VESTING.new(teamAddress, marketingAddress);
        let uber = await UBER.new(crowdsaleAddress, vesting.address, founder); 
        await time.increaseTime(15552000); //180 days
        try{
            await vesting.releaseTokenToMarketing({from: holder1});
        }catch(error){
            Utils.ensureException(error);
        }
    });
    
    it('releaseTokenToTeam: team token release in after each slot of 180 days', async() => {
        let vesting = await VESTING.new(teamAddress, marketingAddress);
        let uber = await UBER.new(crowdsaleAddress, vesting.address, founder);
        
        await vesting.setTokenAddress(uber.address, {from: founder}); 
        await time.increaseTime(15552000);  //180 days  
        await vesting.releaseTokenToTeam({from: founder});
        
        let firstSlotTimestamp = new BigNumber(await vesting.firstSlotTimestamp()).toNumber();
        assert.closeTo(web3.eth.getBlock('latest').timestamp, firstSlotTimestamp, 3); 
        
        let _balance1 = await uber
                        .balanceOf
                        .call(teamAddress);
        assert.strictEqual(_balance1.dividedBy(new BigNumber(10).pow(18)).toNumber(), 3375000); 

        await time.increaseTime(15552000);       
        await vesting.releaseTokenToTeam({from: founder});
        
        let secondSlotTimestamp = new BigNumber(await vesting.secondSlotTimestamp()).toNumber();
        assert.closeTo(web3.eth.getBlock('latest').timestamp, secondSlotTimestamp, 3);
        let _balance2 = await uber
                        .balanceOf
                        .call(teamAddress);
        assert.strictEqual(_balance2.dividedBy(new BigNumber(10).pow(18)).toNumber(), 2*3375000); 

        await time.increaseTime(15552000);       
        await vesting.releaseTokenToTeam({from: founder});
        
        let thirdSlotTimestamp = new BigNumber(await vesting.thirdSlotTimestamp()).toNumber();
        assert.closeTo(web3.eth.getBlock('latest').timestamp, thirdSlotTimestamp, 3); 
        let _balance3 = await uber
                        .balanceOf
                        .call(teamAddress);
        assert.strictEqual(_balance3.dividedBy(new BigNumber(10).pow(18)).toNumber(), 3*3375000); 

        await time.increaseTime(16416000);       
        await vesting.releaseTokenToTeam({from: founder});
        
        let finalSlotTimestamp = new BigNumber(await vesting.finalSlotTimestamp()).toNumber();
        assert.closeTo(web3.eth.getBlock('latest').timestamp, finalSlotTimestamp, 3); 
        let _balance4 = await uber
                        .balanceOf
                        .call(teamAddress);
        assert.strictEqual(_balance4.dividedBy(new BigNumber(10).pow(18)).toNumber(), 4*3375000); 
    });

    it('releaseTokenToTeam: team token release in after 2nd, 3rd, 4th slot of 180 days', async() => {
        let vesting = await VESTING.new(teamAddress, marketingAddress);
        let uber = await UBER.new(crowdsaleAddress, vesting.address, founder);
        
        await vesting.setTokenAddress(uber.address, {from: founder}); 
        await time.increaseTime(2*15552000);       
        await vesting.releaseTokenToTeam({from: founder});
        
        let secondSlotTimestamp = new BigNumber(await vesting.secondSlotTimestamp()).toNumber();
        assert.closeTo(web3.eth.getBlock('latest').timestamp, secondSlotTimestamp, 3);
        
        let _balance2 = await uber
                        .balanceOf
                        .call(teamAddress);
        assert.strictEqual(_balance2.dividedBy(new BigNumber(10).pow(18)).toNumber(), 2*3375000); 

        await time.increaseTime(15552000);       
        await vesting.releaseTokenToTeam({from: founder});
        
        let thirdSlotTimestamp = new BigNumber(await vesting.thirdSlotTimestamp()).toNumber();
        assert.closeTo(web3.eth.getBlock('latest').timestamp, thirdSlotTimestamp, 3); 
        let _balance3 = await uber
                        .balanceOf
                        .call(teamAddress);
        assert.strictEqual(_balance3.dividedBy(new BigNumber(10).pow(18)).toNumber(), 3*3375000); 

        await time.increaseTime(16416000);       
        await vesting.releaseTokenToTeam({from: founder});
        
        let finalSlotTimestamp = new BigNumber(await vesting.finalSlotTimestamp()).toNumber();
        assert.closeTo(web3.eth.getBlock('latest').timestamp, finalSlotTimestamp, 3); 
        let _balance4 = await uber
                        .balanceOf
                        .call(teamAddress);
        assert.strictEqual(_balance4.dividedBy(new BigNumber(10).pow(18)).toNumber(), 4*3375000); 
    });


    

    it('releaseTokenToTeam: team token release in after 1st, 3rd, 4th slot of 180 days', async() => {
        let vesting = await VESTING.new(teamAddress, marketingAddress);
        let uber = await UBER.new(crowdsaleAddress, vesting.address, founder);
        
        await vesting.setTokenAddress(uber.address, {from: founder}); 
        await time.increaseTime(15552000);       
        await vesting.releaseTokenToTeam({from: founder});
        
        let firstSlotTimestamp = new BigNumber(await vesting.firstSlotTimestamp()).toNumber();
        assert.closeTo(web3.eth.getBlock('latest').timestamp, firstSlotTimestamp, 3);
        let _balance2 = await uber
                        .balanceOf
                        .call(teamAddress);
        assert.strictEqual(_balance2.dividedBy(new BigNumber(10).pow(18)).toNumber(), 3375000); 

        await time.increaseTime(2*15552000);       
        await vesting.releaseTokenToTeam({from: founder});
        
        let thirdSlotTimestamp = new BigNumber(await vesting.thirdSlotTimestamp()).toNumber();
        assert.closeTo(web3.eth.getBlock('latest').timestamp, thirdSlotTimestamp, 3); 
        let _balance3 = await uber
                        .balanceOf
                        .call(teamAddress);
        assert.strictEqual(_balance3.dividedBy(new BigNumber(10).pow(18)).toNumber(), 3*3375000); 

        await time.increaseTime(16416000);       
        await vesting.releaseTokenToTeam({from: founder});
        
        let finalSlotTimestamp = new BigNumber(await vesting.finalSlotTimestamp()).toNumber();
        assert.closeTo(web3.eth.getBlock('latest').timestamp, finalSlotTimestamp, 3); 
        let _balance4 = await uber
                        .balanceOf
                        .call(teamAddress);
        assert.strictEqual(_balance4.dividedBy(new BigNumber(10).pow(18)).toNumber(), 4*3375000); 
    });

    it('releaseTokenToTeam: team token release in after 1st, 4th slot of 180 days', async() => {
        let vesting = await VESTING.new(teamAddress, marketingAddress);
        let uber = await UBER.new(crowdsaleAddress, vesting.address, founder);
        
        await vesting.setTokenAddress(uber.address, {from: founder});  
        await time.increaseTime(15552000);       
        await vesting.releaseTokenToTeam({from: founder});
        
        let firstSlotTimestamp = new BigNumber(await vesting.firstSlotTimestamp()).toNumber();
        assert.closeTo(web3.eth.getBlock('latest').timestamp, firstSlotTimestamp, 3); 
        let _balance = await uber
                        .balanceOf
                        .call(teamAddress);
        assert.strictEqual(_balance.dividedBy(new BigNumber(10).pow(18)).toNumber(), 3375000); 

        await time.increaseTime(2*15552000 + 16416000);       
        await vesting.releaseTokenToTeam({from: founder});
        
        let finalSlotTimestamp = new BigNumber(await vesting.finalSlotTimestamp()).toNumber();
        assert.closeTo(web3.eth.getBlock('latest').timestamp, finalSlotTimestamp, 3); 
        let _balance4 = await uber
                        .balanceOf
                        .call(teamAddress);
        assert.strictEqual(_balance4.dividedBy(new BigNumber(10).pow(18)).toNumber(), 4*3375000); 
    });

    it('releaseTokenToTeam: team token release in after 2nd, 4th slot of 180 days', async() => {
        let vesting = await VESTING.new(teamAddress, marketingAddress);
        let uber = await UBER.new(crowdsaleAddress, vesting.address, founder);
        
        await vesting.setTokenAddress(uber.address, {from: founder});  
        await time.increaseTime(2*15552000);       
        await vesting.releaseTokenToTeam({from: founder});
        
        let secondSlotTimestamp = new BigNumber(await vesting.secondSlotTimestamp()).toNumber();
        assert.closeTo(web3.eth.getBlock('latest').timestamp, secondSlotTimestamp, 3); 
        let _balance2 = await uber
                        .balanceOf
                        .call(teamAddress);
        assert.strictEqual(_balance2.dividedBy(new BigNumber(10).pow(18)).toNumber(), 2*3375000); 

        await time.increaseTime(15552000 + 16416000);       
        await vesting.releaseTokenToTeam({from: founder});
        
        let finalSlotTimestamp = new BigNumber(await vesting.finalSlotTimestamp()).toNumber();
        assert.closeTo(web3.eth.getBlock('latest').timestamp, finalSlotTimestamp, 3); 
        let _balance4 = await uber
                        .balanceOf
                        .call(teamAddress);
        assert.strictEqual(_balance4.dividedBy(new BigNumber(10).pow(18)).toNumber(), 4*3375000); 
    });

    it('releaseTokenToTeam: team token release in after 3rd, 4th slot of 180 days', async() => {
        let vesting = await VESTING.new(teamAddress, marketingAddress);
        let uber = await UBER.new(crowdsaleAddress, vesting.address, founder);
        
        await vesting.setTokenAddress(uber.address, {from: founder});  
        await time.increaseTime(3*15552000);       
        await vesting.releaseTokenToTeam({from: founder});
        
        let thirdSlotTimestamp = new BigNumber(await vesting.thirdSlotTimestamp()).toNumber();
        assert.closeTo(web3.eth.getBlock('latest').timestamp, thirdSlotTimestamp, 3); 
        let _balance3 = await uber
                        .balanceOf
                        .call(teamAddress);
        assert.strictEqual(_balance3.dividedBy(new BigNumber(10).pow(18)).toNumber(), 3*3375000); 

        await time.increaseTime(16416000);       
        await vesting.releaseTokenToTeam({from: founder});
        
        let finalSlotTimestamp = new BigNumber(await vesting.finalSlotTimestamp()).toNumber();
        assert.closeTo(web3.eth.getBlock('latest').timestamp, finalSlotTimestamp, 3); 
        let _balance4 = await uber
                        .balanceOf
                        .call(teamAddress);
        assert.strictEqual(_balance4.dividedBy(new BigNumber(10).pow(18)).toNumber(), 4*3375000); 
    });
    
    it('releaseTokenToTeam: team token release in after 4th slot of 180 days', async() => {
        let vesting = await VESTING.new(teamAddress, marketingAddress);
        let uber = await UBER.new(crowdsaleAddress, vesting.address, founder);
        
        await vesting.setTokenAddress(uber.address, {from: founder});  
        await time.increaseTime(3*15552000 + 16416000);       
        await vesting.releaseTokenToTeam({from: founder});
        
        let finalSlotTimestamp = new BigNumber(await vesting.finalSlotTimestamp()).toNumber();
        assert.closeTo(web3.eth.getBlock('latest').timestamp, finalSlotTimestamp, 3); 
        let _balance4 = await uber
                        .balanceOf
                        .call(teamAddress);
        assert.strictEqual(_balance4.dividedBy(new BigNumber(10).pow(18)).toNumber(), 4*3375000); 
    });

    it('releaseTokenToTeam: trying to release team token without setting token (will fail)', async() => {
        let vesting = await VESTING.new(teamAddress, marketingAddress); 
        await time.increaseTime(15552000); //180 days
        try{
            await vesting.releaseTokenToTeam({from: founder});
        }catch(error){
             Utils.ensureException(error);
        }        
    });
    
    it('releaseTokenToTeam: trying to release team token before 180 days (will fail)', async() => {
        let vesting = await VESTING.new(teamAddress, marketingAddress);
        let uber = await UBER.new(crowdsaleAddress, vesting.address, founder);
        await vesting.setTokenAddress(uber.address, {from: founder});       
        
        await vesting.releaseTokenToTeam({from: founder});
        let _balance1 = await uber
                    .balanceOf
                    .call(teamAddress);
        //Token Balance of team Address should be zero as function called before 180 days duration
        assert.strictEqual(_balance1.dividedBy(new BigNumber(10).pow(18)).toNumber(), 0);        
    });

    it('releaseTokenToTeam: trying to release team token with a non-founder address (will fail)', async() => {
        let vesting = await VESTING.new(teamAddress, marketingAddress);
        let uber = await UBER.new(crowdsaleAddress, vesting.address, founder);
        await vesting.setTokenAddress(uber.address, {from: founder}); 
        await time.increaseTime(15552000); //180 days
        try{
            await vesting.releaseTokenToTeam({from: holder1});
        }catch(error){
            Utils.ensureException(error);
        }
    });
});



