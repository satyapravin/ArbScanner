var TradingBot = artifacts.require("./TradingBot.sol");
//var AggregationRouterV3 = artifacts.require("./AggregationRouterV3.sol");
module.exports = function(deployer, network, accounts) {
	deployer.deploy(TradingBot, {from: accounts[0], value: "50000000000000000"});
	//deployer.deploy(AggregationRouterV3, {from: accounts[0], value: "0"});
};