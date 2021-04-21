//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import './IExchangeWrapper.sol';
import './Withdrawer.sol';
import './UniswapRouter.sol';
import './UniswapV2Factory.sol';

contract UniswapV2Wrapper is IExchangeWrapper, Withdrawer {
    constructor() {
    }

    function getRate(address fromToken, address toToken, uint256 amount) override external view returns (uint256) {
        address factoryAddress = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
        address routingAddress = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D; 
        IUniswapV2Router02 uniRouter = IUniswapV2Router02(routingAddress);
        IUniswapV2Factory factory = IUniswapV2Factory(factoryAddress);
        address pair = factory.getPair(fromToken, toToken);

        if (pair == address(0)) {

            pair = factory.getPair(fromToken, uniRouter.WETH());
            if(pair == address(0)) return 0;
            
            pair = factory.getPair(toToken, uniRouter.WETH());
            if(pair == address(0)) return 0;

            address[] memory path = new address[](3);
            path[0] = fromToken;
            path[1] = uniRouter.WETH();
            path[2] = toToken;
            uint[] memory retval = uniRouter.getAmountsOut(amount, path);
            return retval[2];
        }
        else {
            address[] memory path = new address[](2);
            path[0] = fromToken;
            path[1] = toToken;
            uint[] memory retval = uniRouter.getAmountsOut(amount, path);
            return retval[1];
        }        
    }

    function swapTokens(address fromToken, address toToken, uint256 amount, address to) override public payable {
       address routingAddress = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
        IUniswapV2Router02 uniRouter = IUniswapV2Router02(routingAddress);
        address factoryAddress = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
        IUniswapV2Factory factory = IUniswapV2Factory(factoryAddress);
        address pair = factory.getPair(fromToken, toToken);
        IERC20 fromERC20 = IERC20(fromToken);
        fromERC20.approve(routingAddress, amount);
        
        if (pair == address(0)) {
            address[] memory path = new address[](3);
            path[0] = fromToken;
            path[1] = uniRouter.WETH();
            path[2] = toToken;
            uniRouter.swapExactTokensForTokens(amount, 0, path, to, block.timestamp + 200000);
        } else {
           address[] memory path = new address[](2);
            path[0] = fromToken;
            path[1] = toToken;
            uniRouter.swapExactTokensForTokens(amount, 0, path, to, block.timestamp + 200000);
        }
    }
}