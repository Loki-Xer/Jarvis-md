const { System, IronMan, isPrivate, getJson } = require("../lib/");


System({ 
    pattern: "waifu", 
    fromMe: isPrivate, 
    desc: "Send a waifu image", 
    type: "anime" 
}, async (message) => {
    const response = await getJson(await IronMan("ironman/waifu"));
    if (!response.status) return await message.send("_*Failed to fetch image*_");
        await message.send(
            response.ironman.url,
            { caption: "*here is your waifu*", quoted: message.data },
            "image"
        );
});

System({ 
    pattern: "neko", 
    fromMe: isPrivate, 
    desc: "Send Neko images", 
    type: "anime" 
}, async (message) => {
    const response = await getJson(await IronMan("ironman/neko"));
    if (!response.status) return await message.send("Failed to fetch image");
        await message.send(
            response.ironman.url,
            { caption: "*here is your neko*", quoted: message.data },
            "image"
        );
});


System({
	pattern: 'aquote ?(.*)',
	fromMe: isPrivate,
	desc: 'Get a random anime quote',
	type: 'anime',
}, async (message, match, m) => {
	const data = await getJson(IronMan('api/aquote'));
	if (!data && !data.result && !data.result.length > 0) return await message.reply('_*No quotes found.*_');
	const randomIndex = Math.floor(Math.random() * data.result.length);
	const {
		english: enquote,
		character,
		anime
	} = data.result[randomIndex];
	await message.send(`*➭QUOTE:* ${enquote}\n*➭CHARACTER:* ${character}\n*➭ANIME:* ${anime}`);
});
