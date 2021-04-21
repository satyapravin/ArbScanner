var TradingBot = artifacts.require("./TradingBot.sol");
var UniswapV2Wrapper = artifacts.require("./UniswapV2Wrapper.sol");
var SushiSwapWrapper = artifacts.require("./SushiSwapWrapper.sol");

module.exports = function(deployer, network, accounts) {
	deployer.deploy(TradingBot, {from: accounts[0], value: "0"});
	deployer.deploy(UniswapV2Wrapper, "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", {from: accounts[0], value: "0"});
	deployer.deploy(SushiSwapWrapper, "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F", {from: accounts[0], value: "0"});
};