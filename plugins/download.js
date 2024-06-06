const { System, isPrivate, extractUrlFromMessage, sleep, getJson, config, isUrl, IronMan, getBuffer, toAudio, terabox } = require("../lib/");


const fetchData = async (mediafireUrl) => {
    const data = await getJson(config.API + "download/mediafire?link=" + mediafireUrl)
    if (!data || data.length === 0) throw new Error("Invalid MediaFire URL or no data found");
    const { nama: name, mime, size, link } = data[0];
    return { name, mime, size: size.trim(), link };
};

function isInstaUrl(url) {
    const instaPattern = /^https?:\/\/(www\.)?instagram\.com\//;
    return instaPattern.test(url);
}

System({
    pattern: "mediafire",
    fromMe: isPrivate,
    desc: "mediafire downloader",
    type: "download"
}, async (message, match) => {
    match = match || message.reply_message.text;
    if (!match) return await message.reply("_Give a mediafire *Url*_");
    const mediafireUrl = extractUrlFromMessage(match);
    const documentData = await fetchData(mediafireUrl).catch(error => {
        console.error("Error:", error);
        return Promise.reject(error);
    });
    if (documentData) {
        const downloadMessage = await message.send(`_*Downloading --> ${documentData.name}*_`);
        await message.client.sendMessage(message.chat, { document: { url: documentData.link }, mimetype: documentData.mime, fileName: documentData.name, fileSize: documentData.size }, { quoted: message.data });
        await downloadMessage.edit("_*Download complete!*_");
    } else {
        await message.send("_It's not a valid MediaFire URL_");
    }
});

System({
    pattern: "ts ?(.*)",
    fromMe: true,
    desc: "Download Sticker From Telegram",
    type: "download",
},
async (message, match, client) => {
    if (!match) return await message.reply("_Enter a tg sticker url_\nEg: https://t.me/addstickers/Vc_me_dance_pack_by_fStikBot\nKeep in mind that there is a chance of ban if used frequently");
    let packid = match.split("/addstickers/")[1];
    let { result } = await getJson(`https://api.telegram.org/${config.TGTOKEN}/getStickerSet?name=${encodeURIComponent(packid)}`);
    if (result.is_animated) return message.reply("_Animated stickers are not supported_");
    message.reply(`*Total stickers :* ${result.stickers.length}\n*Estimated complete in:* ${result.stickers.length * 1.5} seconds\nKeep in mind that there is a chance of ban if used frequently`.trim());
    for (let sticker of result.stickers) {
        let file_path = await getJson(`https://api.telegram.org/${config.TGTOKEN}/getFile?file_id=${sticker.file_id}`);
        const buff = `https://api.telegram.org/file/${config.TGTOKEN}/${file_path.result.file_path}`;
        const stickerPackNameParts = config.STICKER_PACKNAME.split(";");
        const packname = stickerPackNameParts[0];
        const author = stickerPackNameParts[1];
        await message.send(buff, { packname, author }, "sticker");
        await sleep(5500);
    }
    return await message.reply('Done');
});

System({
    pattern: 'apk ?(.*)',
    fromMe: isPrivate,
    desc: 'Download apps from Aptoide',
    type: 'download'
}, async (message, match) => {
    match = match || message.reply_message.text;
    if (!match) return await message.reply("*Nᴇᴇᴅ ᴀɴ ᴀᴘᴘ ɴᴀᴍᴇ*\n*Exᴀᴍᴘʟᴇ: ꜰʀᴇᴇ ꜰɪʀᴇ*");
    var { status, details } = await getJson(config.API + "scraper/app/download?id=" + encodeURIComponent(match));
    if (status) {
      var send = await message.send(`_*Dᴏᴡɴʟᴏᴀᴅɪɴɢ : ${details.appname}*_`);
      await message.client.sendMessage(message.chat, {'document': {'url': details.link},'mimetype': "application/vnd.android.package-archive",'fileName': details.appname + ".apk"}, {'quoted': message.data});
      await send.edit("_*Aᴘᴘ Dᴏᴡɴʟᴏᴀᴅᴇᴅ*_");
    } else {
      await message.reply("_Failed to download APK. Please check the app name or try again later_");
    }
});

