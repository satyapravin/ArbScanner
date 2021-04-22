//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import './IExchangeWrapper.sol';
import './Withdrawer.sol';

interface ERC20 {
    function totalSupply() external view returns (uint supply);
    function balanceOf(address _owner) external view returns (uint balance);
    function transfer(address _to, uint _value) external returns (bool success);
    function transferFrom(address _from, address _to, uint _value) external returns (bool success);
    function approve(address _spender, uint _value) external returns (bool success);
    function allowance(address _owner, address _spender) external view returns (uint remaining);
    function decimals() external view returns(uint digits);
    event Approval(address indexed _owner, address indexed _spender, uint _value);
}

abstract contract KyberNetworkProxy {
    function swapTokenToToken(ERC20 src, uint256 srcAmount, ERC20 dest, uint256 minConversionRate) public virtual returns(uint256);
    function getExpectedRateAfterFee(ERC20 src, ERC20 dest, uint256 srcQty, uint256 fees, bytes memory hint) public virtual view returns(uint256 expectedRate);   
}

contract KyberWrapper is IExchangeWrapper, Withdrawer {

    constructor() {
    }


    function getRate(address fromToken, address toToken, uint256 amount) override external view returns (uint256) {
        address kyberRegistryAddress = 0x9AAb3f75489902f3a48495025729a0AF77d4b11e;
        KyberNetworkProxy kyber = KyberNetworkProxy(kyberRegistryAddress);
        bytes memory hint = new bytes(0);
        uint256 expectedRate  = kyber.getExpectedRateAfterFee(ERC20(fromToken), ERC20(toToken), amount, 25, hint);
        return expectedRate;
    }

    function swapTokens(address fromToken, address toToken, uint256 amount, address to) override public payable {
        address kyberRegistryAddress = 0x9AAb3f75489902f3a48495025729a0AF77d4b11e;
        KyberNetworkProxy kyber = KyberNetworkProxy(kyberRegistryAddress);
        
        IERC20 fromERC20 = IERC20(fromToken);
        fromERC20.approve(kyberRegistryAddress, amount);

        kyber.swapTokenToToken(ERC20(fromToken), amount, ERC20(toToken), 0);
    }
}
