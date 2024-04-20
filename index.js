const { client } = require("./lib/");

const start = async () => {
    try {
        const Client = new client();
        Client.log("starting client...");
        await Client.startServer();
        await Client.WaConnect();
    } catch (error) {
        console.error(error);
    }
};

start();
