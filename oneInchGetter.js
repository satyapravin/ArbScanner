const contracts = require('./assets.js')
const axios = require('axios')

class OneInchGetter {
    constructor() {
        this.assets = new contracts.Assets()
    
        this.getExpectedReturnWithoutGas = async function(fromToken, toToken, amount ) {
            let fromAddress = this.assets.getContractAddress(fromToken)
            let toAddress = this.assets.getContractAddress(toToken);

            return new Promise(function(resolve, reject) {
                try {
                    axios.get('https://api.1inch.exchange/v3.0/1/quote', {
                        params: {
                            fromTokenAddress: fromAddress,
                            toTokenAddress: toAddress,
                            amount: amount,
                        }
                    }).then((response) => resolve([fromToken, toToken, amount, response.data]));
                } catch (e) {
                    console.log(fromToken, toToken, amount);
                    return reject(e);
                }
            });
        }

        this.getExpectedReturnWithGas = async function(fromToken, toToken, amount) {
            let fromAddress = this.assets.getContractAddress(fromToken)
            let toAddress = this.assets.getContractAddress(toToken);
                
            return new Promise(function(resolve, reject) {
                try {
                    axios.get('https://api.1inch.exchange/v3.0/1/quote', {
                        params: {
                            fromTokenAddress: fromAddress,
                            toTokenAddress: toAddress,
                            amount: amount,
                        }
                    }).then((response) => resolve([fromToken, toToken, amount, response.data]));
                } catch (e) {
                    console.log(fromToken, toToken, amount);
                    return reject(e);
                }
            });
        }
    }
}

module.exports = {OneInchGetter}