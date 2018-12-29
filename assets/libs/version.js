'use strict'

class Version {
    constructor(version) {
        this.major = parseInt(version.split(".")[0]) || 0
        this.minor = parseInt(version.split(".")[1]) || 0
        this.patch = parseInt(version.split(".")[2]) || 0
    }
    get versionInt() {
        return this.major * 100 + this.minor * 10 + this.patch
    }
}

function versionCompare(current, check) {
    const vcurrent = new Version(current)
    const vcheck = new Version(check)
    
    if (vcurrent.versionInt < vcheck.versionInt && vcheck.major === vcurrent.major && vcheck.minor === vcurrent.minor) {
        return 2 
    } else if (vcurrent.versionInt < vcheck.versionInt) {
        return 1 
    } else if (vcurrent.versionInt === vcheck.versionInt) {
        return 0
    } else {
        return -1
    }
} 

module.exports = {versionCompare}
