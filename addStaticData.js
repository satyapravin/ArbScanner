require('dotenv').config();
const Web3 = require('web3')
const contracts = require('./assets.js')
const fs = require('fs');
const bigNumber  = require('./bigNumber.js');
const { sleep } = require('./utils.js');

class StaticDataAdder {
    constructor() {
        this.web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.RPC_URL));
        this.assets = new contracts.Assets()
        this.web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY);
        this.contract = JSON.parse(fs.readFileSync('./build/contracts/TradingBot.json', 'utf8'))
        this.trader = new this.web3.eth.Contract(this.contract.abi, process.env.CONTRACT_ADDRESS);
        this.address = process.env.ADDRESS;

        this.registerEvents = function() {
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

        this.swapTokens = async function(amount, firstToken, nextTokens, exchanges) {
            try {
                
                let receipt = await this.trader.methods.getFlashloan(amount, firstToken, nextTokens, exchanges).send({
                    from: this.address,
                    gas: 500000,
                    value: 0,
                });
            
                console.log('#####: receipt: ', receipt);
            }
            catch(error) {
                throw error;
            }
        }

        this.getAmount = async function(from, to, amount) {
            try {
                var retval = await this.trader.methods.getRate(from, to, amount).call();
                return retval;
            }
            catch(error) {
                throw error;
            }
        }

        this.addExchange = async function(id, address) {
            try {
                
                let receipt = await this.trader.methods.addExchangeWrapper(id, address).send({
                    from: this.address,
                    gas: 500000,
                    value: 0,
                });
            
                console.log('#####: receipt: ', receipt);
            }
            catch(error) {
                throw error;
            }
        }

        this.addAllCurrencies = async function() {
            var symbols = this.assets.getSymbols();
            var nonce = await this.web3.eth.getTransactionCount(this.address,  "pending");

            for(var ii=0; ii < symbols.length; ++ii) {
                var address = this.assets.getContractAddress(symbols[ii]);
                console.log(ii, symbols[ii]);
                this.registerCurrency(ii, address, nonce);
                sleep(1000);
                nonce++;
            }
        }

        this.registerCurrency = async function(id, address, nonce) {
            try {
                
                let receipt = await this.trader.methods.addCurrency(id, address).send({
                    from: this.address,
                    gas: 500000,
                    value: 0,
                    nonce: nonce,
                });
            
                console.log('#####: receipt: ', receipt);
            }
            catch(error) {
                throw error;
            } 
        }
    }
}


getAmounts = async function() {
    retval = await adder.getAmount(1, 4, 1000000000);
    console.log(retval[1]);
    retval = await adder.getAmount(4, 1, retval[1]);
    console.log(retval[1]);
}


swapper = async function() 
{
    const base10 = new bigNumber(10);
    var amount = new bigNumber(1000).multipliedBy(base10.exponentiatedBy(6));
    console.log(amount.toNumber());
    await adder.swapTokens(amount, 1, [4, 1], [0, 0]);
}

let adder = new StaticDataAdder();
//adder.addAllCurrencies();
//adder.addExchange(0, "0x0e008924D07bF4A2D709369459a92b3D08576F65");

//getAmounts();

swapper();