System({
    pattern: 'fb ?(.*)',
    fromMe: isPrivate,
    desc: 'Download Facebook video',
    type: 'download',
}, async (message, text) => {
    let match = await extractUrlFromMessage(text || message.reply_message.text);
    if (!match) return await message.send("*Need a Facebook public media link*\n_Example: .fb ");       
    const response = await getJson(IronMan(`ironman/dl/fb?url=${match}`));
    await message.client.sendMessage(message.chat, {video: {url: response.ironman[0].url }, caption: "_*Downloaded🤍*_" })
});

  
System({
    pattern: 'pinterest ?(.*)',
    fromMe: isPrivate,
    desc: "pinterest downloader",
    type: "download",
}, async (message, text, m) => {
    let match = await extractUrlFromMessage(text || message.reply_message.text);
    if (!match) return await message.reply('_Please provide a pinterest *url*');
    if (!isUrl(match)) return await message.reply("_Please provide a valid pinterest *url*");
    if (!match.includes("pin.it")) return await message.reply("_Please provide a valid pinterest *url*");
    const { result } = await getJson(config.API + "download/pinterest?link=" + await extractUrlFromMessage(match))
    await message.sendFromUrl(result.LokiXer.url, { caption: "_*downloaded 🤍*_" });
});


System({
    pattern: "insta",
    fromMe: isPrivate,
    desc: "Download Instagram media",
    type: "download",
}, async (message, match) => {
   match = await extractUrlFromMessage(match || message.reply_message.text);
   if (!match) return await message.reply('_provide an Instagram URL_');
   if (!isInstaUrl(match)) return await message.send("_Please provide a valid Instagram URL_");
   const { result } = await getJson(config.API + "download/insta?url=" + match);
   if (result.length === 0) return await message.send("_No media found for this Instagram URL_");
   for (const video of result) {
     await message.sendFromUrl(video.download_link, { caption: "_*Download 🤍*_" });
    }
});

System({
    pattern: "story",
    fromMe: isPrivate,
    desc: "To download insta story",
    type: "download"
}, async (message, match) => {
    let url = await extractUrlFromMessage(match || message.reply_message.text);
    if (!url) return message.reply("_*Provide a valid Instagram story URL*_");
    if (match.startsWith("dl-url")) await message.sendFromUrl(url);
    if (!isInstaUrl(url)) return;
    const { result}  = await getJson(config.API + "download/insta?url=" + url);
    if (!result) return await message.send("Not Found");
    if (result.length === 1) return await message.sendFromUrl(result[0].download_link);
    const options = result.map((u, index) => ({ name: "quick_reply", display_text: `${index + 1}/${result.length}`, id: `story dl-url  ${u.download_link}`}));
    await message.send(options, { body: "", footer: "*JARVIS-MD*", title: "*Insta Media Downloader 🍉*\n"}, "button");
});


