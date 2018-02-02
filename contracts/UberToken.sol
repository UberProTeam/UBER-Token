pragma solidity ^0.4.18;

import './helpers/BasicToken.sol';
import './lib/safeMath.sol';

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