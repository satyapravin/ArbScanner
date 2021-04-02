require('dotenv').config()
require('console.table')
const path = require('path')
const http = require('http')
const cors = require('cors')
const Web3 = require('web3')
const axios = require('axios')
const moment = require('moment-timezone')
const bellman = require('./bellman.js')
const bigNumber = require('./bigNumber.js');


// WEB3 CONFIG
const web3 = new Web3(process.env.RPC_URL)

// ASSET SYMBOLS
const DAI = 'DAI'
const WETH = 'WETH'
const USDC = 'USDC' //6 decimals
const LINK = 'LINK'
const COMP = 'COMP'
const UMA = 'UMA'
const YFI = 'YFI'
const UNI = 'UNI'
const LEND = 'LEND'
const BAND = 'BAND'
const BAL = 'BAL'
const MKR = 'MKR'
const BUSD = 'BUSD'
const OMG = 'OMG'
const TUSD = 'TUSD'
const ZRX = 'ZRX'
const BAT = 'BAT'
const NMR = 'NMR'
const PAX = 'PAX'
const KNC = 'KNC'
const REN = 'REN'
const SNT = 'SNT'
const ENJ = 'ENJ'
const ANT = 'ANT'
const AMPL = 'AMPL'
const REPV2 = 'REPV2'
const KEEP = 'KEEP'
const CRV = 'CRV'
const BNT = 'BNT'
const LPT = 'LPT'
const FOAM = 'FOAM'
const BZRX = 'BZRX'
const DONUT = 'DONUT'
const SNX = 'SNX'
const GNO = 'GNO'
const SUSD = 'SUSD'
const SAI = 'SAI'
const CVL = 'CVL'
const DTH = 'DTH'
const GEN = 'GEN'
const MANA = 'MANA'
const LOOM = 'LOOM'
const SPANK = 'SPANK'
const REQ = 'REQ'
const MATIC = 'MATIC'
const LRC = 'LRC'
const RDN = 'RDN'
const SUSHI = 'SUSHI'


// ASSET ADDRESSES
const ASSET_ADDRESSES = {
	USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' ,//6 decimals
	WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
	WBTC: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
	YFI: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
}

const ASSET_DECIMALS = {
	USDC:6, 
	WETH: 18,
	WBTC: 8,
	YFI: 18,
};

// TRADING FUNCTIONS
async function fetchOneInchExchangeData(args) {
	const {fromToken, toToken, amount} = args;
	return new Promise(function(resolve, reject) {
		try {
			axios.get('https://api.1inch.exchange/v3.0/1/quote', {
				params: {
					fromTokenAddress: fromToken,
					toTokenAddress: toToken,
					amount,
				}
			}).then((response) => resolve(response.data));
		} catch (e) {
			console.log(e);
			console.log(fromToken, toToken, amount);
			return resolve(null);
		}
	});
}

// UTILITIES
const now = () => (moment().tz('Asia/Singapore').format())

// CHECK TO SEE IF ORDER CAN BE ARBITRAGED
const checkedOrders = []
let profitableArbFound = false

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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let checkingMarkets = false
let keys = Object.keys(ASSET_ADDRESSES)
let V = new Array(keys.length).fill(null).map(() => new Array(keys.length).fill(0));
async function checkMarkets() {
	if(checkingMarkets) {
		return
	}

	// Stop checking markets if already found
	if(profitableArbFound) {
		clearInterval(marketChecker)
	}

	console.log(`Fetching market data @ ${now()} ...\n`)
	checkingMarkets = true
	try {
		let G = new Array(keys.length).fill(null).map(() => new Array(keys.length).fill(0));
		let base = new bigNumber.BigNumber(10)
		V[0][0] = totalCapital
		let promises = []
		for (var i=0; i < keys.length; i++) {
			for (var j=0; j < keys.length; j++) {
				if (j !== i) {
					await sleep(1000);
					amount = bigNumber.BigNumber(V[0][0]).multipliedBy(base.exponentiatedBy(ASSET_DECIMALS[keys[i]])).toFixed()
					if(i !== 0) if(V[0][i] > 0) amount = bigNumber.BigNumber(V[0][i]).toFixed()
					p = getRate(ASSET_ADDRESSES[keys[i]], ASSET_ADDRESSES[keys[j]], amount, i, j)
					promises.push(p);
				} else {
					G[i][j] = 0
				}
			}
		}
		
		data = await Promise.allSettled(promises)
		
		data.map((response) => { 
		            let rate = Number(response.value[0])
					let i = response.value[1]
					let j = response.value[2]
					let amount = response.value[3]
					
					if (rate > 0) {
						brate = bigNumber.BigNumber(rate).dividedBy(base.exponentiatedBy(ASSET_DECIMALS[keys[j]]))
						let ret = brate.dividedBy(bigNumber.BigNumber(amount).dividedBy(base.exponentiatedBy(ASSET_DECIMALS[keys[i]]))).toNumber()
						console.log(keys[i], keys[j], 
								bigNumber.BigNumber(amount).dividedBy(base.exponentiatedBy(ASSET_DECIMALS[keys[i]])).toFixed(), 
								ret)
						
						G[i][j] = -Math.log(ret)
						V[i][j] = rate
					}
					else { 
						G[i][j] = Infinity
					}
		});

		result = bellman.bellmanFord(G, 0)
		
		negs = result[0]
		let path = result[1]
		
		for(idx in negs) {
				let ii = negs[idx]
				let rate = bigNumber.BigNumber(1)
				let kk = ii
				let jj = ii
				let reversePath = []
				
				while(!reversePath.includes(kk)) {
					reversePath.push(kk);
					jj = path[kk][ii]
					rate = rate.multipliedBy(Math.exp(-G[jj][kk]))
					kk = jj
				}
				
				rate = rate.multipliedBy(Math.exp(-G[ii][kk]))
				rate = rate.toNumber()
				reversePath = reversePath.reverse();
				let str = keys[ii]
				for (i in reversePath) { str = str + "=>" + keys[reversePath[i]] }
				console.log(str, "capital: ", totalCapital, " profit: ", (rate - 1) * totalCapital);
		}
	} catch (error) {
		console.error(error)                             
		checkingMarkets = false
		return
	}

	checkingMarkets = false
}

// Check markets every n seconds
let totalCapital = 5000
const POLLING_INTERVAL = process.env.POLLING_INTERVAL || 5000 // 10 seconds
const marketChecker = setInterval(async () => { await checkMarkets() }, POLLING_INTERVAL)