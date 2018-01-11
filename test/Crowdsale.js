// const UBERCROWDSALE = artifacts.require('UberCrowdsale.sol');
// const UBERTOKEN = artifacts.require('UberToken.sol');
// const Utils = require('./helpers/Utils');
// const time = require('./helpers/time');
// const BigNumber = require('bignumber.js');



// contract("Crowdsale", (accounts) => {
    
//     let operatorAddress;
//     let beneficiaryAddress;
//     let vestingAddress;
//     let founder;
//     let FounderMultisigAddress2;
//     let holder1;
//     let holder2;
//     let holder3;
//     let holder4;
    

//     before(async() => {
//         founder = accounts[0];
//         holder1 = accounts[1];
//         holder2 = accounts[2];
//         holder3 = accounts[3];
//         holder4 = accounts[4];
//         operatorAddress = accounts[5];
//         beneficiaryAddress = accounts[6];
//         vestingAddress = accounts[7];
//     });

//     it("Verify constructors",async()=>{
//         let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
        
//         let operatorAddr = await Uber.operatorAddress();
//         assert.equal(operatorAddr.toString(), operatorAddress);

//         let beneficiaryAddr = await Uber.beneficiaryAddress();
//         assert.equal(beneficiaryAddr.toString(), beneficiaryAddress);

//         let startPresale = new BigNumber(await Uber.startPresaleDate()).toNumber();
//         let endPresale   = new BigNumber(await Uber.endPresaleDate()).toNumber();
//         assert.equal( await Utils.timeDifference(endPresale, startPresale), 2419200); // 2419200 = 28 days
        
//     });

//    it('setTokenAddress: token address will be set, only contract address will be allowed', async() => {
//         let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
//         let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder);
//         await Uber.setTokenAddress(UberToken.address, {from: operatorAddress}); 
//         assert.notEqual(web3.eth.getCode(UberToken.address),'0x0'); // Must be a contract address       
//         let tokenAddr = await Uber.tokenAddress();
//         assert.equal(tokenAddr.toString(), UberToken.address);
//     });

//     it('setTokenAddress: trying to set token address with a non-operator address (Should fail)', async() => {
//         let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
//         let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder);
//         try{
//             await Uber.setTokenAddress(UberToken.address, {from: holder1});        
//         }catch (error) {
//            //console.log(error);
//            return Utils.ensureException(error);
//         }        
//     });
    

//     it('setTokenAddress: should NOT let a operator address to set the token address when token is set (will fail)', async() => {
//         let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
//         let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder);
//         await Uber.setTokenAddress(UberToken.address, {from: operatorAddress});
//         try{
//             let UberToken2 = await UBERTOKEN.new(Uber.address, vestingAddress, founder);
//             await Uber.setTokenAddress(UberToken2.address, {from: operatorAddress});
//         }catch (error) {
//             //console.log(error);
//             return Utils.ensureException(error);
//         }        
//     });

//     it('endPresale: presale will be ended, gap will be started', async() => {
//         let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
//         let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder); 
//          await Uber.setTokenAddress(UberToken.address, {from: operatorAddress});
//          await time.increaseTime(2419200+10); // 28 days
//          assert.strictEqual((await Uber.getState()).toNumber(), 0); //0 = Presale         
//          await Uber.endPresale({from: operatorAddress});        
//          assert.strictEqual((await Uber.getState()).toNumber(), 1); //1 = Gap
//     });

//     it('endPresale: trying to end presale without setting the token (Should fail)', async() => {
//         let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
//         try{
//             await Uber.endPresale({from: operatorAddress});        
//         }catch (error) {
//            //console.log(error);
//            return Utils.ensureException(error);
//         }        
//     });

//     it('endPresale: trying to end presale before end date (Should fail)', async() => {
//         let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
//         let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder); 
//         await Uber.setTokenAddress(UberToken.address, {from: operatorAddress});
//         try{
//             await Uber.endPresale({from: operatorAddress});        
//         }catch (error) {
//            //console.log(error);
//            return Utils.ensureException(error);
//         }        
//     });
    
