require('dotenv').config()
require('console.table')
const scanner = require('./scanner.js')


let checkingMarkets = false
let finder = new scanner.Scanner(process.argv[2])
let loanCurrencies = ['ETH']
let amounts = {}

async function checkMarkets() {
	if(checkingMarkets) {
		return
	}

	checkingMarkets = true

	try 
	{
		let results = {}
		let found = await finder.findArbitrage(results, amounts, loanCurrencies);
		if (found) {
			let maxProfit = Object.keys(results).reduce((a, b) => Number(a) > Number(b) ?  a : b);
			if (maxProfit > 0 && results[maxProfit].length < 6) {
				console.log("Selected: ", maxProfit, results[maxProfit])
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
