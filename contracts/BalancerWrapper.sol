//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import './IExchangeWrapper.sol';
import './Withdrawer.sol';

interface TokenInterface {
    function balanceOf(address) external view returns (uint);
    function allowance(address, address) external view returns (uint);
    function approve(address, uint) external returns (bool);
    function transfer(address, uint) external returns (bool);
    function transferFrom(address, address, uint) external returns (bool);
    function deposit() external payable;
    function withdraw(uint) external;
}

abstract contract BRegistry {
    function getBestPoolsWithLimit(address fromToken, address destToken, uint256 limit)
                                                public virtual view returns(address[] memory pools);
}
abstract contract ExchangeProxy {

    struct Swap {
        address pool;
        address tokenIn;
        address tokenOut;
        uint    swapAmount; // tokenInAmount / tokenOutAmount
        uint    limitReturnAmount; // minAmountOut / maxAmountIn
        uint    maxPrice;
    }

    function smartSwapExactIn(TokenInterface tokenIn,
                              TokenInterface tokenOut,
                              uint totalAmountIn,
                              uint minTotalAmountOut,
                              uint nPools
                            ) public virtual payable returns (uint totalAmountOut);

    function viewSplitExactIn(address tokenIn,
                              address tokenOut,
                              uint swapAmount,
                              uint nPools
                            ) public virtual view returns (Swap[] memory swaps, uint totalOutput);
}

contract BalancerWrapper is IExchangeWrapper, Withdrawer {

    constructor() {
    }

    function getRate(address fromToken, address toToken, uint256 amount) override external view returns (uint256) {
        address registryAddress = 0x7226DaaF09B3972320Db05f5aB81FF38417Dd687;
        BRegistry registry = BRegistry(registryAddress);
        address[] memory pools = registry.getBestPoolsWithLimit(fromToken, toToken, 1);
        if (pools.length == 0) return 0;
        address balancerAddress = 0x3E66B66Fd1d0b02fDa6C811Da9E0547970DB2f21;
        ExchangeProxy proxy = ExchangeProxy(balancerAddress);
        (ExchangeProxy.Swap[] memory swaps, uint256 retval) = proxy.viewSplitExactIn(fromToken, toToken, amount, 3);
        return retval;
    }

    function swapTokens(address fromToken, address toToken, uint256 amount, address to) override public payable {
        address balancerAddress = 0x3E66B66Fd1d0b02fDa6C811Da9E0547970DB2f21;
        IERC20 fromERC20 = IERC20(fromToken);
        fromERC20.approve(balancerAddress, amount);
        ExchangeProxy proxy = ExchangeProxy(balancerAddress);
        proxy.smartSwapExactIn(TokenInterface(fromToken), TokenInterface(toToken), amount, 0, 3);
        fromERC20.approve(balancerAddress, 0);
    }
}