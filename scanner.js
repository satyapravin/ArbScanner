const bellman = require('./bellman.js')
const bigNumber = require('./bigNumber.js')
const getter = require('./oneInchGetter.js')
const utils = require('./utils.js')
const contracts = require('./assets.js')
const { sleep } = require('./utils.js')

class Scanner {
    constructor(totalCapital) {
        this.calibration = 0
        this.assets = new contracts.Assets()
        this.keys = this.assets.getSymbols()
        this.V = utils.array2D(this.keys.length, 0)
        this.capital = totalCapital
        this.base10 = new bigNumber.BigNumber(10)
        this.aggregator = new getter.OneInchGetter();
    }

    async findArbitrage(resultPath, amounts, loanCurrencies) {
        console.log(`Fetching market data @ ${utils.now()} ...\n`)
        let G = utils.array2D(this.keys.length, 0);
        if (this.V[0][0] == 0)
        {
            this.V[0][0] = 1
        } else {
            this.V[0][0] = this.capital
        }

        let promises = []
        for (var i=0; i < this.keys.length; i++) {
            for (var j=0; j < this.keys.length; j++) {
                if (j !== i) {
                    await utils.sleep(1200);
                    let from = this.keys[i];
                    let to = this.keys[j];
                    let amount = bigNumber.BigNumber(this.V[0][0]).multipliedBy(
                                         this.base10.exponentiatedBy(this.assets.getDecimals(from))).toFixed()
                    if(i !== 0) {
                        if(this.V[0][i] > 0) {
                            amount = bigNumber.BigNumber(this.V[0][i]).multipliedBy(
                                         this.base10.exponentiatedBy(this.assets.getDecimals(from))).toFixed()
                        }
                    }
                    
                    amounts[from] = amount;
                    let p = this.aggregator.getExpectedReturnWithGas(from, to, amount);
                    promises.push(p);
                } else {
                    G[i][j] = 0
                }
            }
        }
        
        let data = await Promise.allSettled(promises)
        
        data.map((response) => {
            let i = this.keys.indexOf(response.value[0])
            let j = this.keys.indexOf(response.value[1]) 
            let amount = Number(response.value[2])
            let rate = Number(response.value[3])
            let gas = response.value[4]
            let from = this.keys[i];
            let to = this.keys[j];
            
            if (rate > 0) {
                let brate = bigNumber.BigNumber(rate).dividedBy(this.base10.exponentiatedBy(this.assets.getDecimals(to)));
                let bamount = bigNumber.BigNumber(amount).dividedBy(this.base10.exponentiatedBy(this.assets.getDecimals(from)))
                let ret = brate.dividedBy(bamount).toNumber()
                console.log(from, to, bamount.toNumber(), brate.toFixed(), gas);
                
                G[i][j] = -Math.log(ret)

                if (i == 0) {
                    this.V[0][j] = brate
                }
            }
            else { 
                G[i][j] = Infinity
            }
        });
        
        if (this.calibration < 2) { this.calibration += 1; console.log("Model calibrating....."); return false }
        
        let currIdx = []
        for(var curr in loanCurrencies) {
            currIdx.push(this.keys.indexOf(loanCurrencies[curr]))
        }

        let result = bellman.bellmanFord(G, currIdx)
        
        if (!result[0]) 
        {
            console.log('Zero arb found');
            return false;
        }
        
        let cycle = result[1]
        let rate = result[2]

        let symbols = []

        for(var i = 0; i < cycle.length; ++i) {
            symbols.push(this.keys[cycle[i]])
        }

        let profit = (Math.exp(-rate) - 1) * this.capital
        resultPath[profit] = symbols
        console.log(symbols.join("=>"), "capital: ", this.capital, " profit: ", profit);
        return true;
    }
}

module.exports = {Scanner}
