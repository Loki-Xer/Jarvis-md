const { System, IronMan, isPrivate, getJson } = require("../lib/");


System({
        pattern: "ig ?(.*)",
        fromMe: isPrivate,
        desc: "Get details of Instagram id",
        type: "search"
}, async (message, match) => {
        match = match.trim();
        if (!match) return await message.send("*Need an Instagram username*\n_Example: .ig sedboy.am_");
        const { result } = await getJson(await IronMan(`ironman/ig?name=${match}`));
        const { username, full_name: fullName, biography, profile_pic_url: profilePic, posts: postCount, followers: followersCount, following: followingCount, is_verified: isVerified, is_private: isPrivate, external_url: profileUrl } = result.user_info;
        const caption = `*𖢈Username: ${username}*\n*𖢈Name: ${fullName}*\n*𖢈Bio: ${biography}*\n*𖢈Post: ${postCount}*\n*𖢈Followers: ${followersCount}*\n*𖢈Following: ${followingCount}*\n*𖢈Verified: ${isVerified}*\n*𖢈Private: ${isPrivate}*\n*𖢈URL: https://instagram.com/${match}*`;
        await message.client.sendMessage(message.chat, { image: { url: `${profilePic}` }, caption: caption });
});

System({
        pattern: "google ?(.*)",
        fromMe: isPrivate,
        desc: "Google search",
        type: "search"
}, async (message, match) => {
        if (!match) return await message.send("*Need a query to search*\n_Example: who is iron man_");
        const results = await getJson(IronMan(`ironman/s/google/search?q=${match}`));    
            let resultText = ` Results of ${match} \n━━━───────────━━━\n`;
            results.forEach((result, index) => {
                const title = result.title;
                const snippet = result.snippet;
                const link = result.link;

                resultText += ` *title*: ${title}\n*description*: ${snippet}\n*url*: ${link}\n━━━───────────━━━\n\n`;
            });
            await message.send(resultText);   
});

System({
        pattern: "gs ?(.*)",
        fromMe: isPrivate,
        desc: "Google search (short)",
        type: "search"
}, async (message, match) => {
        if (!match) return await message.send("*Need a query to search*\n_Example: who is iron man_");
        const response = await getJson(IronMan(`ironman/s/google/search?q=${match}`));
        await message.send(`❀ *title*: ${response[0].title}\n❀ *ᴅᴇꜱᴄʀɪᴩᴛɪᴏɴ*: _${response[0].snippet}_\n❀ *ʟɪɴᴋ*: *${response[0].link}*`);
});


System({
    pattern: "scs (.*)",
    fromMe: isPrivate,
    desc: "SoundCloud search",
    type: "search"
}, async (message, match, { axios, IronMan }) => {
    if (!match) return await message.send("*Need a query to search*\n_Example: .scs life waster_");
    const fullResult = match.trim().startsWith("-full");     
    const query = fullResult ? match.replace("-full", "").trim() : match.trim();
    const { data: { result: results } } = await axios.get(IronMan(`ironman/s/soundcloud?query=${query}`));
    if (!results || results.length === 0) return await message.send("No results found.");
    
    if (fullResult) {
        let fullit = "";
        results.forEach(result => {
            fullit += `*Title*: ${result.title}\n*URL*: ${result.url}\n*Artist*: ${result.artist}\n*Views*: ${result.views}\n*Release*: ${result.release}\n*Duration*: ${result.duration}\n\n`;
        });
        await message.send(fullit);
    } else {
        const furina = results[0];
        let caption = `╔═════◇\n\n*➭Title*: ${furina.title}\n*➭Artist*: ${furina.artist}\n*➭Views*: ${furina.views}\n*➭Release*: ${furina.release}\n*➭Duration*: ${furina.duration}\n*➭URL*: ${furina.url}\n\n*Use -full in front of query to get full results*\n_Example: .scs -full ${match}_\n\n╚══════════════════╝`;
        if (furina.thumb) {
            await message.client.sendMessage(message.chat, {
                image: { url: furina.thumb },
                caption: caption
            });
        } else {
            await message.send(caption);
        }
    }
});


System({
    pattern: "device ?(.*)",
    fromMe: isPrivate,
    desc: "Get details of a Device",
    type: "search"
}, async (message, match, { getJson, IronMan }) => {
    if (!match) return await message.send("*Need a device name*\n_Example: device Xiaomi 11 i_");               
    var data = await getJson(IronMan(`ironman/device?query=${match}`));
    if (Array.isArray(data) && data.length > 0) {
        const { id, name, img, description } = data[0];
        const cap = `*➭Name:* ${name}\n*➭Id:* ${id}\n*➭Description:* ${description}`;
        await message.client.sendMessage(message.chat, {
            image: { url: img },
            caption: cap
        });
    } else {
        await message.send("*Device not Found*");
    }
});


System({
    pattern: 'wallpaper ?(.*)',
    fromMe: isPrivate,
    desc: 'wallpaper search',
    type: 'search',
}, async (message, match, { getJson, IronMan }) => {   
    if (!match) return await message.send("*Need a wallpaper name*\n_Example: .wallpaper mountain_");      
    const query = match.trim(); 
    const response = await getJson(IronMan(`ironman/wallpaper?search=${query}`));
    if (response.data.length > 0) {
        const images = response.data;
        const randomIndexes = Array.from({ length: 5 }, () => Math.floor(Math.random() * images.length));
        const randomImages = randomIndexes.map(index => images[index].url);
        for (const url of randomImages) {
            await message.client.sendMessage(message.chat, { image: { url }, caption: "" });
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } else {
        await message.send("No wallpapers found for the given query.");
    }
});
