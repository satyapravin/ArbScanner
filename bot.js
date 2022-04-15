require('dotenv').config()
require('console.table')
const scanner = require('./scanner.js')
//const swapper = require('./oneInchSwapper.js')
//const executor = require('./executor.js')

let checkingMarkets = false
let finder = new scanner.Scanner(process.argv[2])
//let trader = new executor.Executor(process.env.RPC_URL, process.env.PRIVATE_KEY)
//trader.registerEvents();
let loanCurrencies = ['ETH', 'BTC', 'DAI', 'USDC', 'FTM']
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
				/*trail = results[maxProfit];
				let inchSwapper = new swapper.OneInchSwapper();
				datas = []
				tvals = []
				let startamount = amounts[trail[0]]
				let amount = startamount
				for(var ii=1; ii < trail.length; ++ii) {
					from = trail[ii-1]
					to = trail[ii]
					data = await inchSwapper.fetchSwapData(from, to, amount)
					datas.push(data.tx.data);
					tvals.push(data.tx.value);
					amount = data.toTokenAmount;
					console.log('transfer value', data.tx.value)
				}
				
				if (amount < startamount) {
					console.log("1inch swapper says swap not profitable", startamount, amount)
				}
				else {
					console.log(amount - startamount);
					await trader.executeSwaps(trail, startamount, datas, tvals);
				}*/
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