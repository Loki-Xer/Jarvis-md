const { System, isPrivate, extractUrlFromMessage, sleep, getJson, config, isUrl, IronMan, getBuffer, toAudio } = require("../lib/");
const axios = require('axios');

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
    desc: 'Download Facebook media',
    type: 'download'
}, async (message, match, m) => {
    const url = match || message.reply_message.text;
    if (!isUrl(url)) return await message.send("_*Need a valid URL*_");
    match = await extractUrlFromMessage(url);
    if (!match) return await message.send("_*Need a Facebook URL*_");
    if (!match.includes('facebook')) return await message.send("_*Need a Facebook URL*_");
    const { data } = await getJson(config.API + "download/fb?url=" + match);
    await message.sendFromUrl(data[0].url);
});
  
System({
    pattern: 'pinterest ?(.*)',
    fromMe: isPrivate,
    desc: "pinterest downloader",
    type: "download",
}, async (message, match, m) => {
    match = match || message.reply_message.text;
    if (!match) return await message.reply('_Please provide a pinterest *url*');
    if (!isUrl(match)) return await message.reply("_Please provide a valid pinterest *url*");
    if (!match.includes("pin.it")) return await message.reply("_Please provide a valid pinterest *url*");
    const { result } = await getJson(config.API + "download/pinterest?link=" + await extractUrlFromMessage(match))
    await message.sendFromUrl(result.LokiXer.url, { caption: result.LokiXer.title });
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
    if (match.startsWith("dl-url")) await message.sendFromUrl(url);
    if (!isInstaUrl(url)) return;
    if (!url) return message.reply("_*Provide a valid Instagram story URL*_");
    const { result}  = await getJson("https://api.lokiser.xyz/download/insta?url=" + url);
    if (!result) return await message.send("Not Found");
    if (result.length === 1) return await message.sendFromUrl(result[0].download_link);
    const options = result.map((u, index) => ({displayText: `${index + 1}/${result.length}`, id: `story dl-url  ${u.download_link}`}));
    const optionChunks = [];
    while (options.length > 0) optionChunks.push(options.splice(0, 10));
    for (const chunk of optionChunks) await message.sendPollMessage({ name: "\n*Instagram Story Downloader ⬇️*\n", values: chunk, onlyOnce: false, id: message.key.id, withPrefix: true, participates: [message.sender] });
});


System({
  pattern: 'soundcloud (.*)',
  fromMe: isPrivate,
  desc: 'SoundCloud downloader',
  type: 'download',
}, async (message, match) => {
  if (!match || !match.includes('soundcloud')) {
    await message.send("*Need a SoundCloud link to download*\n_Example: .soundcloud https://m.soundcloud.com/corpse_husband/life-waster_");
    return;
  }

  try {
    const link = match.trim();
    const response = await axios.get(IronMan(`ironman/soundcloud/download?link=${link}`));
    const title = response.data.title;
    const qt = await message.send(`*Downloading ${title}*`);
    const turl = response.data.thumb;
    const aurl = IronMan(`ironman/scdl?url=${link}`);
    const aud = await getBuffer(aurl);
    const img = await getBuffer(turl);
    const result = await toAudio(aud, 'mp3');
    await message.client.sendMessage(message.from, {
      audio: result,
      mimetype: 'audio/mpeg',
      contextInfo: {
        externalAdReply: {
          title: title,
          body: 'ᴊᴀʀᴠɪꜱ-ᴍᴅ',
          thumbnail: img,
          mediaType: 1,
          mediaUrl: aurl,
          sourceUrl: link,
          showAdAttribution: false,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: qt });

  } catch (error) {
    console.error('Error at plugin SOUNDCLOUD:', error);
    await message.send("Error downloading from SoundCloud.\n_Check you're url and try again later..._");
  }
});


System({
    pattern: 'livewp ?(.*)',
    fromMe: isPrivate,
    desc: 'Download live wallpapers',
    type: 'download',
}, async (message, match) => {
    try {
        if (!match) {
            await message.send("*Need a query to search for live wallpapers*\n_Example: .livewp furina_");
            return;
        }
        const query = match.trim();
        const response = await axios.get(IronMan(`Ironman/live/wallpaper?query=${query}`));
        const data = response.data;
        const { Title, Preview_url, Mobile, Desktop } = data;
        await message.client.sendMessage(message.chat, { video: { url: Preview_url }, caption: `*${Title}*` });
        await new Promise(resolve => setTimeout(resolve, 2000));
        await message.client.sendMessage(message.chat, { video: { url: Mobile.Download_url }, caption: `「 *MOBILE VERSION* 」\n\n *➥Title:* ${Mobile.Caption}\n *➥Size:* ${Mobile.Size}` });
        await new Promise(resolve => setTimeout(resolve, 2000));
        await message.client.sendMessage(message.chat, { video: { url: Desktop.Download_url }, caption: `「 *DESKTOP VERSION* 」\n\n *➥Title:* ${Desktop.Caption}\n *➥Quality:* ${Desktop.Quality}\n *➥Size:* ${Desktop.Size}` });  
    } catch (error) {
        console.error('Error at plugin LIVEWP:', error);
        await message.send("No wallpaper found for that query.\n_Try again later_");
    }
});
