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
                    gas: 6000000,
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

        this.addExchange = async function(id, address, nonce) {
            try {
                let receipt = await this.trader.methods.addExchangeWrapper(id, address).send({
                    from: this.address,
                    gas: 500000,
                    value: 0,
                    nonce: nonce,
                });
            
                console.log('#####: receipt: ', receipt);
                return ++nonce;
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

            return nonce;
        }

        this.registerCurrency = async function(id, address, nonce) {
            try {
                
                if(nonce < 0)
                {
                    nonce = await this.web3.eth.getTransactionCount(this.address,  "pending");
                }

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
    const base10 = new bigNumber(10);
    var amount = new bigNumber(1000).multipliedBy(base10.exponentiatedBy(18));
    retval = await adder.getAmount(0, 1, amount);
    console.log(retval[1]);
    retval = await adder.getAmount(1, 2, retval[1]);
    console.log(retval[1]);
    retval = await adder.getAmount(2, 3, retval[1]);
    console.log(retval[1]);
    retval = await adder.getAmount(3, 0, retval[1]);
    console.log(retval[1]);
}


swapper = async function() 
{
    const base10 = new bigNumber(10);
    var amount = new bigNumber(1000).multipliedBy(base10.exponentiatedBy(18));
    console.log(amount.toNumber());
    await adder.swapTokens(amount, 0, [1, 5, 1], [2, 0, 1]);
}

let adder = new StaticDataAdder();


registerData = async function() {
    var nonce = await adder.addAllCurrencies();
    nonce = await adder.addExchange(0, "0x0e008924D07bF4A2D709369459a92b3D08576F65", nonce);
    nonce = await adder.addExchange(1, "0x1BA0905cDD46EB0f9Dd9Ea62c396deAFcD45055a", nonce);
    nonce = await adder.addExchange(2, "0x1e66763807Ca2B4afD08cd35EC6b70bA68Ee6704", nonce);
    nonce = await adder.addExchange(3, "0x7876dfbD59eBAE9d42645fc0744E42af6A652c32", nonce);
    nonce = await adder.addExchange(4, "0x23308fAcA48AF3CD4e4Efde257e567d0d3171176", nonce);
    
}

registerData();
//getAmounts();
//swapper();
