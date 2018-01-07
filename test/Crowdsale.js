// const ANOToken = artifacts.require("ANOToken.sol");
// const ANOToken_test = artifacts.require("ANOToken_test.sol");
// const ANOCrowdsale = artifacts.require("ANOCrowdsale.sol");
// const ANOCrowdsale_test = artifacts.require("ANOCrowdsale_test.sol");
// const BigNumber = require('bignumber.js');
// const Utils = require('./helpers/Utils');
// import{increaseTime} from './helpers/time';


// contract("ANOCrowdsale", (accounts) => {
//     let owner ; // founderMultiSigAddress
//     let founderAddress;
//     let caller1;
//     let investor1;
//     let investor2;
//     let investor3;
//     let beneficiaryAddress;
//     let supply = 21000000000;


//     before(async() => {
//         owner = accounts[0];
//         founderAddress = accounts[1];
//         beneficiaryAddress = accounts[2];
//         caller1 = accounts[3];
//         investor1 = accounts[4];
//         investor2 = accounts[5];
//         investor3 = accounts[6];
//     });

//     it("Verify constructors",async()=>{
//         let ano = await ANOCrowdsale.new(founderAddress, beneficiaryAddress);
        
//         let startDate = new BigNumber(await ano.startDate()).toNumber();
//         let endDate = new BigNumber(await ano.endDate()).toNumber();
//         assert.equal( await Utils.timeDifference(endDate, startDate), 24192000); // 24192000 = 40 weeks
        
//         let founder = await ano.founderAddress();
//         assert.equal(founder.toString(), founderAddress);
        
//         let beneficiary = await ano.beneficiaryAddress();
//         assert.equal(beneficiary.toString(), beneficiaryAddress);

//     });

//     it('setTokenAddress: token address will be set', async() => {
//         let ano = await ANOCrowdsale.new(founderAddress, beneficiaryAddress);
//         let anoToken = await ANOToken.new(ano.address);
//         await ano.setTokenAddress(anoToken.address, {from: founderAddress}); 
//     });

//     it('setTokenAddress: try to set token address using address different from founder (Should fail)', async() => {
//         let ano = await ANOCrowdsale.new(founderAddress, beneficiaryAddress);
//         try{
//             let anoToken = await ANOToken.new(ano.address);
//             await ano.setTokenAddress(anoToken.address, {from: beneficiaryAddress}); 
        
//         }catch (error) {
//            return Utils.ensureException(error);
//         }        
//     });
    

//     it('setTokenAddress: should NOT let a founder address to set the token address when token is set (will fail)', async() => {
//         let ano = await ANOCrowdsale.new(founderAddress, beneficiaryAddress);
//         let anoToken1 = await ANOToken.new(ano.address);
//         await ano.setTokenAddress(anoToken1.address, {from: founderAddress});
//         try{
//             let anoToken2 = await ANOToken.new(ano.address);
//             await ano.setTokenAddress(anoToken2.address, {from: founderAddress});
//         }catch (error) {
//             return Utils.ensureException(error);
//         }        
//     });

//     it('weeklyRate: testing values allocation in weekly rate mapping for 1st, 5th, 20th, 40th week', async() => {
//         let ano = await ANOCrowdsale.new(founderAddress, beneficiaryAddress);
//         let response1 = await ano.weeklyRate(0);
//         let startTimeWeek1 = new BigNumber(response1[0].c[0]).toNumber();
//         let endTimeWeek1 = new BigNumber(response1[1].c[0]).toNumber();
//         let tokenRateWeek1 = new BigNumber(response1[2].c[0]).toNumber();
//         assert.equal( await Utils.timeDifference(endTimeWeek1, startTimeWeek1), 604800);
//         assert.equal( tokenRateWeek1, 6078);

//         let response5 = await ano.weeklyRate(4);
//         let startTimeWeek5 = new BigNumber(response5[0].c[0]).toNumber();
//         let endTimeWeek5 = new BigNumber(response5[1].c[0]).toNumber();
//         let tokenRateWeek5 = new BigNumber(response5[2].c[0]).toNumber();
//         assert.equal( await Utils.timeDifference(endTimeWeek5, startTimeWeek5), 604800);
//         assert.equal( tokenRateWeek5, 6078 + 1216*4);

