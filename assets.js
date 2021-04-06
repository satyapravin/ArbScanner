class Assets {
    constructor() {
        
        this.ASSET_ADDRESSES = {
	        USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
	        MKR: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
	        DAI: '0x6b175474e89094c44da98b954eedeac495271d0f',
            TAU: '0xc27a2f05fa577a83ba0fdb4c38443c0718356501',
            WBTC: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
            RDF: '0x255aa6df07540cb5d3d297f0d0d4d84cb52bc8e6',
            YFT: '0x26b3038a7fc10b36c426846a9086ef87328da702',
        }

        this.ASSET_DECIMALS = {
            USDC:6, 
            WETH: 18,
            MKR: 18,
            DAI: 18,
            TAU: 18,
            WBTC: 8,
            RDF: 18,
            YFT: 18,
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