System({
  pattern: 'soundcloud (.*)',
  fromMe: isPrivate,
  desc: 'SoundCloud downloader',
  type: 'download',
}, async (message, match) => {
  const link = await extractUrlFromMessage(match || message.reply_message.text);
  if (!link || !link.includes('soundcloud')) return await message.send("*Need a SoundCloud link to download*\n_Example: .soundcloud https://m.soundcloud.com/corpse_husband/life-waster_");
    const response = await getJson(IronMan(`ironman/soundcloud/download?link=${link}`));
    const q = await message.send(`*Downloading ${response.title}*`);
    const url = IronMan(`ironman/scdl?url=${link}`);
    const aud = await getBuffer(url);
    const img = await getBuffer(response.thumb);
    const result = await toAudio(aud, 'mp3');
    await message.client.sendMessage(message.from, {
      audio: result,
      mimetype: 'audio/mpeg',
      contextInfo: {
        externalAdReply: {
          title: response.title,
          body: 'ᴊᴀʀᴠɪꜱ-ᴍᴅ',
          thumbnail: img,
          mediaType: 1,
          mediaUrl: url,
          sourceUrl: link,
          showAdAttribution: false,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: q });
});


System({
    pattern: 'livewp ?(.*)',
    fromMe: isPrivate,
    desc: 'Download live wallpapers',
    type: 'download',
}, async (message, match) => {
    if (!match) return await message.send("*Need a query to search for live wallpapers*\n_Example: .livewp furina_");           
    const data = await getJson(IronMan(`Ironman/live/wallpaper?query=${match}`));
    const { Title, Preview_url, Mobile, Desktop } = data;
    await message.client.sendMessage(message.chat, { video: { url: Preview_url }, caption: `*${Title}*` });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await message.client.sendMessage(message.chat, { video: { url: Mobile.Download_url }, caption: `「 *MOBILE VERSION* 」\n\n *➥Title:* ${Mobile.Caption}\n *➥Size:* ${Mobile.Size}` });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await message.client.sendMessage(message.chat, { video: { url: Desktop.Download_url }, caption: `「 *DESKTOP VERSION* 」\n\n *➥Title:* ${Desktop.Caption}\n *➥Quality:* ${Desktop.Quality}\n *➥Size:* ${Desktop.Size}` }); 
});

System ({
    pattern: 'gitdl ?(.*)',
    fromMe: isPrivate,
    desc: 'Repository Downloader',
    type: 'download',
}, async (message, match) => {
   if (!isUrl(match)) return await message.reply("*_Need A GitHub Repository Url_*")
   let user = match.split("/")[3];
   let repo = match.split("/")[4];
   const msg = await message.send("_*Downloading 🪲*_", { quoted: message.data });
   await message.client.sendMessage(message.chat,{ document :{ url: `https://api.github.com/repos/${user}/${repo}/zipball` }, fileName: repo , mimetype: "application/zip"}, {quoted: message });
   await msg.edit("_*downloaded 🍓*_");
});

System({
    pattern: 'twitter ?(.*)',
    fromMe: isPrivate,
    desc: 'Download Twitter video',
    type: 'download',
}, async (message, match, m) => {
    if (!match || !match.includes('x.com')) return await message.send("_Need a x(twitter) media url_");
    const twitterVideoUrl = match.trim();
    const { media } = await getJson(`https://api-ironman444ff.koyeb.app/ironman/dl/x?url=${encodeURIComponent(twitterVideoUrl)}`);
    await m.sendFromUrl(media[0].url);
});

System({
    pattern: 'thread ?(.*)',
    fromMe: isPrivate,
    desc: 'Download threads media',
    type: 'download',
}, async (message, match) => {
    if (!match || !match.includes('threads')) return await message.send("_Need a threads media url_");
    const encodedUrl = encodeURIComponent(match.trim());
    const media = await getJson(IronMan(`ironman/dl/threads?url=${encodedUrl}`));
    if (media.video) {
        for (const videoUrl of media.video) {
            await message.client.sendMessage(message.chat, { video: { url: videoUrl }, caption: "*Download🤍*" });
        }
    }
    if (media.image) {
        for (const imageUrl of media.image) {
            await message.client.sendMessage(message.chat, { image: { url: imageUrl }, caption: "*Download🤍*" });
        }
    }
});

System({
        pattern: "tbox", 
        fromMe: isPrivate,
        desc: "download terabox file", 
        type: "download",
  }, async (msg, match) => {
       match = await extractUrlFromMessage(match || msg.reply_message.text);
       if (!isUrl(match)) return msg.reply("*Reply to Terabox url or provide a Terabox url*");
       if (!match || !match.includes("tera")) return msg.reply("*Reply to Terabox url or provide a Terabox url*");
       const { Name: teraBoxFileName, Download, FastDL } = await terabox(match);
       await msg.send(await getBuffer("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdlDLWf101d_p6TaRNvymnAiPPVFZPfTML9dVbj3LD6LLf_mTvHPH5pJq5&s=10"), { type: "image", value: [{ name: "cta_url", display_text: "Download", url: Download, merchant_url: Download, action: "url", icon: "", style: "link" }, { name: "cta_url", display_text: "Fast DL", url: FastDL, merchant_url: FastDL, action: "url", icon: "", style: "link" }], body: "", footer: "*JARVIS-MD*", title: `\nTo download the terabox file click the link below if download link not wroked use Fast DL\n\nFile Name: ` + await decodeURI(teraBoxFileName) +`\n` }, "button");
 });

System({
	pattern: 'tiktok ?(.*)',
	fromMe: isPrivate,
	desc: 'Sends TikTok video ',
	type: 'download',
}, async (message, match, msg) => {
       match = await extractUrlFromMessage(match || message.reply_message.text);
       if (!isUrl(match)) return message.reply("*Reply to Terabox url or provide a Terabox url*");
       if (!match || !match.includes("tiktok")) return message.reply("*Reply to tiktok url or provide a tiktok url*");   
       const { result } = await getJson(IronMan("ironman/dl/v2/tiktok?url=" + match), { headers: { 'ApiKey': 'IRON-M4N' } });
       await message.reply({ url:result.video }, { caption: "*_download🤍_*"}, "video");
});
