const Web3 = require('web3')
const web3Abi = require('web3-eth-abi');
const contracts = require('./assets.js')
const fs = require('fs');

class Executor {
    constructor(url, key) {
        this.web3 = new Web3(new Web3.providers.WebsocketProvider(url));
        this.assets = new contracts.Assets()
        this.web3.eth.accounts.wallet.add(key)
        this.contract = JSON.parse(fs.readFileSync('./build/contracts/TradingBot.json', 'utf8'))
        this.trader = new this.web3.eth.Contract(this.contract.abi, process.env.CONTRACT_ADDRESS);
        this.address = process.env.ADDRESS;
        

        this.registerEvents = function() {
            this.trader.events.StartBalance().on('data', function(event) {
                console.log("###: StartBalance:", event.returnValues)
            }).on('error', console.error);
        
            this.trader.events.EndBalance().on('data', function(event) {
                console.log("###: EndBalance:", event.returnValues)
            }).on('error', console.error);
        
            
            this.trader.events.FlashTokenBeforeBalance().on('data', function(event) {
                console.log("###: FlashTokenBeforeBalance:", event.returnValues)
            }).on('error', console.error);
        
            this.trader.events.FlashTokenAfterBalance().on('data', function(event) {
                console.log("###: FlashTokenAfterBalance:", event.returnValues)
            }).on('error', console.error);
        }

        this.executeSwaps = async function(tokens, amount, datas) {
            let dataArgs = []

            for (var i = 0; i < 4; ++i) {
                dataArgs[i] = web3Abi.encodeParameters(['address', 'bytes'], 
                                                        ['0x0000000000000000000000000000000000000000', '0x01']);
            }

            for(var i = 0; i < datas.length; ++i) {
                let tokenAddr = this.assets.getContractAddress(tokens[i]);
                dataArgs[i] = web3Abi.encodeParameters(['address', 'bytes'], 
                                                        [tokenAddr, datas[i]]);
            }
            
            try {
                let receipt = await this.trader.methods.getFlashloan(
                    amount, dataArgs[0], dataArgs[1], dataArgs[2], dataArgs[3]
                ).send({
                    from: this.address,
                    gas: 6721974,
                    value: 0,
                });
            
                console.log('#####: receipt: ', receipt);
            }
            catch(error) {
                throw error;
            }            
        }
    }
}



module.exports = {Executor}