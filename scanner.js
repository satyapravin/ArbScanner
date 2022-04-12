const bellman = require('./bellman.js')
const bigNumber = require('./bigNumber.js')
const getter = require('./zrxGetter.js')
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
        this.aggregator = new getter.zrxGetter();
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
                    await utils.sleep(800);
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
            let amount = Number(response.value[2]);
            let rate = response.value[3];
            let from = this.keys[i];
            let to = this.keys[j];
            
            if (rate > 0) {
                let brate = bigNumber.BigNumber(rate).dividedBy(this.base10.exponentiatedBy(this.assets.getDecimals(to)));
                let bamount = bigNumber.BigNumber(amount).dividedBy(this.base10.exponentiatedBy(this.assets.getDecimals(from)))
                let ret = brate.dividedBy(bamount).toNumber()
                console.log(from, to, bamount.toNumber(), brate.toFixed());
                
                G[i][j] = -Math.log(ret);

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
        else {
            console.log(result)
        }
        
        let retPaths = result[1]


        let cycles = {}
        
        let cyc_cnt = 0
        for(var key in retPaths) {
            var path = retPaths[key].reverse()
            cycles[cyc_cnt] = [parseInt(key)]

            for(var idx = 0; idx < path.length; ++idx) {
                if (path[idx] >= 0) {
                    if (cycles[cyc_cnt].includes(path[idx])) continue;
                    cycles[cyc_cnt].push(path[idx])
                }
            }
            cycles[cyc_cnt].push(parseInt(key))
            cyc_cnt = cyc_cnt + 1
        }

        for(var cycle in cycles) {
            let rate = bigNumber.BigNumber(1)
            let symbols = []
            let reversePath = cycles[cycle]
            console.log(reversePath)
            symbols.push(this.keys[reversePath[0]])

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