//         let response20 = await ano.weeklyRate(19);
//         let startTimeWeek20 = new BigNumber(response20[0].c[0]).toNumber();
//         let endTimeWeek20 = new BigNumber(response20[1].c[0]).toNumber();
//         let tokenRateWeek20 = new BigNumber(response20[2].c[0]).toNumber();
//         assert.equal( await Utils.timeDifference(endTimeWeek20, startTimeWeek20), 604800);
//         assert.equal( tokenRateWeek20, 6078 + 1216*19);

//         let response40 = await ano.weeklyRate(39);
//         let startTimeWeek40 = new BigNumber(response40[0].c[0]).toNumber();
//         let endTimeWeek40 = new BigNumber(response40[1].c[0]).toNumber();
//         let tokenRateWeek40 = new BigNumber(response40[2].c[0]).toNumber();
//         assert.equal( await Utils.timeDifference(endTimeWeek40, startTimeWeek40), 604800);
//         assert.equal( tokenRateWeek40, 6078 + 1216*39);
//     });


//     it('buyTokens: buying tokens without setting token address (will fail)', async() => {
//         let ano = await ANOCrowdsale.new(founderAddress, beneficiaryAddress); 
//         try {
//             await web3
//                 .eth
//                 .sendTransaction({
//                     from: investor1,
//                     to: ano.address,
//                     gas:300000,
//                     value: web3.toWei('1', 'Ether')
//                 });
//             assert.equal((await ano.ethRaised()).dividedBy(new BigNumber(10).pow(18)).toNumber(),1);
//         } catch (error) {
//             return Utils.ensureException(error);
//         }
//     });

//     it('buyTokens: buying tokens more than allocated for the week (will fail)', async() => {
//         let ano = await ANOCrowdsale_test.new(founderAddress, beneficiaryAddress); 
//         let anoToken_test = await ANOToken_test.new(ano.address);
//         let tokenSupply = await anoToken_test.totalSupply();
//         await ano.setTokenAddress(anoToken_test.address, {from: founderAddress});
//         await web3.eth
//                 .sendTransaction({
//                     from: investor1,
//                     to: ano.address,
//                     gas:3000000,
//                     value: web3.toWei('.063819', 'Ether')  // To reach weekly limit
//                 });
//             assert.equal((await anoToken_test.balanceOf.call(investor1)).dividedBy(new BigNumber(10).pow(18)).toNumber(),1050); // First Week Limit
//             assert.equal((await ano.ethRaised()).dividedBy(new BigNumber(10).pow(18)).toNumber(),.063819);
        
//         try {
//             // Purchase of one more token will throw error
//             await web3
//                 .eth
//                 .sendTransaction({
//                     from: investor1,
//                     to: ano.address,
//                     gas:3000000,
//                     value: web3.toWei('.00006078', 'Ether')
//                 });
//         } catch (error) {
//             return Utils.ensureException(error);
//         }
//     });

//     it('buyTokens: buying tokens in 1st, 5th, 15th & 40th week by transferring ether', async() => {
//         let ano = await ANOCrowdsale.new(founderAddress, beneficiaryAddress);
//         let anoToken = await ANOToken.new(ano.address);
//         await ano.setTokenAddress(anoToken.address, {from: founderAddress}); 
//         await web3.eth.sendTransaction({
//                 from: investor1,
//                 to: ano.address,
//                 gas:300000,
//                 value: web3.toWei('.00006078', 'Ether')
//             });
//         assert.equal((await ano.ethRaised()).dividedBy(new BigNumber(10).pow(18)).toNumber(),.00006078);
//         assert.equal((await anoToken.balanceOf.call(investor1)).dividedBy(new BigNumber(10).pow(18)).toNumber(),1);
//         assert.equal((new BigNumber(await ano.getWeekNo())).toNumber(),0);
//         await increaseTime(7*24*60*60*4); //5th week
        
