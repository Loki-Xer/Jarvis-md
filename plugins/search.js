const { System, IronMan, isPrivate, getJson } = require("../lib/");


System({
    pattern: 'ig ?(.*)',
    fromMe: isPrivate,
    desc: 'Instagram profile details',
    type: 'search',
}, async (message, match) => {
    if (!match) return await message.send("*Need a username*\n_Example: .ig sedboy.am_");
    const data = await getJson(IronMan(`ironman/igstalk?id=${match}`));
    let caption = '';
    if (data.name) caption += `*𖢈ɴᴀᴍᴇ:* ${data.name}\n`;
    if (data.username) caption += `*𖢈ᴜꜱᴇʀɴᴀᴍᴇ:* ${data.username}\n`;
    if (data.bio) caption += `*𖢈ʙɪᴏ:* ${data.bio}\n`;
    if (data.pronouns && data.pronouns.length > 0) caption += `*𖢈ᴘʀᴏɴᴏᴜɴꜱ:* ${data.pronouns.join(', ')}\n`;
    if (data.followers) caption += `*𖢈ꜰᴏʟʟᴏᴡᴇʀꜱ:* ${data.followers}\n`;
    if (data.following) caption += `*𖢈ꜰᴏʟʟᴏᴡɪɴɢ:* ${data.following}\n`;
    if (data.category) caption += `*𖢈ᴄᴀᴛᴇɢᴏʀʏ:* ${data.category}\n`;
    if (typeof data.private !== 'undefined') caption += `*𖢈ᴘʀɪᴠᴀᴛᴇ ᴀᴄᴄ:* ${data.private}\n`;
    if (typeof data.business !== 'undefined') caption += `*𖢈ʙᴜꜱꜱɪɴᴇꜱ ᴀᴄᴄ:* ${data.business}\n`;
    if (data.email) caption += `*𖢈ᴇᴍᴀɪʟ:* ${data.email}\n`;
    if (data.url) caption += `*𖢈ᴜʀʟ:* ${data.url}\n`;
    if (data.contact) caption += `*𖢈ɴᴜᴍʙᴇʀ:*${data.contact}\n`;
    if (data.action_button) caption += `*𖢈ᴀᴄᴛɪᴏɴ ʙᴜᴛᴛᴏɴ:* ${data.action_button}\n`;
    await message.client.sendMessage(message.chat, { image: { url: data.hdpfp }, caption: caption.trim() });
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
    if (!match) return await message.send("*Need a wallpaper name*\n_Example: .wallpaper furina_");
    const images = await getJson(IronMan(`ironman/wallpaper/wlhven?name=${encodeURIComponent(match)}`));
    const urls = images.filter(item => item.url).map(item => item.url);
    if (urls.length > 0) {
        const selectedUrls = urls.sort(() => 0.5 - Math.random()).slice(0, 5);
        for (const imageUrl of selectedUrls) {
            await message.client.sendMessage(message.chat, { image: { url: imageUrl }, caption: "" });
        }
    } else {
        await message.send("No wallpapers found for the given query.");
    }
});

System({
  pattern: 'img ?(.*)',
  fromMe: isPrivate,
  desc: 'Search google images',
  type: 'search',
}, async (message, match) => {
  const [query, count] = match.split(',').map(item => item.trim());
  const imageCount = count ? parseInt(count, 10) : 5;
  if (!query) return await message.send("*Need a Query*\n_Example: .img ironman, 5_");
  const msg = await message.send(`Downloading ${imageCount} images of *${query}*`);
  const urls = await getJson(IronMan(`ironman/s/google?image=${encodeURIComponent(query)}`));
  if (urls.length === 0) return await message.send("No images found for the query");
  const list = urls.length <= imageCount ? urls : urls.sort(() => 0.5 - Math.random()).slice(0, imageCount);
  for (const url of list) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await message.client.sendMessage(message.chat, { image: { url }, caption: "" });
  }
  await msg.edit("*Downloaded*");
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


System({
    pattern: "dict", 
    fromMe: isPrivate,
    desc: "to search in dictionary", 
    type: "search",
}, async (msg, text) => {
    if (!text) return await msg.reply('*Please enter any word!*');
    await getJson('https://api.dictionaryapi.dev/api/v2/entries/en/' + text)
     .then(async (data) => {
      let word = data[0].word;
      let phonetics = data[0].phonetics[0].text;
      let partsOfSpeech = data[0].meanings[0].partOfSpeech;
      let definition = data[0].meanings[0].definitions[0].definition;
      let example = (data[0].meanings[0].definitions.find(obj => 'example' in obj) || {})['example'];
      return await msg.reply(`_Word_ : *${word}*\n_Parts of speech_ : *${partsOfSpeech}*\n_Definition_ :\n*${definition}*${example == undefined ? `` : `\n_Example_ : *${example}*`}`.trim() );
    }).catch(async (e) => {
      return await msg.reply('*Unable to find definition for ' + text + '!*');
    });
});
