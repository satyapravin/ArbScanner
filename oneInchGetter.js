const contracts = require('./assets.js')
const axios = require('axios')

class OneInchGetter {
    constructor() {
        this.assets = new contracts.Assets()

        this.getExpectedReturnWithGas = async function(fromToken, toToken, amount) {
            let fromAddress = this.assets.getContractAddress(fromToken)
            let toAddress = this.assets.getContractAddress(toToken);
                
            return new Promise(function(resolve, reject) {
                    axios.get('https://api.1inch.dev/swap/v6.0/1/quote', {
                        headers: {
                            "Authorization": "Bearer EybK3uQzGyvB23wEaxrYSVXne47iMV63"
                        },
                        params: {
                            "src": fromAddress,
                            "dst": toAddress,
                            "amount": amount,
                            "fee":'0',
                        }
                    }).then((response) => {resolve([fromToken, toToken, amount, response.data.dstAmount, 0])}).catch (e => {
                        console.log(fromToken, toToken, amount);
                        console.log("%O", e);
                        resolve([fromToken, toToken, amount, 0.0000000001, 0])
                    });
         
            });
        }
    }
}

module.exports = {OneInchGetter}
