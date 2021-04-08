const axios = require('axios')
const bigNumber = require('./bigNumber.js')

class zrxGetter {
    constructor() {
    
        this.getExpectedReturnWithGas = async function(fromToken, toToken, amount ) {
            return new Promise(function(resolve, reject) {
                    console.log(amount);
                    axios.get('https://api.0x.org/swap/v1/quote', {
                        params: {
                            sellToken: fromToken,
                            buyToken: toToken,
                            sellAmount: bigNumber.BigNumber(amount).toString(),
                        }
                    }).then((response) => {resolve([fromToken, toToken, amount, response.data.buyAmount]);}).catch (e => {
                    return reject(e);
                });
            });
        }
    }
}

module.exports = {zrxGetter}