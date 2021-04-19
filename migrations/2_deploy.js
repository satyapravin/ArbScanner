var TradingBot = artifacts.require("./TradingBot.sol");
var UniswapV2Wrapper = artifacts.require("./UniswapV2Wrapper.sol");
var Fetcher = artifacts.require("./Fetcher.sol");

module.exports = function(deployer, network, accounts) {
	deployer.deploy(TradingBot, {from: accounts[0], value: "0"});
	deployer.deploy(UniswapV2Wrapper, "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", {from: accounts[0], value: "0"});
	deployer.deploy(Fetcher, {from: accounts[0], value: "0"});
};