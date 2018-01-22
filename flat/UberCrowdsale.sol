pragma solidity ^0.4.18;

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }

  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }

  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}

contract ERC20 {
  uint256 public totalSupply;
  function balanceOf(address who) public view returns (uint256);
  function transfer(address to, uint256 value) public returns (bool);
  event Transfer(address indexed from, address indexed to, uint256 value);
  function allowance(address owner, address spender) public view returns (uint256);
  function transferFrom(address from, address to, uint256 value) public returns (bool);
  function approve(address spender, uint256 value) public returns (bool);
  event Approval(address indexed owner, address indexed spender, uint256 value);
    
}

contract BasicToken is ERC20 {
    using SafeMath for uint256;

    mapping(address => uint256) balances;
    mapping (address => mapping (address => uint256)) allowed;

    /**
  * @dev transfer token for a specified address
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */

    function transfer(address _to, uint256 _value) public returns (bool) {
        if (balances[msg.sender] >= _value && balances[_to] + _value > balances[_to]) {
            balances[msg.sender] = balances[msg.sender].sub(_value);
            balances[_to] = balances[_to].add(_value);
            Transfer(msg.sender, _to, _value);
            return true;
        }else {
            return false;
        }
    }
    

    /**
   * @dev Transfer tokens from one address to another
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint256 the amout of tokens to be transfered
   */

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
      if (balances[_from] >= _value && allowed[_from][msg.sender] >= _value && balances[_to] + _value > balances[_to]) {
        uint256 _allowance = allowed[_from][msg.sender];
        allowed[_from][msg.sender] = _allowance.sub(_value);
        balances[_to] = balances[_to].add(_value);
        balances[_from] = balances[_from].sub(_value);
        Transfer(_from, _to, _value);
        return true;
      } else {
        return false;
      }
}


    /**
  * @dev Gets the balance of the specified address.
  * @param _owner The address to query the the balance of. 
  * @return An uint256 representing the amount owned by the passed address.
  */

    function balanceOf(address _owner) public view returns (uint256 balance) {
    return balances[_owner];
  }

  function approve(address _spender, uint256 _value) public returns (bool) {

    // To change the approve amount you first have to reduce the addresses`
    //  allowance to zero by calling `approve(_spender, 0)` if it is not
    //  already 0 to mitigate the race condition described here:
    //  https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
    require((_value == 0) || (allowed[msg.sender][_spender] == 0));

    allowed[msg.sender][_spender] = _value;
    Approval(msg.sender, _spender, _value);
    return true;
  }

  /**
   * @dev Function to check the amount of tokens that an owner allowed to a spender.
   * @param _owner address The address which owns the funds.
   * @param _spender address The address which will spend the funds.
   * @return A uint256 specifing the amount of tokens still avaible for the spender.
   */
  function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
    return allowed[_owner][_spender];
  }


}

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

    function setTokenAddress(address _tokenAddress) onlyOperator public returns (bool) {
        require(_tokenAddress != address(0));
        require(isTokenSet == false);
        token = UberToken(_tokenAddress);
        tokenAddress = _tokenAddress;
        isTokenSet = !isTokenSet;
        return true;
    }

    function endPresale() onlyOperator public {
        require(isTokenSet == true);
        require(now > endPresaleDate);
        require(isPresaleActive == true);
        require(isGapActive == false);
        isPresaleActive = !isPresaleActive;
        isGapActive = !isGapActive;
    }

    function activeCrowdsale() onlyOperator public {
        require(isGapActive == true);
        startCrowdsaleDate = now;
        endCrowdsaleDate = now + 4 weeks;
        isCrowdsaleActive = !isCrowdsaleActive;
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