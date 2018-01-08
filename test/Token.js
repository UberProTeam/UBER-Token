
// const UBER = artifacts.require('UberToken.sol');
// const Utils = require('./helpers/Utils');
// const BigNumber = require('bignumber.js');



// contract("UBERToken", (accounts) => {
//     let crowdsaleAddress;
//     let vestingAddress;
//     let founder;
//     let FounderMultisigAddress2;
//     let holder1;
//     let holder2;
//     let holder3;
//     let holder4;
//     let supply = 135000000;

//     before(async() => {
//         founder = accounts[0];
//         holder1 = accounts[1];
//         holder2 = accounts[2];
//         holder3 = accounts[3];
//         holder4 = accounts[4];
//         crowdsaleAddress = accounts[5];
//         vestingAddress = accounts[6];
//         FounderMultisigAddress2 = accounts[7];
//     });

//     it("Verify constructors",async()=>{
//         let uber = await UBER.new(crowdsaleAddress, vestingAddress, founder);

//         let tokenName = await uber.name();
//         assert.equal(tokenName.toString(),"Uber Token");

//         let tokenSymbol = await uber.symbol();
//         assert.equal(tokenSymbol.toString(),"UBER");

//         let tokenSupply = await uber.totalSupply();
//         assert.equal(tokenSupply.dividedBy(new BigNumber(10).pow(18)).toNumber(),supply);

//         let tokenAllocToTeam = await uber.tokenAllocToTeam();
//         assert.equal(tokenAllocToTeam.dividedBy(new BigNumber(10).pow(18)).toNumber(),13500000);

//         let tokenAllocToCrowdsale = await uber.tokenAllocToCrowdsale();
//         assert.equal(tokenAllocToCrowdsale.dividedBy(new BigNumber(10).pow(18)).toNumber(),114750000);

//         let tokenAllocToMM = await uber.tokenAllocToMM();
//         assert.equal(tokenAllocToMM.dividedBy(new BigNumber(10).pow(18)).toNumber(),6750000);

//         let crowdAddress = await uber.crowdsaleAddress();
//         assert.equal(crowdsaleAddress.toString(), crowdAddress);

//         let vestingAddress = await uber.vestingContractAddress();
//         assert.equal(vestingAddress.toString(), vestingAddress);

//         let founderAddress = await uber.founderAddress();
//         assert.equal(founderAddress.toString(), founder);

//         let crowdBalance = await uber.balanceOf.call(crowdAddress);
//         assert.strictEqual(crowdBalance.dividedBy(new BigNumber(10).pow(18)).toNumber(), 114750000);

//         let vestingBalance = await uber.balanceOf.call(vestingAddress);
//         assert.strictEqual(vestingBalance.dividedBy(new BigNumber(10).pow(18)).toNumber(), 6750000+13500000);
//     });

//   it('transfer: ether directly to the token contract -- it will throw', async() => {
//         let uber = await UBER.new(crowdsaleAddress, vestingAddress, founder);
//         try {
//             await web3
//                 .eth
//                 .sendTransaction({
//                     from: holder1,
//                     to: uber.address,
//                     value: web3.toWei('1', 'Ether')
//                 });
//         } catch (error) {
//             //console.log(error);
//             return Utils.ensureException(error);
//         }
//     });

//     it('transfer: should transfer 10000 to holder1 from owner', async() => {
//         let uber = await UBER.new(crowdsaleAddress, vestingAddress, founder);
//         await uber.transfer(holder1, 10000, {from: crowdsaleAddress});
//         let balance = await uber
//             .balanceOf
//             .call(holder1);
//         assert.strictEqual(balance.toNumber(), 10000);
//     });

//      it('transfer: first should transfer 10000 to holder1 from owner then holder1 transfers 1000 to holder2',
//     async() => {
//         let uber = await UBER.new(crowdsaleAddress, vestingAddress, founder);
//         await uber.transfer(holder1, 10000, {from: crowdsaleAddress});
//         let balance = await uber
//             .balanceOf
//             .call(holder1);
//         assert.strictEqual(balance.toNumber(), 10000);
//         await uber.transfer(holder2, 1000, {from: holder1});
//         let acc2Balance = await uber
//             .balanceOf
//             .call(holder2);
//         assert.strictEqual(acc2Balance.toNumber(), 1000);
//         let acc1Balance = await uber
//             .balanceOf
//             .call(holder1);
//         assert.strictEqual(acc1Balance.toNumber(), 9000);
//     });

