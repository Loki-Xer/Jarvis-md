const { client } = require("./lib/");

const start = async (text) => {
    try {
        const Client = new client();
        Client.log(text);
        await Client.startServer();
        await Client.WaConnect();
    } catch (error) {
        console.error(error);
    }
};

start("starting client...");
