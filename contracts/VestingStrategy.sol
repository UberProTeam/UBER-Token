 pragma solidity ^0.4.18;

import './lib/safeMath.sol';
import './UberToken.sol';

contract VestingStrategy {

    using SafeMath for uint256;

    UberToken token;
    // Variable declaration
    address public founderAddress;
    address public teamAddress;
    address public tokenAddress;

    uint256 public firstSlotTimestamp;
    uint256 public secondSlotTimestamp;
    uint256 public thirdSlotTimestamp;
    uint256 public finalSlotTimestamp;
    uint256 public vestingPeriod;
    uint256 public tokenReleased = 0;
    uint256 public slotAmount = 3375000 * 10 ** 18;

    bool private isTokenSet = false;

    modifier onlyFounder(){
        require(msg.sender == founderAddress);
        _;
    }

    // Constructor
    function VestingStrategy(address _teamAddress) public {
        teamAddress = _teamAddress;
        founderAddress = msg.sender;
        firstSlotTimestamp = 1520467200 + 6 * 30 days;
        secondSlotTimestamp = firstSlotTimestamp + 6 * 30 days;
        thirdSlotTimestamp = secondSlotTimestamp + 6 * 30 days;
        finalSlotTimestamp = thirdSlotTimestamp + 6 * 30 days + 10 days; // To cover the month days difference
        vestingPeriod = 1520467200 + 2 * 365 days;   // 3 months for crowdsale end + 2 years of vesting
    }

    /**
     * @dev `setTokenAddress` use to add the token address
     * @param _tokenAddress Address of the token 
     */

    function setTokenAddress(address _tokenAddress) onlyFounder public returns (bool) {
        require(_tokenAddress != address(0));
        require(isTokenSet == false);
        token = UberToken(_tokenAddress);
        tokenAddress = _tokenAddress;
        isTokenSet = !isTokenSet;
        return true;
    }

    /**
     * `releaseTokenToTeam` use to release the tokens according to vesting strategy
     */

    function releaseTokenToTeam() onlyFounder public returns(bool) {
        require(isTokenSet == true);
        if (now >= finalSlotTimestamp) {
            if (tokenReleased == 0) {
                require(token.transfer(teamAddress, 4*slotAmount));
                tokenReleased = tokenReleased.add(4*slotAmount);
            } else if ((tokenReleased).div(slotAmount) == 1) {
                require(token.transfer(teamAddress,3*slotAmount));
                tokenReleased = tokenReleased.add(3*slotAmount);
            } else if ((tokenReleased).div(slotAmount) == 2) {
                require(token.transfer(teamAddress,2*slotAmount));
                tokenReleased = tokenReleased.add(2*slotAmount);
            } else if ((tokenReleased).div(slotAmount) == 3) {
                require(token.transfer(teamAddress,slotAmount));
                tokenReleased = tokenReleased.add(slotAmount);
            } 
        }else if (now >= thirdSlotTimestamp) {
            if (tokenReleased == 0) {
                require(token.transfer(teamAddress, 3*slotAmount));
                tokenReleased = tokenReleased.add(3*slotAmount);
            } else if ((tokenReleased).div(slotAmount) == 1) {
                require(token.transfer(teamAddress,2*slotAmount));
                tokenReleased = tokenReleased.add(2*slotAmount);
            } else if ((tokenReleased).div(slotAmount) == 2) {
                require(token.transfer(teamAddress,slotAmount));
                tokenReleased = tokenReleased.add(slotAmount);
            }                
        }else if (now >= secondSlotTimestamp) {
            if (tokenReleased == 0) {
                require(token.transfer(teamAddress, 2*slotAmount));
                tokenReleased = tokenReleased.add(2*slotAmount);
            } else {
                require(token.transfer(teamAddress,slotAmount));
                tokenReleased = tokenReleased.add(slotAmount);
            }                 
        }else if (now >= firstSlotTimestamp) {
            require(token.transfer(teamAddress, slotAmount));
            tokenReleased = tokenReleased.add(slotAmount);
        } else {
            return false;
        }
        return true;
    }

}