const { tiny, System, IronMan, isPrivate, getJson } = require("../lib/");

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
