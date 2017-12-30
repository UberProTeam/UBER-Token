pragma solidity ^0.4.18;

import './lib/safeMath.sol';

contract Vesting {

    using SafeMath for uint256;

    // Variable declaration
    address public founderAddress;
    address[] public listOfTeamAdd;
    address[] public listOfMMAdd;

    bool private isAddressAdded = false;
    bool private isMMAddressAdded = false;
    uint256 public vestingPeriod;

    modifier onlyFounder(){
        require(msg.sender == founderAddress);
        _;
    }

    function Vesting() public {
        founderAddress = msg.sender;
        vestingPeriod = now + 90 weeks + 2 * 365 days;   // 3 months for crowdsale end + 2 years of vesting
    }

    function addTeamAddress(address[] _listOfTeamAdd) onlyFounder public returns(bool) {
        require(isteamAddressAdded = false);
        require(_listOfTeamAdd.length != 0);
        for (uint i = 0; i<_listOfTeamAdd.length; ++i) {
            listOfTeamAdd[i] = _listOfTeamAdd[i];
        }
        isteamAddressAdded = !isteamAddressAdded;
        return true;
    }

    function addMMAddress(address[] _listOfMMAdd) onlyFounder public returns(bool) {
        require(isMMAddressAdded = false);
        require(_listOfMMAdd.length != 0);
        for (uint i = 0; i<_listOfMMAdd.length; ++i) {
            listOfTeamAdd[i] = _listOfMMAdd[i];
        }
        isMMAddressAdded = !isMMAddressAdded;
        return true;
    }

    function releaseTokenToTeam() onlyFounder public returns(bool) {
        require(now >=  v )
    }



}