//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import './IExchangeWrapper.sol';
import './Withdrawer.sol';
import './UniswapRouter.sol';


contract SushiSwapWrapper is IExchangeWrapper, Withdrawer {
    address public router;

    constructor(address router_) {
        router = router_;
    }

    function getRate(address fromToken, address toToken, uint256 amount) override external view returns (uint256) {
        IUniswapV2Router02 uniRouter = IUniswapV2Router02(router);
        address weth = uniRouter.WETH();

        if (fromToken == weth || toToken == weth) {
            address[] memory path = new address[](2);
            path[0] = fromToken;
            path[1] = toToken;
            uint[] memory retval = uniRouter.getAmountsOut(amount, path);
            return retval[1];
        }
        else {
            address[] memory path = new address[](3);
            path[0] = fromToken;
            path[1] = uniRouter.WETH();
            path[2] = toToken;
            uint[] memory retval = uniRouter.getAmountsOut(amount, path);
            return retval[2];
        }
    }

    function swapTokens(address fromToken, address toToken, uint256 amount, address to) override public payable {
        address routingAddress = 0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F;
        IUniswapV2Router02 uniRouter = IUniswapV2Router02(routingAddress);
        IERC20 fromERC20 = IERC20(fromToken);

        address[] memory path = new address[](2);
        path[0] = fromToken;
        path[1] = uniRouter.WETH();
        fromERC20.approve(routingAddress, amount);
        uint256[] memory retval = uniRouter.swapExactTokensForETH(amount, 0, path, to, block.timestamp + 200000);
        fromERC20.approve(routingAddress, 0);
        path[0] = uniRouter.WETH();
        path[1] = toToken;
        IERC20 toERC20 = IERC20(path[0]);
        toERC20.approve(routingAddress, retval[1]);
        uniRouter.swapExactETHForTokens{value: retval[1]}(0, path, to, block.timestamp + 200000);
        toERC20.approve(routingAddress, 0);
    }
}