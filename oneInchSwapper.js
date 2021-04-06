require('dotenv').config()
const contracts = require('./assets.js')
const axios = require('axios')
class OneInchSwapper {

    constructor() {
        this.assets = new contracts.Assets()

        this.fetchSwapData = async function(from, to, amount) {
            try {
                let fromAddress = this.assets.getContractAddress(from)
                let toAddress = this.assets.getContractAddress(to)
                let myAddress = process.env.CONTRACT_ADDRESS
                const res = await axios.get('https://api.1inch.exchange/v3.0/1/swap', {
                    params: {
                        fromTokenAddress: fromAddress,
                        toTokenAddress: toAddress,
                        fromAddress: myAddress,
                        amount: amount,
                        slippage: 0,
                        disableEstimate: true,
                    }
                });
                
                return res.data
            } catch (e) {
                console.log(e);
                return null;
            }
        }
    }
}

module.exports = {OneInchSwapper}