class Assets {
    constructor() {
        
        this.ASSET_ADDRESSES = {
	        USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
	        MKR: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
	        DAI: '0x6b175474e89094c44da98b954eedeac495271d0f',
            WBTC: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
            sBNB: '0x617aecb6137b5108d1e7d4918e3725c8cebdb848',
        }

        this.ASSET_DECIMALS = {
            USDC:6, 
            WETH: 18,
            MKR: 18,
            DAI: 18,
            WBTC: 8,
            sBNB: 18,
        };

        this.keys = Object.keys(this.ASSET_ADDRESSES);

        this.getSymbols = function() {
            return this.keys
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