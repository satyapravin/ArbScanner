class Assets {
    constructor() {
        
        this.ASSET_ADDRESSES = {
            FTM	:	"0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"	,
            AAVE	:	"0x6a07a792ab2965c72a5b8088d3a069a7ac3a993b"	,
            BNB	:	"0xd67de0e0a0fd7b15dc8348bb9be742f3c5850454"	,
            BTC	:	"0x321162cd933e2be498cd2267a90534a804051b11"	,
            DAI	:	"0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e"	,
            ETH	:	"0x74b23882a30290451a17c44f4f05243b6b58c76d"	,
            fUSDT	:	"0x049d68029688eabf473097a2fc38ef61633a3c7a"	,
            LINK	:	"0xb3654dc3d10ea7645f8319668e8f54d2574fbdc8"	,
            SUSHI	:	"0xae75a438b2e0cb8bb01ec1e1e376de11d44477cc"	,
            USDC	:	"0x04068da6c83afcfa0e13ba15a6696662335d5b75"	,
            WOO	:	"0x6626c47c00f1d87902fc13eecfac3ed06d5e8d8a"	,
        }

        this.ASSET_DECIMALS = {
            FTM	:	18	,
            AAVE	:	18	,
            BNB	:	18	,
            BTC	:	8	,
            DAI	:	18	,
            ETH	:	18	,
            fUSDT	:	6	,
            LINK	:	18	,
            SUSHI	:	18	,
            USDC	:	6	,
            WOO	:	18	,
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