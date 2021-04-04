require('dotenv').config()
require('console.table')
const scanner = require('./scanner.js')
const swapper = require('./oneInchSwapper.js')

let checkingMarkets = false
let finder = new scanner.Scanner(5000)
let loanCurrencies = ['DAI', 'WETH', 'USDC']

async function checkMarkets() {
	if(checkingMarkets) {
		return
	}

	checkingMarkets = true

	try 
	{
		let results = {}
		let amounts = {}
		let found = await finder.findArbitrage(results, amounts, loanCurrencies);
		if (found) {
			let maxProfit = Object.keys(results).reduce((a, b) => Number(a) > Number(b) ?  a : b);
			if (maxProfit > 0) {
				console.log("Selected: ", maxProfit, results[maxProfit])
				trail = results[maxProfit];
				let inchSwapper = new swapper.OneInchSwapper();
				datas = []
				let amount = amounts[trail[0]]
				for(var ii=1; ii < trail.length; ++ii) {
					from = trail[ii-1]
					to = trail[ii]
					data = await inchSwapper.fetchSwapData(from, to, amount)
					datas.push(data)
					amount = data.toTokenAmount;
				}
			}
		}
	} catch (error) {
		console.error(error)                             
		checkingMarkets = false
		clearInterval(marketChecker)
		return
	}

	checkingMarkets = false
}

const POLLING_INTERVAL = process.env.POLLING_INTERVAL || 5000 
const marketChecker = setInterval(async() => { await checkMarkets() }, POLLING_INTERVAL)