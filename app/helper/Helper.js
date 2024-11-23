const os = require('os');

const getServerIp = () => {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
        for (const netInfo of networkInterfaces[interfaceName]) {
            // Get the first non-internal IPv4 address
            if (netInfo.family === 'IPv4' && !netInfo.internal) {
                return netInfo.address;
            }
        }
    }
    return 'localhost'; // Fallback in case no IP is found
};


module.exports = {
    getServerIp
}