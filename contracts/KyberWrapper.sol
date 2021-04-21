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

////////////////////////////////////////////////////////////////////////////////////////////////////////
/// @title Kyber Network proxy for main contract
abstract contract KyberNetworkProxy {
    /// @dev makes a trade between src and dest token and send dest tokens to msg sender
    /// @param src Src token
    /// @param srcAmount amount of src tokens
    /// @param dest Destination token
    /// @param minConversionRate The minimal conversion rate. If actual rate is lower, trade is canceled.
    /// @return amount of actual dest tokens
    function swapTokenToToken(ERC20 src, uint srcAmount, ERC20 dest, uint minConversionRate) public virtual returns(uint);
    function getExpectedRate(ERC20 src, ERC20 dest, uint srcQty) public virtual view returns(uint expectedRate, uint slippageRate);   
}

contract KyberWrapper is IExchangeWrapper, Withdrawer {

    constructor() {
    }

    function getRate(address fromToken, address toToken, uint256 amount) override external view returns (uint256) {

        address kyberRegistryAddress = 0x818E6FECD516Ecc3849DAf6845e3EC868087B755;
        KyberNetworkProxy kyber = KyberNetworkProxy(kyberRegistryAddress);
        (uint expectedRate, )  = kyber.getExpectedRate(ERC20(fromToken), ERC20(toToken), amount);
        return expectedRate;
    }

    function swapTokens(address fromToken, address toToken, uint256 amount, address to) override public payable {
        address kyberRegistryAddress = 0x818E6FECD516Ecc3849DAf6845e3EC868087B755;
        KyberNetworkProxy kyber = KyberNetworkProxy(kyberRegistryAddress);
        
        IERC20 fromERC20 = IERC20(fromToken);
        fromERC20.approve(kyberRegistryAddress, amount);

        kyber.swapTokenToToken(ERC20(fromToken), amount, ERC20(toToken), 0);
    }
}
