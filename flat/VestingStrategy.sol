pragma solidity ^0.4.18;

/**
 *  SafeMath <https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/math/SafeMath.sol/>
 *  Copyright (c) 2016 Smart Contract Solutions, Inc.
 *  Released under the MIT License (MIT)
 */

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

/**
 *  SafeMath <https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/token/BasicToken.sol/>
 *  Copyright (c) 2016 Smart Contract Solutions, Inc.
 *  Released under the MIT License (MIT)
 */


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
    address public marketingAddress;

    event OwnershipTransfered(uint256 _timestamp, address _newFounderAddress);

    function UberToken(address _crowdsaleAddress, address _vestingContract, address _founderAddress, address _marketingAddress) public {
        tokenAllocToTeam = 13500000 * 10 ** 18;                              //10 % Allocation
        tokenAllocToCrowdsale = 114750000 * 10 ** 18;                        // 85 % Allocation 
        tokenAllocToMM = 6750000 * 10 ** 18;                                 // 5 % Allocation

        // Address 
        crowdsaleAddress = _crowdsaleAddress;
        vestingContractAddress = _vestingContract;
        founderAddress = _founderAddress;
        marketingAddress = _marketingAddress;

        // Allocations
        balances[crowdsaleAddress] = tokenAllocToCrowdsale;
        balances[marketingAddress] = tokenAllocToMM;
        balances[vestingContractAddress] = tokenAllocToTeam;

        allocatedTokens = balances[marketingAddress];
    }  

    function transferOwnership(address _newFounderAddress) public returns(bool) {
        require(msg.sender == founderAddress);
        founderAddress = _newFounderAddress;
        OwnershipTransfered(now,_newFounderAddress);
        return true;
    }

    /**
     * @dev use to burn the token
     */

    function burn() public returns(bool) {
        require(msg.sender == crowdsaleAddress);
        uint256 burnAmount = balances[crowdsaleAddress];
        totalSupply = totalSupply.sub(burnAmount);
        balances[crowdsaleAddress] = 0;
        return true;
    }


}

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
        firstSlotTimestamp = 1519862400 + 6 * 30 days;
        secondSlotTimestamp = firstSlotTimestamp + 6 * 30 days;
        thirdSlotTimestamp = secondSlotTimestamp + 6 * 30 days;
        finalSlotTimestamp = thirdSlotTimestamp + 6 * 30 days + 10 days; // To cover the month days difference
        vestingPeriod = 1519862400 + 2 * 365 days;   // 3 months for crowdsale end + 2 years of vesting
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