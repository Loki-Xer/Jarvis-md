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
        const text = `*⬢ title*: ${response[0].title}\n\n*⬢ description*: _${response[0].snippet}_\n`
        await message.send([{ name: "cta_url", display_text: "Visit Google", url: response[0].link, merchant_url: response[0].link, action: "url", icon: "", style: "link" }], { body: "", footer: "*JARVIS-MD*", title: text }, "button");
});


System({
        pattern: "scs (.*)",
        fromMe: isPrivate,
        desc: "SoundCloud search",
        type: "search"
}, async (message, match) => {
        if (!match) return await message.send("*Need a query to search*\n_Example: .scs life waster_");
        const fullResult = match.trim().startsWith("-full");
        const query = fullResult ? match.replace("-full", "").trim() : match.trim();
        const { result: results } = await getJson(IronMan(`ironman/s/soundcloud?query=${query}`));
        if (!results || results.length === 0) return await message.send("No results found.");
        if (fullResult) {
            let fullit = "";
            results.forEach(result => {
                fullit += `*Title*: ${result.title}\n*URL*: ${result.url}\n*Artist*: ${result.artist}\n*Views*: ${result.views}\n*Release*: ${result.release}\n*Duration*: ${result.duration}\n\n`;
            });
            await message.send(fullit);
        } else {
            const furina = results[0];
            const { title, artist, views, release, duration, thumb, url } = furina;
            let caption = `╔═════◇\n\n*➭Title*: ${title}\n*➭Artist*: ${artist}\n*➭Views*: ${views}\n*➭Release*: ${release}\n*➭Duration*: ${duration}\n*➭URL*: ${url}\n\n*Use -full in front of query to get full results*\n_Example: .scs -full ${match}_\n\n╚══════════════════╝`;
            if (thumb) {
                await message.client.sendMessage(message.chat, { image: { url: thumb }, caption: caption });
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
}, async (message, match, m) => {
    if (!match) return await message.send("*Need a device name*\n_Example: device Xiaomi 11 i_");
    var data = await getJson(IronMan(`ironman/device?query=${match}`));
    if (Array.isArray(data) && data.length > 0) {
        const { id, name, img, description } = data[0];
        const cap = `*➭Name:* ${name}\n*➭Id:* ${id}\n*➭Description:* ${description}`;
        await message.client.sendMessage(message.chat, { image: { url: img }, caption: cap });
    } else {
        await message.send("*Device not Found*");
    }
});

System({
    pattern: 'wallpaper ?(.*)',
    fromMe: isPrivate,
    desc: 'wallpaper search',
    type: 'search'
}, async (message, match, m) => {
    if (!match) return await message.send("*Need a wallpaper name*\n_Example: .wallpaper mountain_");
    const query = match.trim(); 
    const images = await getJson(await IronMan(`ironman/wallpaper?search=${query}`));
    if (images.length > 0) {
        const randomIndexes = Array.from({ length: 5 }, () => Math.floor(Math.random() * images.length));
        const randomImages = randomIndexes.map(index => images[index]);
        
        for (const url of randomImages) {
            await message.client.sendMessage(message.chat, { image: { url }, caption: "" });
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } else {
        await message.send("No wallpapers found for the given query.");
    }
});

System({
    pattern: "img",
    fromMe: isPrivate,
    desc: "to search Google images",
    type: "search",
}, async (message, match) => {
    match = match || message.reply_message.text;
    if (!match) return await message.reply("_Invalid command format. Please use e.g.: iron man,10_");
    let [searchTerm, numberOfImages] = match.split(',').map(part => part.trim());
    numberOfImages = numberOfImages ? (isNaN(numberOfImages) || numberOfImages < 1 || numberOfImages > 10 ? 5 : parseInt(numberOfImages)) : 5;
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    const data = await getJson(await IronMan(`ironman/s/google?image=${encodedSearchTerm}`));
    const urlsToSend = data.map(item => item.url);
    const send = await message.send(`_Downloading ${numberOfImages} images of ${searchTerm}_`);
    for (const imageUrl of urlsToSend.slice(0, numberOfImages)) {
        try {
            await message.client.sendMessage(message.chat, {image: { url: imageUrl }});
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (imageError) {
            console.error("Error with image:", imageError);
            await send.edit("_Error in image_");
        }
    }
    await send.edit("_Downloaded_");
});

System({
    pattern: 'gitinfo ?(.*)',
    fromMe: isPrivate,
    desc: 'github user details',
    type: 'search',
}, async (message, match) => {
    if (!match) return await message.send("*_Need Github UserName_*");   
    const data = await getJson(`https://api.github.com/users/${match}`);
    const GhUserPP = data.avatar_url || "https://graph.org/file/924bcf22ea2aab5208489.jpg";
    const userInfo = `\n⎔ *Username* : ${data.login} \n⎔ *Name* : ${data.name || "Not Available"} \n⎔ *Bio* : ${data.bio || "Not Available"} \n\n➭ *ID* : ${data.id}\n➭ *Followers* : ${data.followers}\n➭ *Following* : ${data.following}\n➭ *Type* : ${data.type}\n➭ *Company* : ${data.company || "Not Available"}\n➭ *Public Repos* : ${data.public_repos}\n➭ *Public Gists* : ${data.public_gists}\n➭ *Email* : ${data.email || "Not Available"}\n➭ *Twitter* : ${data.twitter_username || "Not Available"}\n➭ *Location* : ${data.location || "Not Available"}\n➭ *Blog* : ${data.blog || "Not Available"}\n➭ *Profile URL* : ${data.html_url}\n➭ *Created At* : ${data.created_at}\n\n`;
    await message.client.sendMessage(message.chat, { image: { url: GhUserPP }, caption: userInfo });
});
