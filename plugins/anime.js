const { tiny, System, IronMan, isPrivate, getJson } = require("../lib/");
const axios = require('axios');


System({ 
    pattern: "waifu", 
    fromMe: isPrivate, 
    desc: "Send a waifu image", 
    type: "anime" 
}, async (message) => {
    const response = await getJson(await IronMan("ironman/waifu"));
    if (response.status) {
        await message.send(
            response.ironman.url,
            { caption: await tiny("*here is your waifu*"), quoted: message.data },
            "image"
        );
    } else {
        await message.send("Failed to fetch image");
    }
});

System({ 
    pattern: "neko", 
    fromMe: isPrivate, 
    desc: "Send Neko images", 
    type: "anime" 
}, async (message) => {
    const response = await getJson(await IronMan("ironman/neko"));
    if (response.status) {
        await message.send(
            response.ironman.url,
            { caption: await tiny("*here is your neko*"), quoted: message.data },
            "image"
        );
    } else {
        await message.send("Failed to fetch image");
    }
});


System({
    pattern: 'aquote ?(.*)',
    fromMe: isPrivate,
    desc: 'Get a random anime quote',
    type: 'anime',
}, async (message, match, m) => {    
    try {
        const response = await axios.get(IronMan('api/aquote'));
        const data = response.data;
        if (data && data.result && data.result.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.result.length);
            const { english: enquote, character, anime } = data.result[randomIndex];
            await message.send(`*➭QUOTE:* ${enquote}\n*➭CHARACTER:* ${character}\n*➭ANIME:* ${anime}`);
        } else {
            await message.send('No quotes found.');
        }
    } catch (error) {
        console.error('Error at plugin AQUOTE:', error.message);
        await message.send('Please try again later.');
    }
});