//     it('endPresale: trying to end presale after end date using a non-operator address (Should fail)', async() => {
//         let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
//         let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder); 
//         await Uber.setTokenAddress(UberToken.address, {from: operatorAddress});
//         await time.increaseTime(2419200+10); // 28 days 
//         try{
//             await Uber.endPresale({from: holder1});        
//         }catch (error) {
//            //console.log(error);
//            return Utils.ensureException(error);
//         }        
//     });

//     it('activeCrowdsale: Crowdsale will be started after Gap', async() => {
//         let Uber = await UBERCROWDSALE.new(operatorAddress, beneficiaryAddress);
//         let UberToken = await UBERTOKEN.new(Uber.address, vestingAddress, founder); 
//         await Uber.setTokenAddress(UberToken.address, {from: operatorAddress});
//         await time.increaseTime(2419200+100); // 28 days
//         assert.strictEqual((await Uber.getState()).toNumber(), 0); //0 = Presale         
//         await Uber.endPresale({from: operatorAddress});        
//         assert.strictEqual((await Uber.getState()).toNumber(), 1); //1 = Gap 
//         await Uber.activeCrowdsale({from: operatorAddress});              
//         assert.strictEqual((await Uber.getState()).toNumber(), 2); //2 = Crowdsale
//     });
    

// //     it('buyTokens: buying tokens without setting token address (will fail)', async() => {
// //         let ano = await ANOCrowdsale.new(founderAddress, beneficiaryAddress); 
// //         try {
// //             await web3
// //                 .eth
// //                 .sendTransaction({
// //                     from: investor1,
// //                     to: ano.address,
// //                     gas:300000,
// //                     value: web3.toWei('1', 'Ether')
// //                 });
// //             assert.equal((await ano.ethRaised()).dividedBy(new BigNumber(10).pow(18)).toNumber(),1);
// //         } catch (error) {
// //             return Utils.ensureException(error);
// //         }
// //     });

// //     it('buyTokens: buying tokens more than allocated for the week (will fail)', async() => {
// //         let ano = await ANOCrowdsale_test.new(founderAddress, beneficiaryAddress); 
// //         let anoToken_test = await ANOToken_test.new(ano.address);
// //         let tokenSupply = await anoToken_test.totalSupply();
// //         await ano.setTokenAddress(anoToken_test.address, {from: founderAddress});
// //         await web3.eth
// //                 .sendTransaction({
// //                     from: investor1,
// //                     to: ano.address,
// //                     gas:3000000,
// //                     value: web3.toWei('.063819', 'Ether')  // To reach weekly limit
// //                 });
// //             assert.equal((await anoToken_test.balanceOf.call(investor1)).dividedBy(new BigNumber(10).pow(18)).toNumber(),1050); // First Week Limit
// //             assert.equal((await ano.ethRaised()).dividedBy(new BigNumber(10).pow(18)).toNumber(),.063819);
        
// //         try {
// //             // Purchase of one more token will throw error
// //             await web3
// //                 .eth
// //                 .sendTransaction({
// //                     from: investor1,
// //                     to: ano.address,
// //                     gas:3000000,
// //                     value: web3.toWei('.00006078', 'Ether')
// //                 });
// //         } catch (error) {
// //             return Utils.ensureException(error);
// //         }
// //     });

// //     it('buyTokens: buying tokens in 1st, 5th, 15th & 40th week by transferring ether', async() => {
// //         let ano = await ANOCrowdsale.new(founderAddress, beneficiaryAddress);
// //         let anoToken = await ANOToken.new(ano.address);
// //         await ano.setTokenAddress(anoToken.address, {from: founderAddress}); 
// //         await web3.eth.sendTransaction({
// //                 from: investor1,
// //                 to: ano.address,
// //                 gas:300000,
// //                 value: web3.toWei('.00006078', 'Ether')
// //             });
// //         assert.equal((await ano.ethRaised()).dividedBy(new BigNumber(10).pow(18)).toNumber(),.00006078);
// //         assert.equal((await anoToken.balanceOf.call(investor1)).dividedBy(new BigNumber(10).pow(18)).toNumber(),1);
// //         assert.equal((new BigNumber(await ano.getWeekNo())).toNumber(),0);
// //         await increaseTime(7*24*60*60*4); //5th week
        
