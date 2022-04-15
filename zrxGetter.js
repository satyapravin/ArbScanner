const axios = require('axios')
const bigNumber = require('./bigNumber.js')

class zrxGetter {
    constructor() {
    
        this.getExpectedReturnWithGas = async function(fromToken, toToken, amount ) {
            return new Promise(function(resolve, reject) {
                    axios.get('https://polygon.api.0x.org/swap/v1/price', {
                        params: {
                            sellToken: fromToken,
                            buyToken: toToken,
                            sellAmount: bigNumber.BigNumber(amount).toString(10),
                            //slippagePercentage: 0.0001
                        }
                    }).then((response) => {resolve([fromToken, toToken, amount, response.data.buyAmount, response.data.estimatedGas]);}).catch (e => {
                        //console.log(e)
                        resolve([fromToken, toToken, amount, 0.0000000001, 0])
                        //return reject(e);
                });
            });
        }
    }
}

module.exports = {zrxGetter}