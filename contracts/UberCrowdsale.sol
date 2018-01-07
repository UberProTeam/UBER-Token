pragma solidity ^0.4.18;

import './lib/safeMath.sol';
import './UberToken.sol';

contract UberCrowdsale {

    using SafeMath for uint256;

    UberToken token;
    uint32 public tokenRate = 1000;
    uint256 public MIN_PRESALE = 1 ether;
    uint256 public MIN_CROWDSALE = 100 finney;
    uint256 public MAX_INVESTMENT_GOAL = 100000 ether;
    uint256 public ethRaised;
    uint256 public presaleAllotment = 6750000 * 10 ** 18;
    uint256 public crowdsaleAllotment = 108000000;
    uint256 public soldPresaleToken = 0;
    uint256 public soldCrowdsaleToken = 0;

    uint256 public startPresaleDate;
    uint256 public endPresaleDate;
    uint256 public startCrowdsaleDate;
    uint256 public endCrowdsaleDate;

    bool private isPresaleActive = false;
    bool private isCrowdsaleActive = false;
    bool private isGapActive = false;
    bool public isTokenSet = false;

    address public operatorAddress;
    address public beneficiaryAddress;
    address public tokenAddress;

    event TokenBought(address indexed _investor, uint256 _token);
    event BurnToken(uint256 _amount, uint256 _timestamp);
    event RemainingTokenTransfered(address indexed _newCrowdsale, uint256 _timestamp);

    enum State { Presale, Gap, Crowdsale, Finish } 


    modifier onlyOperator() {
        require(operatorAddress == msg.sender);
        _;
    }

    function fundTransfer(uint256 _fund) internal returns(bool) {
        beneficiaryAddress.transfer(_fund);
        return true;
    }

    function () payable public {
        buyTokens(msg.sender);
    }

    function UberCrowdsale(address _operatorAddress, address _beneficiaryAddress) public {
        operatorAddress = _operatorAddress;
        beneficiaryAddress = _beneficiaryAddress;
        startPresaleDate = now;
        endPresaleDate = now + 4 weeks;
        isPresaleActive = !isPresaleActive;
    } 

    function activeCrowdsale() onlyOperator public {
        require(isGapActive == true);
        startCrowdsaleDate = now;
        endCrowdsaleDate = now + 4 weeks;
        isCrowdsaleActive = !isCrowdsaleActive;
    }

    function endPresale() onlyOperator public {
        require(isTokenSet == true);
        require(isPresaleActive == true);
        require(isGapActive == false);
        isPresaleActive = !isPresaleActive;
        isGapActive = !isGapActive;
    }

    function changeMinInvestment(uint256 _newMinInvestment) onlyOperator public {
       if (getState() == State.Presale) {
           MIN_PRESALE = _newMinInvestment;
       }
       if (getState() == State.Crowdsale) {
           MIN_CROWDSALE = _newMinInvestment;
       }
        
    }

    function getState() view public returns(State) {
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
        return State.Finish;
    }

    function getBonus() view public returns(uint16) {
        if (getState() == State.Presale) {
            if (now >= startPresaleDate && now <= startPresaleDate + 1 weeks) {
                return 50;
            }
            if (now > startPresaleDate + 1 weeks && now <= startPresaleDate + 4 weeks) {
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

    function setTokenAddress(address _tokenAddress) onlyOperator public returns (bool) {
        require(_tokenAddress != address(0));
        require(isTokenSet == false);
        token = UberToken(_tokenAddress);
        tokenAddress = _tokenAddress;
        isTokenSet = !isTokenSet;
        return true;
    }

    function buyTokens(address _investorAddress)
    public 
    payable
    returns (bool) 
    {
        require(isTokenSet == true);
        require(MAX_INVESTMENT_GOAL >= ethRaised + msg.value);
        uint256 tokenAmount;
        if (getState() == State.Presale) {
            require(msg.value >= MIN_PRESALE);
            tokenAmount = getTokenAmount(msg.value);
            require(presaleAllotment >= soldPresaleToken + tokenAmount);
            require(fundTransfer(msg.value));
            require(tokenSold(_investorAddress, tokenAmount));
            soldPresaleToken = soldPresaleToken.add(tokenAmount);
            return true;
        }
        if (getState() == State.Crowdsale) {
            require(msg.value >= MIN_CROWDSALE);
            tokenAmount = getTokenAmount(msg.value);
            require(crowdsaleAllotment >= soldCrowdsaleToken + tokenAmount);
            require(fundTransfer(msg.value));
            require(tokenSold(_investorAddress, tokenAmount));
            soldCrowdsaleToken = soldCrowdsaleToken.add(tokenAmount);
            return true;
        }
        if (getState() == State.Gap) {
            revert();
        }  
    } 

    function getTokenAmount(uint256 _investedAmount) view public returns (uint256) {
        uint256 bonus = uint256(getBonus());
        uint256 withoutBonusAmount = uint256(tokenRate).mul(_investedAmount);
        uint256 bonusAmount = ((withoutBonusAmount.mul(100)).add(withoutBonusAmount.mul(bonus))).div(100);
        return bonusAmount;
    }

    function tokenSold(address _investorAddress, uint256 amount) private returns (bool) {
        require(token.transfer(_investorAddress, amount));
        ethRaised = ethRaised.add(msg.value);
        TokenBought(_investorAddress, amount);
        return true;
    }

    function endCrowdfund(bool _decide, address _newCrowdsale) onlyOperator public returns(bool) {
        require(now > endCrowdsaleDate);
        require(isTokenSet == true);
        uint256 burnAmount = token.balanceOf(this);
        if (_decide) {
            require(token.burn());
            BurnToken(burnAmount, now);
            return true;
        } 
        require(_newCrowdsale != address(0));
        require(token.transfer(_newCrowdsale, burnAmount));
        RemainingTokenTransfered(_newCrowdsale, now);
        return true;
    }
}