// //         await web3.eth.sendTransaction({
// //             from: investor2,
// //             to: ano.address,
// //             gas:300000,
// //             value: web3.toWei('.00010942', 'Ether') // .00006078 + 4*.00001216
// //         });
// //         assert.equal((await ano.ethRaised()).dividedBy(new BigNumber(10).pow(18)).toNumber(),0.0001702); // .00006078 + .00010942 
// //         assert.equal((await anoToken.balanceOf.call(investor2)).dividedBy(new BigNumber(10).pow(18)).toNumber(),1);
// //         assert.equal((new BigNumber(await ano.getWeekNo())).toNumber(),4); //5th week
// //         await increaseTime(7*24*60*60*6); //15th week
// //         await web3.eth.sendTransaction({
// //             from: investor3,
// //             to: ano.address,
// //             gas:300000,
// //             value: web3.toWei('.00023102', 'Ether') // .00006078 + 14*.00001216
// //         });
// //         assert.equal((await ano.ethRaised()).dividedBy(new BigNumber(10).pow(18)).toNumber(),0.00040122); // .0001702 + .00023102 
// //         assert.equal((await anoToken.balanceOf.call(investor3)).dividedBy(new BigNumber(10).pow(18)).toNumber(),1);
// //         assert.equal((new BigNumber(await ano.getWeekNo())).toNumber(),14); //15th week
// //         await increaseTime(7*24*60*60*15); //40th week
// //         await web3.eth.sendTransaction({
// //             from: investor3,
// //             to: ano.address,
// //             gas:300000,
// //             value: web3.toWei('.00053502', 'Ether') // .00006078 + 39*.00001216
// //         });
// //         assert.equal((await ano.ethRaised()).dividedBy(new BigNumber(10).pow(18)).toNumber(),0.00093624); // .00040122 + .00053502
// //         assert.equal((await anoToken.balanceOf.call(investor3)).dividedBy(new BigNumber(10).pow(18)).toNumber(),2);//2nd investment of investor3
// //         assert.equal((new BigNumber(await ano.getWeekNo())).toNumber(),39); //40th week
// //     });


// //     it('endCrowdfund: trying to end crowdfund before endDate (will fail)', async() => {
// //         let ano = await ANOCrowdsale.new(founderAddress, beneficiaryAddress);
// //         let anoToken = await ANOToken.new(ano.address);
// //         await ano.setTokenAddress(anoToken.address, {from: founderAddress});
// //         try {
// //             await ano.endCrowdfund({from: founderAddress});
// //         }catch (error) {
// //             return Utils.ensureException(error);
// //         }      
// //     });

// //     it('endCrowdfund: trying to end crowdfund after endDate using other address (will fail)', async() => {
// //         let ano = await ANOCrowdsale.new(founderAddress, beneficiaryAddress);
// //         let anoToken = await ANOToken.new(ano.address);
// //         await ano.setTokenAddress(anoToken.address, {from: founderAddress});
// //         try{
// //             await ano.endCrowdfund({from: caller1});        
// //         }catch (error) {
// //             return Utils.ensureException(error);
// //         }     
// //     });

// //     it('endCrowdfund: trying to end crowdfund after endDate using founder address', async() => {
// //         let ano = await ANOCrowdsale.new(founderAddress, beneficiaryAddress);
// //         let anoToken = await ANOToken.new(ano.address);
// //         await ano.setTokenAddress(anoToken.address, {from: founderAddress});
// //         await increaseTime(7*24*60*60*40 + 50);
// //         await ano.endCrowdfund({from: founderAddress});
// //         assert.equal((await anoToken.balanceOf.call(ano.address)).dividedBy(new BigNumber(10).pow(18)).toNumber(),0);
             
// //     });

// //     it('buyTokens: buying tokens after end of the crowdFund (will fail)', async() => {
// //         let ano = await ANOCrowdsale.new(founderAddress, beneficiaryAddress);
// //         let anoToken = await ANOToken.new(ano.address);
// //         await ano.setTokenAddress(anoToken.address, {from: founderAddress});
// //         try {
// //             await web3
// //                 .eth
// //                 .sendTransaction({
// //                     from: investor1,
// //                     to: ano.address,
// //                     gas: 300000,
// //                     value: web3.toWei('1', 'Ether')
// //                 });
// //         } catch (error) {
// //             return Utils.ensureException(error);
// //         }
// //     });

//    });