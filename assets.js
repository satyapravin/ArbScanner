class Assets {
    constructor() {
        
        this.ASSET_ADDRESSES = {
	        DAI: '0x6b175474e89094c44da98b954eedeac495271d0f',
            USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            //WBTC: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
            COMP: '0xc00e94cb662c3520282e6f5717214004a7f26888',
        }

        this.ASSET_DECIMALS = {
            DAI: 18,
            USDC:6, 
            WETH: 18,
            //WBTC: 8,
            COMP: 18,
        };

        this.keys = Object.keys(this.ASSET_ADDRESSES);

        this.getSymbols = function() {
            return this.keys
        }

        this.getIndex = function(symbol) {
            return this.keys.indexOf(symbol);
        }

        this.getContractAddress = function(symbol) {
            return this.ASSET_ADDRESSES[symbol];
        }

        this.getDecimals = function(symbol) {
            return this.ASSET_DECIMALS[symbol];
        }
    }
}

module.exports = {Assets}