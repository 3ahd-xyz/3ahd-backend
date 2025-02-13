const OTP = require("instant-otp");
const Client = require("./client.js");
const Server = require("./server.js");

const start = async (ran) => {
  try {
    const otp = new OTP();
    const client = await Client();
    const server = await Server(client, otp);

    ran(client, otp);
  } catch (error) {
    console.error("Error initializing modules:", error);
  }
};

start((client, otp) => {
  module.exports.client = client;
  module.exports.otp = otp;
});
