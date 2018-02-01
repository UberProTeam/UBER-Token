pragma solidity ^0.4.18;

import './lib/safeMath.sol';
import './UberToken.sol';

contract UberCrowdsale {

    using SafeMath for uint256;

    UberToken public token;
    uint32 public tokenRate = 1000;
    uint256 public MIN_PRESALE = 1 ether;
    uint256 public MIN_CROWDSALE = 100 finney;
    uint256 public MAX_INVESTMENT_GOAL = 100000 ether;
    uint256 public ethRaised;
    uint256 public presaleAllotment = 6750000 * 10 ** 18;
    uint256 public crowdsaleAllotment = 108000000 * 10 ** 18;
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

    /**
     * @dev `fundTransfer` use to trasfer the fund from contract to beneficiary
     * @param _fund Amount of wei to transfer 
     */

    function fundTransfer(uint256 _fund) internal returns(bool) {
        beneficiaryAddress.transfer(_fund);
        return true;
    }

    function () payable public {
        buyTokens(msg.sender);
    }

    // Constructor

    function UberCrowdsale(address _operatorAddress, address _beneficiaryAddress) public {
        operatorAddress = _operatorAddress;
        beneficiaryAddress = _beneficiaryAddress;
        startPresaleDate = 1520467200;          
        endPresaleDate = startPresaleDate + 4 weeks;
        isPresaleActive = !isPresaleActive;
    } 

    /**
     * @dev `setTokenAddress` use to add the token address
     * @param _tokenAddress  Address of the token
     */
    function setTokenAddress(address _tokenAddress) onlyOperator public returns (bool) {
        require(_tokenAddress != address(0));
        require(isTokenSet == false);
        token = UberToken(_tokenAddress);
        tokenAddress = _tokenAddress;
        isTokenSet = !isTokenSet;
        return true;
    }

    /**
     * @dev `endPresale` Function used to end the presale
     */

    function endPresale() onlyOperator public {
        require(isTokenSet == true);
        require(now > endPresaleDate);
        require(isPresaleActive == true);
        require(isGapActive == false);
        isPresaleActive = !isPresaleActive;
        isGapActive = !isGapActive;
    }

    /**
     * @dev use to active the crowdsale
     */

    function activeCrowdsale() onlyOperator public {
        require(isGapActive == true);
        startCrowdsaleDate = now;
        endCrowdsaleDate = now + 4 weeks;
        isCrowdsaleActive = !isCrowdsaleActive;
    }

    /**
     * @dev used to add the minimum investment figure
     * @param _newMinInvestment minimum investment
     */

    function changeMinInvestment(uint256 _newMinInvestment) onlyOperator public {
       if (getState() == State.Presale) {
           MIN_PRESALE = _newMinInvestment;
       }
       if (getState() == State.Crowdsale) {
           MIN_CROWDSALE = _newMinInvestment;
       }
        
    }

    /**
     * @dev get function to get the state of the contract
     */

    function getState() view public returns(State) {
        if (isPresaleActive == true) {
            require(now >= startPresaleDate && now <= endPresaleDate);
            return State.Presale;
        }
        if (isCrowdsaleActive == true) {
            require(now >= startCrowdsaleDate && now <= endCrowdsaleDate);
            return State.Crowdsale;
        }
        if (isGapActive == true) {
            return State.Gap;
        }
        return State.Finish;
    }

    /**
     * @dev use to get the bonus of the week
     */
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

   /**
    * @dev It is used to buy the token 
    * @param _investorAddress Address of the constructor
    */

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

    /**
     * @dev `getTokenAmount` use to get the tokens amount corresponds to the invested money
     * @param _investedAmount Amount need to be invested
     */

    function getTokenAmount(uint256 _investedAmount) view public returns (uint256) {
        uint256 bonus = uint256(getBonus());
        uint256 withoutBonusAmount = uint256(tokenRate).mul(_investedAmount);
        uint256 bonusAmount = ((withoutBonusAmount.mul(100)).add(withoutBonusAmount.mul(bonus))).div(100);
        return bonusAmount;
    }

    /**
     * @dev common function use in the buyTokens function
     * @param _investorAddress Address of the investor
     * @param _amount Amount the investor invested
     */

    function tokenSold(address _investorAddress, uint256 _amount) private returns (bool) {
        require(token.transfer(_investorAddress, _amount));
        ethRaised = ethRaised.add(msg.value);
        TokenBought(_investorAddress, _amount);
        return true;
    }

    /**
     * @dev `endCrowdfund` Use to end the crowdfund
     * @param _decide parameter to decide the operation
     * @param _newCrowdsale address of the new crowdsale contract
     */

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