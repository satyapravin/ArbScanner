class Assets {
    constructor() {
        
        this.ASSET_ADDRESSES = {
	        //DAI: '0x6b175474e89094c44da98b954eedeac495271d0f',
            //USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            //MKR: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            WBTC: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
            //COMP: '0xc00e94cb662c3520282e6f5717214004a7f26888',
            //BNT: '0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c',
            //BAT: '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
            //LINK: '0x514910771af9ca656af840dff83e8264ecf986ca',
            //YFI: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
            AAVE: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
            //ANT: '0xa117000000f279d81a1d3cc75430faa017fa5a2e',
            BAL: '0xba100000625a3754423978a60c9317c58a424e3d',
            /*BAND: '0xba11d00c5f74255f56a5e366f4f77f5a186d7f55',
            INCH: '0x111111111117dc0aa78b770fa6a738034120c302',
            CRV: '0xD533a949740bb3306d119CC777fa900bA034cd52',
            CVC: '0x41e5560054824ea6b0732e656e3ad64e20e94e45',
            DNT: '',
            ENJ: '',
            GNO: '',
            GRT: '',
            GUSD: '',
            KEEP: '',
            KNC: '',
            LOOM: '',
            LRC: '',
            MANA: '',
            MLN: '',
            NMR: '',
            NU: '',
            OXT: '',
            PAXG: '',
            REN: '',
            REP: '',
            REP2: '',
            SAND: '',
            SKL: '',
            SNX: '',
            USDT: '',
            ZRX: '',
            STORJ: '',
            TBTC: '',
            UMA: '',
            UNI: '',*/
        }

        this.ASSET_DECIMALS = {
            //DAI: 18,
            //USDT:6,
            USDC:6, 
            WETH: 18,
            //MKR: 18,
            WBTC: 8,
            //COMP: 18,
            //BNT: 18,
            //BAT: 18,
            //LINK: 18,
            //YFI: 18,
            AAVE: 18,
            //ANT: 18,
            BAL: 18,
            /*BAND: 18,
            INCH: 18,
            CRV: 18,
            CVC: 18,
            DNT: '',
            ENJ: '',
            GNO: '',
            GRT: '',
            GUSD: '',
            KEEP: '',
            KNC: '',
            LOOM: '',
            LRC: '',
            MANA: '',
            MLN: '',
            NMR: '',
            NU: '',
            OXT: '',
            PAXG: '',
            REN: '',
            REP: '',
            REP2: '',
            SAND: '',
            SKL: '',
            SNX: '',
            USDT: '',
            YFI: '',
            ZRX: '',
            STORJ: '',
            TBTC: '',
            UMA: '',
            UNI: '',*/
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