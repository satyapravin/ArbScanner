require('dotenv').config()
require('console.table')
const path = require('path')
const scanner = require('./scanner.js')


async function getRate(one, two, amount, i, j) {
	
	return new Promise(function(resolve, reject) {
		// Fetch 1inch.exchange Data
		const oneInchExchangeData = fetchOneInchExchangeData({
			fromToken: one,
			toToken: two,
			amount: amount
		}).then(function(oneInchExchangeData) {

		if (oneInchExchangeData) {
			resolve([oneInchExchangeData.toTokenAmount, i, j, amount]);
		} 
		else {
			resolve([Infinity, i, j, amount]);
	}});
});
}


let profitableArbFound = false
let checkingMarkets = false
let finder = new scanner.Scanner(5000)

async function checkMarkets() {
	if(checkingMarkets) {
		return
	}

	if(profitableArbFound) {
		clearInterval(marketChecker)
	}

	checkingMarkets = true

	try 
	{
		let results = {}
		let found = await finder.findArbitrage(results);
		if (found) {
			let maxProfit = Object.keys(results).reduce((a, b) => results[a] > results[b] ? a : b);
			if (maxProfit > 0) {
				console.log("Selected: ", results[maxProfit])
			}
		}
	} catch (error) {
		console.error(error)                             
		checkingMarkets = false
		return
	}

	checkingMarkets = false
}

const POLLING_INTERVAL = process.env.POLLING_INTERVAL || 5000 
const marketChecker = setInterval(async() => { await checkMarkets() }, POLLING_INTERVAL)