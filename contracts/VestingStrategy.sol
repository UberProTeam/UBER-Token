 pragma solidity ^0.4.18;

import './lib/safeMath.sol';
import './UberToken.sol';

contract VestingStrategy {

    using SafeMath for uint256;

    UberToken token;
    // Variable declaration
    address public founderAddress;
    address public teamAddress;
    address public marketingAddress;
    address public tokenAddress;

    uint256 public firstSlotTimestamp;
    uint256 public secondSlotTimestamp;
    uint256 public thirdSlotTimestamp;
    uint256 public finalSlotTimestamp;
    uint256 public vestingPeriod;
    uint256 public slotAmount = 3375000 * 10 ** 18;

    bool private isTokenSet = false;

    modifier onlyFounder(){
        require(msg.sender == founderAddress);
        _;
    }

    function VestingStrategy(address _teamAddress, address _marketingAddress) public {
        marketingAddress = _marketingAddress;
        teamAddress = _teamAddress;
        founderAddress = msg.sender;
        firstSlotTimestamp = now + 6 * 30 days;
        secondSlotTimestamp = firstSlotTimestamp + 6 * 30 days;
        thirdSlotTimestamp = secondSlotTimestamp + 6 * 30 days;
        finalSlotTimestamp = thirdSlotTimestamp + 6 * 30 days;
        vestingPeriod = now + 2 * 365 days;   // 3 months for crowdsale end + 2 years of vesting
    }

    function setTokenAddress(address _tokenAddress) onlyFounder public returns (bool) {
        require(_tokenAddress != address(0));
        require(isTokenSet == false);
        token = UberToken(_tokenAddress);
        tokenAddress = _tokenAddress;
        isTokenSet = !isTokenSet;
        return true;
    }

    function releaseTokenToTeam() onlyFounder public returns(bool) {
        if (now >= finalSlotTimestamp) {
            require(token.transfer(teamAddress, slotAmount));
        }
        if (now >= thirdSlotTimestamp) {
            require(token.transfer(teamAddress, slotAmount));
        }
        if (now >= secondSlotTimestamp) {
            require(token.transfer(teamAddress, slotAmount));
        }
        if (now >= firstSlotTimestamp) {
            require(token.transfer(teamAddress, slotAmount));
        }
        return true;
    }

    function releaseTokenToMarketing() onlyFounder public returns(bool) {
        if (now >= firstSlotTimestamp) {
            require(token.transfer(marketingAddress, (slotAmount * 2)));
            return true;
        }
        return false;
    }



}