//         await web3.eth.sendTransaction({
//             from: investor2,
//             to: ano.address,
//             gas:300000,
//             value: web3.toWei('.00010942', 'Ether') // .00006078 + 4*.00001216
//         });
//         assert.equal((await ano.ethRaised()).dividedBy(new BigNumber(10).pow(18)).toNumber(),0.0001702); // .00006078 + .00010942 
//         assert.equal((await anoToken.balanceOf.call(investor2)).dividedBy(new BigNumber(10).pow(18)).toNumber(),1);
//         assert.equal((new BigNumber(await ano.getWeekNo())).toNumber(),4); //5th week
//         await increaseTime(7*24*60*60*6); //15th week
//         await web3.eth.sendTransaction({
//             from: investor3,
//             to: ano.address,
//             gas:300000,
//             value: web3.toWei('.00023102', 'Ether') // .00006078 + 14*.00001216
//         });
//         assert.equal((await ano.ethRaised()).dividedBy(new BigNumber(10).pow(18)).toNumber(),0.00040122); // .0001702 + .00023102 
//         assert.equal((await anoToken.balanceOf.call(investor3)).dividedBy(new BigNumber(10).pow(18)).toNumber(),1);
//         assert.equal((new BigNumber(await ano.getWeekNo())).toNumber(),14); //15th week
//         await increaseTime(7*24*60*60*15); //40th week
//         await web3.eth.sendTransaction({
//             from: investor3,
//             to: ano.address,
//             gas:300000,
//             value: web3.toWei('.00053502', 'Ether') // .00006078 + 39*.00001216
//         });
//         assert.equal((await ano.ethRaised()).dividedBy(new BigNumber(10).pow(18)).toNumber(),0.00093624); // .00040122 + .00053502
//         assert.equal((await anoToken.balanceOf.call(investor3)).dividedBy(new BigNumber(10).pow(18)).toNumber(),2);//2nd investment of investor3
//         assert.equal((new BigNumber(await ano.getWeekNo())).toNumber(),39); //40th week
//     });


//     it('endCrowdfund: trying to end crowdfund before endDate (will fail)', async() => {
//         let ano = await ANOCrowdsale.new(founderAddress, beneficiaryAddress);
//         let anoToken = await ANOToken.new(ano.address);
//         await ano.setTokenAddress(anoToken.address, {from: founderAddress});
//         try {
//             await ano.endCrowdfund({from: founderAddress});
//         }catch (error) {
//             return Utils.ensureException(error);
//         }      
//     });

//     it('endCrowdfund: trying to end crowdfund after endDate using other address (will fail)', async() => {
//         let ano = await ANOCrowdsale.new(founderAddress, beneficiaryAddress);
//         let anoToken = await ANOToken.new(ano.address);
//         await ano.setTokenAddress(anoToken.address, {from: founderAddress});
//         try{
//             await ano.endCrowdfund({from: caller1});        
//         }catch (error) {
//             return Utils.ensureException(error);
//         }     
//     });

//     it('endCrowdfund: trying to end crowdfund after endDate using founder address', async() => {
//         let ano = await ANOCrowdsale.new(founderAddress, beneficiaryAddress);
//         let anoToken = await ANOToken.new(ano.address);
//         await ano.setTokenAddress(anoToken.address, {from: founderAddress});
//         await increaseTime(7*24*60*60*40 + 50);
//         await ano.endCrowdfund({from: founderAddress});
//         assert.equal((await anoToken.balanceOf.call(ano.address)).dividedBy(new BigNumber(10).pow(18)).toNumber(),0);
             
//     });

//     it('buyTokens: buying tokens after end of the crowdFund (will fail)', async() => {
//         let ano = await ANOCrowdsale.new(founderAddress, beneficiaryAddress);
//         let anoToken = await ANOToken.new(ano.address);
//         await ano.setTokenAddress(anoToken.address, {from: founderAddress});
//         try {
//             await web3
//                 .eth
//                 .sendTransaction({
//                     from: investor1,
//                     to: ano.address,
//                     gas: 300000,
//                     value: web3.toWei('1', 'Ether')
//                 });
//         } catch (error) {
//             return Utils.ensureException(error);
//         }
//     });

//   });