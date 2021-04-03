const moment = require('moment-timezone')

class Utils {
    static sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
    }

    static array2D(N, v) {
        return new Array(N).fill(null).map(() => new Array(N).fill(v));
    }
    
    static now() {
        return moment().tz('Asia/Singapore').format();
    }
}

module.exports = Utils