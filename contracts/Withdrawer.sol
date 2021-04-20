//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0; 
import './utils.sol';

contract Withdrawer {
    address public OWNER;

    constructor() {
        OWNER = msg.sender;
    }

   function withdrawToken(address _tokenAddress) external {
        uint256 balance = IERC20(_tokenAddress).balanceOf(address(this));
        IERC20(_tokenAddress).transfer(OWNER, balance);
    }

    function withdrawEther() external {
        address self = address(this);
        uint256 balance = self.balance;
        payable(OWNER).transfer(balance);
    }
}