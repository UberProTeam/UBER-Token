pragma solidity ^0.4.6;

import "./Crowdsale.sol";
import "./SafeMathLib.sol";

contract Presale is Ownable {
using SafeMathLib for uint;
uint public MAX_INVESTORS = 32;
uint public investorCount;
address[] public investors;
mapping(address => uint) public balances;
uint public freezeEndsAt;
uint public weiMinimumLimit;
bool public moving;
Crowdsale public crowdsale;
event Invested(address investor, uint value);
event Refunded(address investor, uint value);

 function Presale(address _owner, uint _freezeEndsAt, uint _weiMinimumLimit) {

    owner = _owner;

    if(_freezeEndsAt == 0) {
      throw;
    }

    if(_weiMinimumLimit == 0) {
      throw;
    }

    weiMinimumLimit = _weiMinimumLimit;
    freezeEndsAt = _freezeEndsAt;
  }

  
  function invest() public payable {

    if(moving) throw;

    address investor = msg.sender;

    bool existing = balances[investor] > 0;

    balances[investor] = balances[investor].plus(msg.value);

        if(balances[investor] < weiMinimumLimit) {
      throw;
    }
    if(!existing) {
    if(investorCount >= MAX_INVESTORS) throw;

      investors.push(investor);
      investorCount++;
    }

    Invested(investor, msg.value);
  }

  function participateCrowdsaleInvestor(address investor) public {

    // Not Crowdsale 
    if(address(crowdsale) == 0) throw;

    moving = true;

    if(balances[investor] > 0) {
      uint amount = balances[investor];
      delete balances[investor];
      crowdsale.invest.value(amount)(investor);
    }
  }

  
  function participateCrowdsaleAll() public {

  
    for(uint i=0; i<investors.length; i++) {
       participateCrowdsaleInvestor(investors[i]);
    }
  }

  
 //refund function needs to be written.