//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import './IExchangeWrapper.sol';
import './Withdrawer.sol';
import './UniswapRouter.sol';

contract UniswapV2Wrapper is IExchangeWrapper, Withdrawer {
    address public router;

    constructor(address router_) {
        router = router_;
    }

    function getRate(address fromToken, address toToken, uint256 amount) override external view returns (uint256) {
        address[] memory path = new address[](2);
        path[0] = fromToken;
        path[1] = toToken;
        IUniswapV2Router02 uniRouter = IUniswapV2Router02(router);
        uint[] memory retval = uniRouter.getAmountsOut(amount, path);
        return retval[1];
    }

    function swapTokens(address fromToken, address toToken, uint256 amount, address to) override public payable {
        address[] memory path = new address[](2);
        path[0] = fromToken;
        path[1] = toToken;
        address routingAddress = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
        IUniswapV2Router02 uniRouter = IUniswapV2Router02(routingAddress);
        IERC20 fromERC20 = IERC20(fromToken);
        fromERC20.approve(routingAddress, amount);
        uniRouter.swapExactTokensForTokens(amount, 0, path, to, block.timestamp + 200000);
        fromERC20.approve(routingAddress, 0);
    }
}