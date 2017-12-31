pragma solidity ^0.4.18;

import './helpers/BasicToken.sol';
import './lib/safeMath.sol';

contract UberToken is BasicToken {

    using SafeMath for uint256;

    // token Variable declaration
    string public name = "Uber Token";
    string public symbol = "UBER";
    uint16 public decimals = 18;
    uint256 public totalSupply = 135000000 * 10 ** 18;

    // distribution variables
    uint256 public tokenAllocToTeam;
    uint256 public tokenAllocToCrowdsale;
    uint256 public tokenAllocToMM;
    uint256 public allocatedTokens;

    // addresses
    address public crowdsaleAddress;
    address public vestingContractAddress;
    address public founderAddress;

    event OwnershipTransfered(uint256 _timestamp, address _newFounderAddress);

    function UberToken(address _crowdsaleAddress, address _vestingContract, address _founderAddress) public {
        tokenAllocToTeam = 13500000 * 10 ** 18;                              //10 % Allocation
        tokenAllocToCrowdsale = 114750000 * 10 ** 18;                        // 85 % Allocation 
        tokenAllocToMM = 6750000 * 10 ** 18;                                 // 5 % Allocation

        crowdsaleAddress = _crowdsaleAddress;
        vestingContractAddress = _vestingContract;
        founderAddress = _founderAddress;

        balances[crowdsaleAddress] = tokenAllocToCrowdsale;
        balances[vestingContractAddress] = tokenAllocToTeam.add(tokenAllocToMM);

        allocatedTokens = balances[crowdsaleAddress].add(balances[vestingContractAddress]);

    }  

    function transferOwnership(address _newFounderAddress) public returns(bool) {
        require(msg.sender == founderAddress);
        founderAddress = _newFounderAddress;
        OwnershipTransfered(now,_newFounderAddress);
        return true;
    }

    function burn() public returns(bool) {
        require(msg.sender == crowdsaleAddress);
        uint256 burnAmount = balances[crowdsaleAddress];
        totalSupply = totalSupply.sub(burnAmount);
        balances[crowdsaleAddress] = 0;
        return true;
    }


}