//     it('approve: holder1 should approve 1000 to holder2', async() => {
//         let uber = await UBER.new(crowdsaleAddress, vestingAddress, founder);
//         await uber.transfer(holder1, 10000, {from: crowdsaleAddress});
//         await uber.approve(holder2, 1000, {from: holder1});
//         let _allowance = await uber
//             .allowance
//             .call(holder1, holder2);
//         assert.strictEqual(_allowance.toNumber(),1000);
//     });

//     it('approve: holder1 should approve 1000 to holder2 & withdraws 200 once', async() => {
//         let uber = await UBER.new(crowdsaleAddress, vestingAddress, founder);
//         await uber.transfer(holder1, 2000, {from: crowdsaleAddress});
//         await uber.approve(holder2, 1000, {from: holder1})
//         let _allowance1 = await uber
//             .allowance
//             .call(holder1, holder2);
//         assert.strictEqual(_allowance1.toNumber(), 1000);
//         await uber.transferFrom(holder1, holder3, 200, {from: holder2});
//         let balance = await uber
//             .balanceOf
//             .call(holder3);
//         assert.strictEqual(balance.toNumber(), 200);
//         let _allowance2 = await uber
//             .allowance
//             .call(holder1, holder2);
//         assert.strictEqual(_allowance2.toNumber(), 800);
//         let _balance = await uber
//             .balanceOf
//             .call(holder1);
//         assert.strictEqual(_balance.toNumber(), 1800);
//     });

//     it('approve: holder1 should approve 1000 to holder2 & withdraws 200 twice', async() => {
//         let uber = await UBER.new(crowdsaleAddress, vestingAddress, founder);
//         await uber.transfer(holder1, 2000, {from: crowdsaleAddress});
//         await uber.approve(holder2, 1000, {from: holder1});
//         let _allowance1 = await uber
//             .allowance
//             .call(holder1, holder2);
//         assert.strictEqual(_allowance1.toNumber(), 1000);
//         await uber.transferFrom(holder1, holder3, 200, {from: holder2});
//         let _balance1 = await uber
//             .balanceOf
//             .call(holder3);
//         assert.strictEqual(_balance1.toNumber(), 200);
//         let _allowance2 = await uber
//             .allowance
//             .call(holder1, holder2);
//         assert.strictEqual(_allowance2.toNumber(), 800);
//         let _balance2 = await uber
//             .balanceOf
//             .call(holder1);
//         assert.strictEqual(_balance2.toNumber(), 1800);
//         await uber.transferFrom(holder1, holder4, 200, {from: holder2});
//         let _balance3 = await uber
//             .balanceOf
//             .call(holder4);
//         assert.strictEqual(_balance3.toNumber(), 200);
//         let _allowance3 = await uber
//             .allowance
//             .call(holder1, holder2);
//         assert.strictEqual(_allowance3.toNumber(), 600);
//         let _balance4 = await uber
//             .balanceOf
//             .call(holder1);
//         assert.strictEqual(_balance4.toNumber(), 1600);
//     });

//     it('Approve max (2^256 - 1)', async() => {
//         let uber = await UBER.new(crowdsaleAddress, vestingAddress, founder);
//         await uber.approve(holder1, '115792089237316195423570985008687907853269984665640564039457584007913129639935', {from: holder2});
//         let _allowance = await uber.allowance(holder2, holder1);
//         let result = _allowance.equals('1.15792089237316195423570985008687907853269984665640564039457584007913129639935e' +
//                 '+77');
//         assert.isTrue(result);
//     });


