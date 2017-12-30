pragma solidity ^0.4.18;

import './lib/safeMath.sol';

contract UberCrowdsale {

    using SafeMath for uint256;

    uint32 public tokenRate = 1000;
    uint256 private MINIMUM_PRESALE = 1 ether;
    uint256 private MINIMUM_CROWDSALE = 100 finney;
    uint256 public MIN_INVESTMENT_GOAL = 100000 ether;

    uint256 public startPresaleDate;
    uint256 public endPresaleDate;
    uint256 public startCrowdsaleDate;
    uint256 public endCrowdsaleDate;

    bool private isPresaleActive = false;
    bool private isCrowdsaleActive = false;
    bool private isGapActive = false;

    event TokenBought(address indexed _investor, uint256 _token);

    enum State { Presale, Gap, Crowdsale, finish } 


    function getBonus() public returns(uint) {
        if (getState() == State.Presale) {
            if (now >= startPresaleDate && now <= startPresaleDate + 1 weeks) {
                return 50;
            }
            if (now > startPresaleDate + 1 weeks && now <= startPresaleDate + 3 weeks) {
                return 40;
            }
        }
        if (getState() == State.Crowdsale) {
            if (now >= startCrowdsaleDate && now <= startCrowdsaleDate + 1 weeks) {
                return 20;
            }
            if (now > startCrowdsaleDate + 1 weeks && now <= startCrowdsaleDate + 2 weeks) {
                return 10;
            }
            if (now > startCrowdsaleDate + 2 weeks && now <= startCrowdsaleDate + 3 weeks) {
                return 5;
            } 
            return 0;
        }
    }

    function getState() public returns(State) {
        if (isPresaleActive == true) {
            require(now > startPresaleDate && now <= endPresaleDate);
            return State.Presale;
        }
        if (isCrowdsaleActive == true) {
            require(now > startCrowdsaleDate && now <= endCrowdsaleDate);
            return State.Crowdsale;
        }
        if (isGapActive == true) {
            return State.Gap;
        }
    }
}