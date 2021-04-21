var TradingBot = artifacts.require("./TradingBot.sol");
var UniswapV2Wrapper = artifacts.require("./UniswapV2Wrapper.sol");
var SushiSwapWrapper = artifacts.require("./SushiSwapWrapper.sol");

module.exports = function(deployer, network, accounts) {
	deployer.deploy(TradingBot, {from: accounts[0], value: "0"});
	deployer.deploy(UniswapV2Wrapper, {from: accounts[0], value: "0"});
	deployer.deploy(SushiSwapWrapper, {from: accounts[0], value: "0"});
};