const OTP = require('instant-otp');

let start = async (ran) => {
    const otp = new OTP();
    const client = await require('./client')();
    const server = await require('./server.js')(client, otp);
    ran(client, otp);
}

start((client, otp) => {
    module.exports.client = client;
    module.exports.otp = otp;
})
