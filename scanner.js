const bellman = require('./bellman.js')
const bigNumber = require('./bigNumber.js')
const oneInch = require('./oneInchGetter.js')
const utils = require('./utils.js')
const contracts = require('./assets.js')

class Scanner {
    constructor(totalCapital) {
        this.calibration = true
        this.assets = new contracts.Assets()
        this.keys = this.assets.getSymbols()
        this.V = utils.array2D(this.keys.length, 0)
        this.capital = totalCapital
        this.base10 = new bigNumber.BigNumber(10)
        this.aggregator = new oneInch.OneInchGetter()
    }

    async findArbitrage(resultPath, amounts, loanCurrencies) {
        console.log(`Fetching market data @ ${utils.now()} ...\n`)
        let G = utils.array2D(this.keys.length, 0);
        this.V[0][0] = this.capital
        let promises = []
        for (var i=0; i < this.keys.length; i++) {
            for (var j=0; j < this.keys.length; j++) {
                if (j !== i) {
                    await utils.sleep(1000);
                    let from = this.keys[i];
                    let to = this.keys[j];
                    let amount = bigNumber.BigNumber(this.V[0][0]).multipliedBy(
                                         this.base10.exponentiatedBy(this.assets.getDecimals(from))).toFixed()
                    if(i !== 0) if(this.V[0][i] > 0) amount = bigNumber.BigNumber(this.V[0][i]).toFixed()
                    if (!amounts.hasOwnProperty(from)) amounts[from] = amount;
                    let p = this.aggregator.getExpectedReturnWithoutGas(from, to, amount)
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
            let rate = response.value[3].toTokenAmount
            let from = this.keys[i];
            let to = this.keys[j];
            
            if (rate > 0) {
                let brate = bigNumber.BigNumber(rate).dividedBy(this.base10.exponentiatedBy(this.assets.getDecimals(to)));
                let ret = brate.dividedBy(bigNumber.BigNumber(amount).dividedBy(
                                            this.base10.exponentiatedBy(this.assets.getDecimals(from)))).toNumber()
                console.log(from, to, 
                        bigNumber.BigNumber(amount).dividedBy(
                                           this.base10.exponentiatedBy(this.assets.getDecimals(from))).toFixed(), ret);
                
                G[i][j] = -Math.log(ret)
                this.V[i][j] = rate
            }
            else { 
                G[i][j] = Infinity
            }
        });
        
        if (this.calibration) { this.calibration = false; console.log("Model calibrating....."); return false }
        
        let currIdx = []
        for(var curr in loanCurrencies) {
            currIdx.push(this.keys.indexOf(loanCurrencies[curr]))
        }
        console.log(currIdx)
        let result = bellman.bellmanFord(G, currIdx)
        
        if (!result[0]) 
        {
            console.log('Zero arb found');
            return false;
        }
        
        let path = result[1]
        console.log(path)
        let cycles = {}

        for(var idx = 0; idx < path.length; ++idx) {
            if (cycles.hasOwnProperty(idx)) continue;
            let visited = []
            let jj = idx;
            while(!visited.includes(jj)) {
                visited.push(jj)
                jj = path[jj]
                if (jj < 0) break;
            }

            if (jj > 0 && !cycles.hasOwnProperty(jj)) {
                visited.push(jj);
                while(visited[0] !== jj) visited.shift()
                
                if (!currIdx.includes(jj)) {
                    visited.unshift(currIdx[0])
                    visited.push(currIdx[0])
                }

                cycles[jj] = visited
            }            
        }

        for(var cycle in cycles) {
            let rate = bigNumber.BigNumber(1)
            let symbols = []
            let reversePath = cycles[cycle]
            symbols.push(this.keys[reversePath[0]])
            console.log(reversePath)
            for(var i = 1; i < reversePath.length; ++i) {
                rate = rate.multipliedBy(Math.exp(-G[reversePath[i-1]][reversePath[i]]))
                symbols.push(this.keys[reversePath[i]])
            }

            let profit = (rate.toNumber() - 1) * this.capital
            resultPath[profit] = symbols
            console.log(symbols.join("=>"), "capital: ", this.capital, " profit: ", profit);
        }

        return true;
    }
}

module.exports = {Scanner}