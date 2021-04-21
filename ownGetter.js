require('dotenv').config()
const contracts = require('./assets.js')
const fs = require('fs');
const Web3 = require('web3');

class OwnGetter {
    constructor() {
        this.assets = new contracts.Assets();
        this.web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.RPC_URL));
        this.contract = JSON.parse(fs.readFileSync('./build/contracts/TradingBot.json', 'utf8'))
        this.trader = new this.web3.eth.Contract(this.contract.abi, process.env.CONTRACT_ADDRESS);

        this.getExpectedReturn = async function(fromToken, toToken, amount ) {
            let fromIndex = this.assets.getIndex(fromToken)
            let toIndex = this.assets.getIndex(toToken);
            let obj = this;
            return new Promise(function(resolve, reject) {
                    obj.trader.methods.getRate(fromIndex, toIndex, amount).call()
                    .then((response) => { console.log(response); resolve([fromToken, toToken, amount, response])}).catch (e => {
                    console.log(fromIndex, toIndex, amount);
                    console.log(e);
                    return reject(e);
                });
            });
        }
    }
}

module.exports = {OwnGetter}