//     it('approves: holder1 approves holder2 of 1000 & withdraws 800 & 500 (2nd tx will be checked for failure)',
//     async() => {
//         let uber = await UBER.new(crowdsaleAddress, vestingAddress, founder);
//         await uber.transfer(holder1, 2000, {from: crowdsaleAddress});
//         await uber.approve(holder2, 1000, {from: holder1});
//         let _allowance1 = await uber
//             .allowance
//             .call(holder1, holder2);
//         assert.strictEqual(_allowance1.toNumber(), 1000);
//         let response1 = await uber.transferFrom(holder1, holder3, 800, {from: holder2});
//         assert.strictEqual(response1.logs[0].args.value.c[0], 800);       
//         let _balance1 = await uber
//             .balanceOf
//             .call(holder3);
//         assert.strictEqual(_balance1.toNumber(), 800);
//         let _allowance2 = await uber
//             .allowance
//             .call(holder1, holder2);
//         assert.strictEqual(_allowance2.toNumber(), 200);
//         let _balance2 = await uber
//             .balanceOf
//             .call(holder1);
//         assert.strictEqual(_balance2.toNumber(), 1200);
//         let response2 = await uber.transferFrom(holder1, holder3, 500, {from: holder2});
//         assert.strictEqual(response2.logs.length, 0);
         
//     });

//     it('transferFrom: Attempt to  withdraw from account with no allowance (will be checked for failure)', async() => {
//         let uber = await UBER.new(crowdsaleAddress, vestingAddress, founder);
//         await uber.transfer(holder1, 1000, {from: crowdsaleAddress});
//         let response = await uber.transferFrom(holder1, holder3, 100, {from: holder2});
//         assert.strictEqual(response.logs.length, 0);
//     });

//     it('transferFrom: Allow holder2 1000 to withdraw from holder1. Withdraw 800 and then approve 0 & attempt transfer',
//     async() => {
//         let uber = await UBER.new(crowdsaleAddress, vestingAddress, founder);
//         await uber.transfer(holder1, 2000, {from: crowdsaleAddress});
//         await uber.approve(holder2, 1000, {from: holder1});
//         let _allowance1 = await uber
//             .allowance
//             .call(holder1, holder2);
//         assert.strictEqual(_allowance1.toNumber(), 1000);
//         let response1 = await uber.transferFrom(holder1, holder3, 200, {from: holder2});
//         assert.strictEqual(response1.logs[0].args.value.c[0], 200);
//         let _balance1 = await uber
//             .balanceOf
//             .call(holder3);
//         assert.strictEqual(_balance1.toNumber(), 200);
//         let _allowance2 = await uber
//             .allowance
//             .call(holder1, holder2);
//         assert.strictEqual(_allowance2.toNumber(), 800);
//         let _balance2 = await uber
//             .balanceOf
//             .call(holder1);
//         assert.strictEqual(_balance2.toNumber(), 1800);
//         await uber.approve(holder2, 0, {from: holder1});
//         let response2 = await uber.transferFrom(holder1, holder3, 200, {from: holder2});
//         assert.strictEqual(response2.logs.length, 0);
//     });


//     it('transferOwnership: Founder address should be replaced with passed address', async() => {
//         let uber = await UBER.new(crowdsaleAddress, vestingAddress, founder);
//         let founderAddressBefore = await uber.founderAddress();
//         assert.equal(founderAddressBefore, founder);
//         await uber.transferOwnership(FounderMultisigAddress2, {from: founderAddressBefore});
//         let founderAddressAfter = await uber.founderAddress();
//         assert.equal(founderAddressAfter, FounderMultisigAddress2);
//     });
    
//     it('burnToken: Token balance of crowdfund address should become zero', async() => {
//         let uber = await UBER.new(crowdsaleAddress, vestingAddress, founder);
//         let tokenSupplyBefore = await uber.totalSupply();
//         assert.equal(tokenSupplyBefore.dividedBy(new BigNumber(10).pow(18)).toNumber(),supply);
//         await uber.burn({from: crowdsaleAddress});
//         let _balance = await uber
//             .balanceOf
//             .call(crowdsaleAddress);
//         assert.strictEqual(_balance.toNumber(), 0);
//     });

// });



