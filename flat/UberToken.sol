pragma solidity ^0.4.18;

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
    string public name = "Uber Token";                                          // Name of the token
    string public symbol = "UBER";                                              // Symbol of the token
    uint16 public decimals = 18;                                                // Decimals for the token
    uint256 public totalSupply = 135000000 * 10 ** 18;                          // Total generated pre-mined tokens

    // distribution variables
    uint256 public tokenAllocToTeam;                                            // Token allocated to team    
    uint256 public tokenAllocToCrowdsale;                                       // Token allocated to crowdsale contract    
    uint256 public tokenAllocToMM;                                              // Token allocation for in marketing and media 
    uint256 public allocatedTokens;                                             // Variable to track to the allocated tokens 

    // addresses
    address public crowdsaleAddress;                                            // Address of the crowdsale contract
    address public vestingContractAddress;                                      // Address of the vesting contract to hold the tokens of the team
    address public founderAddress;                                              // Address of th founder which controls the admin function of the token contract
    address public marketingAddress;                                            // Address which hold the marketing tokens

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

    /**
     * @dev use to transfer the ownership of the contract address to other
     * @param _newFounderAddress Address of the new founder
     * @return bool
     */
    
    function transferOwnership(address _newFounderAddress) public returns(bool) {
        require(msg.sender == founderAddress);
        founderAddress = _newFounderAddress;
        OwnershipTransfered(now,_newFounderAddress);
        return true;
    }

    /**
     * @dev use to burn the tokens after the completion of the crowdsale
     * @return bool
     */

    function burn() public returns(bool) {
        require(msg.sender == crowdsaleAddress);
        uint256 burnAmount = balances[crowdsaleAddress];
        totalSupply = totalSupply.sub(burnAmount);
        balances[crowdsaleAddress] = 0;
        return true;
    }


}