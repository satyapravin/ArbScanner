class Assets {

    constructor() {
        this.ASSET_ADDRESSES = {
                ETH:  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
		AEVO: "0xB528edBef013aff855ac3c50b381f253aF13b997",
		MEME: "0xb131f4A55907B10d1F0A50d8ab8FA09EC342cd74",
                ONDO: "0xfAbA6f8e4a5E8Ab82F62fe7C39859FA577269BE3",
                USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        }

        this.ASSET_DECIMALS = {
            ETH	:	18	,
            AEVO:	18	,
            MEME:       18      ,
            ONDO:       18      ,
            USDC:        6      ,
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
