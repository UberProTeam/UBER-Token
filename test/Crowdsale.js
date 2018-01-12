const UBERCROWDSALE = artifacts.require('UberCrowdsale.sol');
const UBERTOKEN = artifacts.require('UberToken.sol');
const Utils = require('./helpers/Utils');
const time = require('./helpers/time');
const BigNumber = require('bignumber.js');



contract("Crowdsale", (accounts) => {
    
    let operatorAddress;
    let beneficiaryAddress;
    let vestingAddress;
    let founder;
    let newCrowdsaleAddress;
    let holder1;
    let holder2;
    let holder3;
    let holder4;
    

    before(async() => {
        founder = accounts[0];
        holder1 = accounts[1];
        holder2 = accounts[2];
        holder3 = accounts[3];
        holder4 = accounts[4];
        operatorAddress = accounts[5];
        beneficiaryAddress = accounts[6];
        vestingAddress = accounts[7];
        newCrowdsaleAddress = accounts[8];
    });

    it("Verify constructors",async()=>{
        let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
        
        let operatorAddr = await Uber.operatorAddress();
        assert.equal(operatorAddr.toString(), operatorAddress);

        let beneficiaryAddr = await Uber.beneficiaryAddress();
        assert.equal(beneficiaryAddr.toString(), beneficiaryAddress);

        let startPresale = new BigNumber(await Uber.startPresaleDate()).toNumber();
        let endPresale   = new BigNumber(await Uber.endPresaleDate()).toNumber();
        assert.equal( await Utils.timeDifference(endPresale, startPresale), 2419200); // 2419200 = 28 days
        
    });

   it('setTokenAddress: token address will be set, only contract address will be allowed', async() => {
        let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
        let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder);
        await Uber.setTokenAddress(UberToken.address, {from: operatorAddress}); 
        assert.notEqual(web3.eth.getCode(UberToken.address),'0x0'); // Must be a contract address       
        let tokenAddr = await Uber.tokenAddress();
        assert.equal(tokenAddr.toString(), UberToken.address);
    });

    it('setTokenAddress: trying to set token address with a non-operator address (will fail)', async() => {
        let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
        let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder);
        try{
            await Uber.setTokenAddress(UberToken.address, {from: holder1});        
        }catch (error) {
            Utils.ensureException(error);
        }        
    });
    

    it('setTokenAddress: should NOT let a operator address to set the token address when token is set (will fail)', async() => {
        let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
        let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder);
        await Uber.setTokenAddress(UberToken.address, {from: operatorAddress});
        try{
            let UberToken2 = await UBERTOKEN.new(Uber.address, vestingAddress, founder);
            await Uber.setTokenAddress(UberToken2.address, {from: operatorAddress});
        }catch (error) {
             Utils.ensureException(error);
        }        
    });

    it('endPresale: should gap start after ending the presale', async() => {
        let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
        let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder); 
         await Uber.setTokenAddress(UberToken.address, {from: operatorAddress});
         await time.increaseTime(2419200+10); // 28 days
         assert.strictEqual((await Uber.getState()).toNumber(), 0); //0 = Presale         
         await Uber.endPresale({from: operatorAddress});        
         assert.strictEqual((await Uber.getState()).toNumber(), 1); //1 = Gap
    });

    it('endPresale: trying to end presale without setting the token (will fail)', async() => {
        let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
        try{
            await Uber.endPresale({from: operatorAddress});        
        }catch (error) {
            Utils.ensureException(error);
        }        
    });

    it('endPresale: trying to end presale before end date (will fail)', async() => {
        let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
        let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder); 
        await Uber.setTokenAddress(UberToken.address, {from: operatorAddress});
        try{
            await Uber.endPresale({from: operatorAddress});        
        }catch (error) {
            Utils.ensureException(error);
        }        
    });
    
    it('endPresale: trying to end presale after end date using a non-operator address (will fail)', async() => {
        let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
        let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder); 
        await Uber.setTokenAddress(UberToken.address, {from: operatorAddress});
        await time.increaseTime(2419200+10); // 28 days 
        try{
            await Uber.endPresale({from: holder1});        
        }catch (error) {
            Utils.ensureException(error);
        }        
    });

    it('activeCrowdsale: Should start crowdsale after gap', async() => {
        let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
        let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder); 
        await Uber.setTokenAddress(UberToken.address, {from: operatorAddress});
        await time.increaseTime(2419200+100); // 28 days
        assert.strictEqual((await Uber.getState()).toNumber(), 0); //0 = Presale         
        await Uber.endPresale({from: operatorAddress});        
        assert.strictEqual((await Uber.getState()).toNumber(), 1); //1 = Gap 
        await Uber.activeCrowdsale({from: operatorAddress});              
        assert.strictEqual((await Uber.getState()).toNumber(), 2); //2 = Crowdsale
    });

    it('activeCrowdsale: trying to start crowdsale, without ending presale', async() => {
        let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
        let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder); 
        await Uber.setTokenAddress(UberToken.address, {from: operatorAddress});
        await time.increaseTime(2419200+100); // 28 days
        assert.strictEqual((await Uber.getState()).toNumber(), 0); //0 = Presale         
        try{
            await Uber.activeCrowdsale({from: operatorAddress});
        } catch(error){
            Utils.ensureException(error);
        }      
    });

    it('activeCrowdsale: trying to start crowdsale, with  non-founder address', async() => {
        let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
        let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder); 
        await Uber.setTokenAddress(UberToken.address, {from: operatorAddress});
        await time.increaseTime(2419200+100); // 28 days
        assert.strictEqual((await Uber.getState()).toNumber(), 0); //0 = Presale 
        await Uber.endPresale({from: operatorAddress});        
        assert.strictEqual((await Uber.getState()).toNumber(), 1); //1 = Gap                
        try{
            await Uber.activeCrowdsale({from: holder1});
        } catch(error){
            Utils.ensureException(error);
        }      
    });

    it('changeMinInvestment: Should change minimum investment for presale & crowdsale', async() => {
        let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
        
        assert.strictEqual((await Uber
                .MIN_PRESALE())
                .dividedBy(
                new BigNumber(10)
                .pow(18)
                ).toNumber(),
                1);
        assert.strictEqual((await Uber
                .MIN_CROWDSALE())
                .dividedBy(
                    new BigNumber(10)
                    .pow(18)
                ).toNumber(), 
                .1);
        
        let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder); 
        
        await Uber.setTokenAddress(UberToken.address, {from: operatorAddress});
        assert.strictEqual((await Uber.getState()).toNumber(), 0); //0 = Presale  
        
        await Uber.changeMinInvestment(
                new BigNumber(2)
                .times(
                    new BigNumber(10)
                    .pow(18)
                ), 
                {
                    from: operatorAddress
                });
        assert.strictEqual((await Uber
            .MIN_PRESALE()
            ).dividedBy(
                 new BigNumber(10)
                .pow(18)
            ).toNumber(),
            2);
       
        await time.increaseTime(2419200+100); // 28 days        
        await Uber.endPresale({from: operatorAddress});        
        assert.strictEqual((await Uber.getState()).toNumber(), 1); //1 = Gap 
        
        await Uber.activeCrowdsale({from: operatorAddress});  
        assert.strictEqual((await Uber.getState()).toNumber(), 2); //2 = Crowdsale
        
        await Uber.changeMinInvestment(
            new BigNumber(.3)
            .times(new BigNumber(10)
            .pow(18)
            ), 
            {
                from: operatorAddress
            });
        assert.strictEqual((await Uber
            .MIN_CROWDSALE()
            ).dividedBy(
                new BigNumber(10).pow(18)
            ).toNumber(), 
            .3);
        
    });
    
    it('changeMinInvestment: trying to change minimum investment for presale using a non-operator address (will fail)', async() => {
        let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
        assert.strictEqual((await Uber
            .MIN_PRESALE()
            ).dividedBy(
                new BigNumber(10)
                .pow(18)
            ).toNumber(),
            1);
        assert.strictEqual((await Uber
            .MIN_CROWDSALE()
            )
            .dividedBy(
                new BigNumber(10)
                .pow(18)
            ).toNumber(), 
            .1);

        let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder); 
        await Uber.setTokenAddress(UberToken.address, {from: operatorAddress});
        assert.strictEqual((await Uber.getState()).toNumber(), 0); //0 = Presale  
        
        try{
            await Uber.changeMinInvestment(new BigNumber(2)
            .times(
                new BigNumber(10)
                .pow(18)
            ), {
                from: holder1
            });
        }catch (error){
            return Utils.ensureException(error);
        }
        
    });

    it('changeMinInvestment: trying to change minimum investment for crowdsale using a non-operator address (will fail)', async() => {
        let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
        assert.strictEqual((await Uber
                .MIN_PRESALE()
                )
                .dividedBy(
                    new BigNumber(10)
                    .pow(18)
                )
                .toNumber(),
                1);
        assert.strictEqual((await Uber
                .MIN_CROWDSALE()
                )
                .dividedBy(
                    new BigNumber(10)
                    .pow(18)
                )
                .toNumber(), 
                .1);
        let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder); 
        await Uber.setTokenAddress(UberToken.address, {from: operatorAddress});
        assert.strictEqual((await Uber.getState()).toNumber(), 0); //0 = Presale  
       
        await time.increaseTime(2419200+100); // 28 days        
        await Uber.endPresale({from: operatorAddress});        
       
        assert.strictEqual((await Uber
                .getState()
                )
                .toNumber(), 
                1); //1 = Gap 
        
        await Uber.activeCrowdsale({from: operatorAddress});  
        assert.strictEqual((await Uber.getState()).toNumber(), 2); //2 = Crowdsale
        
        try{
            await Uber.changeMinInvestment(
                new BigNumber(.3)
                .times(
                    new BigNumber(10)
                    .pow(18)
                ), 
                {
                    from: holder1
                });
        }catch (error){
                Utils.ensureException(error);
        }        
    });

    it('changeMinInvestment: trying to change minimum investment for crowdsale during GAP time (will fail)', async() => {
        let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
        
        assert.strictEqual((await Uber
                .MIN_PRESALE()
                )
                .dividedBy(
                    new BigNumber(10)
                    .pow(18)
                    )
                .toNumber(),
                1);
        assert.strictEqual((await Uber
                .MIN_CROWDSALE()
                )
                .dividedBy(
                    new BigNumber(10)
                    .pow(18)
                )
                .toNumber(), 
                .1);
        let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder); 
        await Uber.setTokenAddress(UberToken.address, {from: operatorAddress});
        assert.strictEqual((await Uber.getState()).toNumber(), 0); //0 = Presale  
        
        await time.increaseTime(2419200+100); // 28 days        
        await Uber.endPresale({from: operatorAddress});        
        assert.strictEqual((await Uber.getState()).toNumber(), 1); //1 = Gap 
       
        await Uber.changeMinInvestment(new BigNumber(.3)
                .times(
                    new BigNumber(10)
                    .pow(18)
                ), 
                {
                    from: operatorAddress
                });
        // Minimum Investment will same sa before i.e. 0.1 ETH
        assert.strictEqual((await Uber
            .MIN_CROWDSALE()
            )
            .dividedBy(
                new BigNumber(10)
                .pow(18)
            )
            .toNumber(), 
            .1);
    });


    it('buyTokens: buying tokens in different weeks of presale and crowdsale by transferring ether', async() => {
        let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
        let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder);
        
        await Uber.setTokenAddress(UberToken.address, {from: operatorAddress});
        assert.strictEqual((await Uber
            .getState()
            )
            .toNumber(), 
            0); //0 = Presale 
        await web3.eth.sendTransaction({
            from: holder1,
            to: Uber.address,
            gas:300000,
            value: web3.toWei('1', 'Ether')
        });
        assert.equal((await Uber
                .ethRaised()
                )
                .dividedBy(
                    new BigNumber(10)
                    .pow(18)
                    )
                .toNumber(), 
                1);
        assert.equal((await UberToken
                .balanceOf
                .call(holder1)
                )
                .dividedBy(
                    new BigNumber(10)
                    .pow(18)
                )
                .toNumber(), 
                1500
            );
     
        await time.increaseTime(7*24*60*60+100); // 7 days  = 2nd week        
        await web3.eth.sendTransaction({
                from: holder2,
                to: Uber.address,
                gas:300000,
                value: web3.toWei('1', 'Ether')
            });
        assert.equal((await Uber
                .ethRaised()
                )
                .dividedBy(
                    new BigNumber(10)
                    .pow(18)
                )
                .toNumber(), 
                2);
        assert.equal((await UberToken
                .balanceOf
                .call(holder2)
                )
                .dividedBy(
                    new BigNumber(10)
                    .pow(18)
                )
                .toNumber(), 
                1400);
        
        await time.increaseTime(3*7*24*60*60); // To make sure current block timestamp is greater than end date         
        
        await Uber.endPresale({from: operatorAddress});        
        assert.strictEqual((await Uber.getState()).toNumber(), 1); //1 = Gap 
        
        await Uber.activeCrowdsale({from: operatorAddress});  
        assert.strictEqual((await Uber.getState()).toNumber(), 2); //2 = Crowdsale

        await web3.eth.sendTransaction({
            from: holder3,
            to: Uber.address,
            gas:300000,
            value: web3.toWei('1', 'Ether')
        });
        assert.equal((await Uber
                .ethRaised()
                )
                .dividedBy(
                    new BigNumber(10)
                    .pow(18)
                )
                .toNumber(), 
                3
            );
        assert.equal((await UberToken
                .balanceOf
                .call(holder3)
                )
                .dividedBy(
                    new BigNumber(10)
                    .pow(18)
                )
                .toNumber(), 
                1200
            );
        
        await time.increaseTime(7*24*60*60+100); // 7 days  = 2nd week of crowdsale       
        await web3.eth.sendTransaction({
                from: holder4,
                to: Uber.address,
                gas:300000,
                value: web3.toWei('1', 'Ether')
            });
        assert.equal((await Uber
                .ethRaised()
                )
                .dividedBy(
                    new BigNumber(10)
                    .pow(18)
                )
                .toNumber(), 
                4
            );
        assert.equal((await UberToken
                .balanceOf
                .call(holder4)
            )
            .dividedBy(
                new BigNumber(10)
                .pow(18)
            )
            .toNumber(), 
            1100
        );
        
        await time.increaseTime(7*24*60*60+100); // 7 days  = 3rd week of crowdsale       
        await web3.eth.sendTransaction({
                from: holder3,
                to: Uber.address,
                gas:300000,
                value: web3.toWei('1', 'Ether')
            });
        assert.equal((await Uber
                .ethRaised()
                )
                .dividedBy(
                    new BigNumber(10)
                    .pow(18)
                ).toNumber(), 
            5);
        assert.equal((await UberToken
                .balanceOf
                .call(holder3)
                )
                .dividedBy(
                    new BigNumber(10)
                    .pow(18)
                )
                .toNumber(), 
                2250
            );
        
        await time.increaseTime(7*24*60*60+100); // 7 days  = 4th week of crowdsale       
        await web3.eth.sendTransaction({
                from: holder4,
                to: Uber.address,
                gas:300000,
                value: web3.toWei('1', 'Ether')
            });
        assert.equal((await Uber
                .ethRaised()
                )
                .dividedBy(
                    new BigNumber(10)
                    .pow(18)
                )
                .toNumber(), 
                6
            );
        assert.equal((await UberToken
            .balanceOf
            .call(holder4)
            )
            .dividedBy(
                new BigNumber(10)
                .pow(18)
            )
            .toNumber(), 
            2100
        );
    });

    it('buyTokens: trying to buy tokens at the time of GAP (will fail)', async() => {
        let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
        let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder);
       
        await Uber.setTokenAddress(UberToken.address, {from: operatorAddress});
        assert.strictEqual((await Uber
                .getState()
                )
                .toNumber(), 
                0
                ); //0 = Presale 
        await web3.eth.sendTransaction({
            from: holder1,
            to: Uber.address,
            gas:300000,
            value: web3.toWei('1', 'Ether')
        });
        assert.equal((await Uber
                .ethRaised()
                )
                .dividedBy(
                    new BigNumber(10)
                    .pow(18)
                )
                .toNumber(), 
                1
            );
        assert.equal((await UberToken
                .balanceOf
                .call(holder1)
                )
                .dividedBy(
                    new BigNumber(10)
                    .pow(18)
                )
                .toNumber(), 
                1500
            );
     
        await time.increaseTime(7*24*60*60+100); // 7 days  = 2nd week        
        await web3.eth.sendTransaction({
                from: holder2,
                to: Uber.address,
                gas:300000,
                value: web3.toWei('1', 'Ether')
            });
        
        assert.equal((await Uber
                .ethRaised()
                )
                .dividedBy(
                    new BigNumber(10)
                    .pow(18)
                    ).
                    toNumber(), 
                    2
                );
        assert.equal((await UberToken
                .balanceOf
                .call(holder2)
                )
                .dividedBy(
                    new BigNumber(10)
                    .pow(18)
                )
                .toNumber(), 
                1400
            );
        
        await time.increaseTime(3*7*24*60*60); // To make sure current block timestamp is greater than end date         
        await Uber.endPresale({from: operatorAddress});        
        assert.strictEqual((await Uber.getState()).toNumber(), 1); //1 = Gap 

        try{
            await web3.eth.sendTransaction({
            from: holder3,
            to: Uber.address,
            gas:300000,
            value: web3.toWei('1', 'Ether')
            });
        }catch(error){
                Utils.ensureException(error);
        }
        
    });

    it('buyTokens: trying to buy tokens without setting token (will fail)', async() => {
        let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
        let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder); 
        try{
            await web3.eth.sendTransaction({
            from: holder1,
            to: Uber.address,
            gas:300000,
            value: web3.toWei('1', 'Ether')
            });
        }catch(error){
            Utils.ensureException(error);
        }
    });

    it('buyTokens: trying to buy tokens by investing Ether less than set minimum amount while presale (will fail)', async() => {
        let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
        let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder);
       
        await Uber.setTokenAddress(UberToken.address, {from: operatorAddress});
        assert.strictEqual((await Uber.getState()).toNumber(), 0); //0 = Presale  
        
        try{
            await web3.eth.sendTransaction({
                from: holder1,
                to: Uber.address,
                gas:300000,
                value: web3.toWei('0.95', 'Ether')   //less than 1 ETH
            });
        }catch(error){
             Utils.ensureException(error);
        }
    });

    it('buyTokens: trying to buy tokens by investing Ether less than set minimum amount while crowdsale (will fail)', async() => {
        let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
        let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder); 
        
        await Uber.setTokenAddress(UberToken.address, {from: operatorAddress});
        assert.strictEqual((await Uber.getState()).toNumber(), 0); //0 = Presale  
        
        await time.increaseTime(2419200+100); // 28 days        
        await Uber.endPresale({from: operatorAddress});        
        
        assert.strictEqual((await Uber.getState()).toNumber(), 1); //1 = Gap 
        await Uber.activeCrowdsale({from: operatorAddress});  
        
        assert.strictEqual((await Uber.getState()).toNumber(), 2); //2 = Crowdsale
        
        try{
            await web3.eth.sendTransaction({
                from: holder1,
                to: Uber.address,
                gas: 300000,
                value: web3.toWei('0.09', 'Ether') //less than 0.1 ETH
            });
        }catch(error){
            Utils.ensureException(error);
        }        
    });

    it('endCrowdfund: Crowdsale will be ended, token will be burnt', async() => {
        let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
        let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder); 
        
        await Uber.setTokenAddress(UberToken.address, {from: operatorAddress});
        assert.strictEqual((await Uber.getState()).toNumber(), 0); //0 = Presale  
        
        await time.increaseTime(2419200+100); // 28 days        
        await Uber.endPresale({from: operatorAddress});        
        
        assert.strictEqual((await Uber.getState()).toNumber(), 1); //1 = Gap 
        await Uber.activeCrowdsale({from: operatorAddress});  
        
        assert.strictEqual((await Uber.getState()).toNumber(), 2); //2 = Crowdsale
        await time.increaseTime(2419200+100); // 28 days        
        
        await Uber.endCrowdfund(true, 0, {from: operatorAddress});
        let _balance = await UberToken
                        .balanceOf
                        .call(Uber.address);
        assert.strictEqual(_balance
                .dividedBy(
                    new BigNumber(10)
                    .pow(18)
                )
                .toNumber(), 
                0
            );               
    });

    it('endCrowdfund: Old Crowdsale will be ended, tokens will be transferred to new crowdsale address', async() => {
        let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
        let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder); 
        
        await Uber.setTokenAddress(UberToken.address, {from: operatorAddress});
        assert.strictEqual((await Uber.getState()).toNumber(), 0); //0 = Presale  
        
        await time.increaseTime(2419200+100); // 28 days        
        await Uber.endPresale({from: operatorAddress});        
        
        assert.strictEqual((await Uber.getState()).toNumber(), 1); //1 = Gap 
        await Uber.activeCrowdsale({from: operatorAddress});  
        
        assert.strictEqual((await Uber.getState()).toNumber(), 2); //2 = Crowdsale
        await time.increaseTime(2419200+100); // 28 days        
        
        await Uber.endCrowdfund(false, newCrowdsaleAddress, {from: operatorAddress});
        
        let _balance = await UberToken
                        .balanceOf
                        .call(newCrowdsaleAddress);
        assert.strictEqual(_balance.dividedBy(new BigNumber(10).pow(18)).toNumber(), 114750000);               
    });

    it('endCrowdfund: trying to end crowdsale before crowdsale end date (will fail)', async() => {
        let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
        let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder); 
        
        await Uber.setTokenAddress(UberToken.address, {from: operatorAddress});
        assert.strictEqual((await Uber.getState()).toNumber(), 0); //0 = Presale  
        
        await time.increaseTime(2419200+100); // 28 days        
        
        await Uber.endPresale({from: operatorAddress});        
        assert.strictEqual((await Uber.getState()).toNumber(), 1); //1 = Gap 
        
        await Uber.activeCrowdsale({from: operatorAddress});  
        assert.strictEqual((await Uber.getState()).toNumber(), 2); //2 = Crowdsale
        
        await time.increaseTime(2419200-1000); // Before 28 days        
        try{
            await Uber.endCrowdfund(true, 0, {from: operatorAddress}); 
        }catch(error){
             Utils.ensureException(error);
        }             
    });

    it('endCrowdfund: trying to end crowdsale using a non-operator address (will fail)', async() => {
        let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
        let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder); 

        await Uber.setTokenAddress(UberToken.address, {from: operatorAddress});
        assert.strictEqual((await Uber.getState()).toNumber(), 0); //0 = Presale  
        
        await time.increaseTime(2419200+100); // 28 days        
        await Uber.endPresale({from: operatorAddress});        
        assert.strictEqual((await Uber.getState()).toNumber(), 1); //1 = Gap 
        await Uber.activeCrowdsale({from: operatorAddress});  
        assert.strictEqual((await Uber.getState()).toNumber(), 2); //2 = Crowdsale
        await time.increaseTime(2419200+100); // Before 28 days        
        try{
            await Uber.endCrowdfund(true, 0, {from: holder1}); 
        }catch(error){
            Utils.ensureException(error);
        }             
    });

    it('buyTokens: buying tokens after end of the crowdsale (will fail)', async() => {
        let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
        let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder); 
        
        await Uber.setTokenAddress(UberToken.address, {from: operatorAddress});
        assert.strictEqual((await Uber.getState()).toNumber(), 0); //0 = Presale  
        
        await time.increaseTime(2419200+100); // 28 days        
        
        await Uber.endPresale({from: operatorAddress});        
        assert.strictEqual((await Uber.getState()).toNumber(), 1); //1 = Gap 
        
        await Uber.activeCrowdsale({from: operatorAddress});  
        assert.strictEqual((await Uber.getState()).toNumber(), 2); //2 = Crowdsale
        
        await time.increaseTime(2419200+100); // 28 days        
        
        await Uber.endCrowdfund(true, 0, {from: operatorAddress});
        let _balance = await UberToken
                        .balanceOf
                        .call(Uber.address);
        assert.strictEqual(_balance.dividedBy(new BigNumber(10).pow(18)).toNumber(), 0);
        try{
            await web3.eth.sendTransaction({
                from: holder1,
                to: Uber.address,
                gas: 300000,
                value: web3.toWei('1', 'Ether') 
            });
        }catch(error){
            Utils.ensureException(error);
        } 
    });

});