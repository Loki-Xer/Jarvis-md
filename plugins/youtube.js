/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const {
    yts,
    isUrl,
    YtInfo,
    System,
    GetYta,
    GetYtv,
    config,
    toAudio,
    Ytsearch,
    getBuffer,
    isPrivate,
    IronMan,
    youtube,
    AddMp3Meta,
    extractUrlFromMessage,
  } = require('../lib/');

/*
System({
      pattern: 'video',
      fromMe: isPrivate,
      desc: 'YouTube video downloader',
      type: 'download',
}, async (message, match) => {
      match = match || message.reply_message.text;
      if (!match) return await message.reply('_Give a YouTube video *Url* or *Query*_');
     const matchUrl = extractUrlFromMessage(match);
     if (isUrl(matchUrl)) {
         const { title } = await YtInfo(matchUrl);
         await message.reply("_*" + "downloading " + title + "*_");
         return await message.send(await GetYtv(matchUrl), { caption: '*made with 🤍*', quoted: message.data }, 'video');
      } else {
        const data = await Ytsearch(match);
        await message.reply("_*" + "downloading " + data.title + "*_"); 
        return await message.send(await GetYtv(data.url), { caption: '*made with 🤍*', quoted: message.data }, 'video');
      }
});

System({
      pattern: 'ytv',
      fromMe: isPrivate,
      desc: 'YouTube video downloader',
      type: 'download',
}, async (message, match) => {
      match = match || message.reply_message.text;
      if (!match) return await message.reply('_Give a YouTube video *Url* or *Query*_');
     const matchUrl = extractUrlFromMessage(match);
     if (isUrl(matchUrl)) {
         const { title } = await YtInfo(matchUrl);
         await message.reply("_*" + "downloading " + title + "*_");
         return await message.send(await GetYtv(matchUrl), { caption: '*made with 🤍*', quoted: message.data }, 'video');
      } else {
        const data = await Ytsearch(match);
        await message.reply("_*" + "downloading " + data.title + "*_"); 
        return await message.send(await GetYtv(data.url), { caption: '*made with 🤍*', quoted: message.data }, 'video');
      }
});
*/

System({
  pattern: 'video ?(.*)',
  fromMe: isPrivate,
  desc: 'Downloads YouTube video',
  type: 'youtube',
}, async (message, match) => {
  const sq = match || extractUrlFromMessage(message.reply_message?.text);
  if (!sq) return message.reply("*Need a video URL or query.*");
  
  let url = sq;
  if (!isUrl(sq)) {
    if (isUrl(message.reply_message?.text)) {
      url = message.reply_message.text;
    } else {
      const data = await Ytsearch(sq);
      url = data.url;
    }
  }
  var res = await fetch(IronMan(`ironman/dl/ytdl2?url=${url}`));
  var dataa = await res.json();
  if (!dataa) return await message.reply("*No suitable video found.*");
  await message.reply(`- *Downloading ${dataa.title}...*`);
  await message.sendFromUrl(dataa.video, { quoted: message });
});

System({
  pattern: 'ytv ?(.*)',
  fromMe: isPrivate,
  desc: 'Download YouTube videos',
  type: 'youtube',
}, async (message, match) => {
  if (!match) return await message.reply('Please provide a valid YouTube URL.');
  var data = await youtube(match);
  if (!data.download || data.download.length === 0) return await message.reply('No download links found.');
  let qualities = data.download.map((item, index) => `${index + 1}. ${item.quality}`).join('\n');
  await message.reply(`*_${data.title}_*\n\nAvailable qualities:\n${qualities}\n\n*Reply with the number to download the video in that quality*\n✧${match}`);
});

System({
  on: 'text',
  fromMe: isPrivate,
  dontAddCommandList: true,
}, async (message) => {
  if (message.isBot) return;
  if (!message.reply_message || !message.reply_message.fromMe || !message.reply_message.text.includes('✧')) return;
  const match = message.reply_message.text.split('✧')[1];
  const qualitylist = parseInt(message.body.trim());
  var data = await youtube(match);
  if (isNaN(qualitylist) || qualitylist < 1 || qualitylist > data.download.length) return;
  const q = data.download[qualitylist - 1];
  await message.reply(`Downloading *${data.title}* in *${q.quality}*, please wait...`);
  await message.client.sendMessage(message.chat, {
    video: {
      url: q.download
    },
    caption: `*${data.title}*\n\nQuality: ${q.quality}`,
  });
});

/*System({
      pattern: 'yta ?(.*)',
      fromMe: isPrivate,
      desc: 'YouTube audio downloader',
      type: 'download',
}, async (message, match) => {
      match = match || message.reply_message.text;
      if (!match) return await message.reply('_Give a YouTube video *Url* or *Query*_');
      const matchUrl = extractUrlFromMessage(match);
      if (isUrl(matchUrl)) {
          const { title, author, thumbnail } = await YtInfo(matchUrl);
          await message.reply("_*" + "downloading " + title + "*_");
          const aud = await AddMp3Meta(await toAudio(await GetYta(matchUrl)), await getBuffer(thumbnail), { title: title, body: author });
          await message.reply(aud, { mimetype: 'audio/mpeg' }, "audio");
      } else {
          const { title, author, thumbnail, url } = await Ytsearch(match);
          await message.reply("_*" + "downloading " + title + "*_");
          const aud = await AddMp3Meta(await toAudio(await GetYta(url)), await getBuffer(thumbnail), { title: title, body: author.name });
          await message.reply(aud, { mimetype: 'audio/mpeg' }, "audio");
     }
});*/

System({
  pattern: 'yta ?(.*)',
  fromMe: isPrivate,
  desc: 'Sends YouTube audio directly',
  type: 'youtube',
}, async (message, match) => {
    var url = match || (message.reply_message && message.reply_message.text);
    if (!url || !isUrl(url)) return await message.reply("*Need a valid video URL.*");
    var aud = await youtube(url);
    if (!aud.audio || aud.audio.length === 0) return await message.reply("No audio available for this video.");
    var title = aud.title || "audio";
    var artist = aud.artist || "Unknown Artist";
    var image = aud.image || "https://graph.org/file/58ea74675af7836579a3a.jpg";
    if (config.AUDIO_DATA !== "original") [artist, title, image] = config.AUDIO_DATA.split(';').map((v, i) => v || [artist, title, image][i]);
    await message.reply(`Downloading *${title}*, please wait...`);
    var [audbuff, imgbuff] = await Promise.all([getBuffer(aud.audio[0].download), getBuffer(image)]);
    var fek = await AddMp3Meta(audbuff, imgbuff, { title, body: artist });
    await message.reply(fek, { mimetype: 'audio/mpeg' }, "audio");
});


System({
  pattern: 'song ?(.*)',
  fromMe: isPrivate,
  desc: 'Downloads YouTube audio',
  type: 'youtube',
}, async (message, match) => {
  var url;
  if (match) {
    url = match.includes("--thumbnail") ? (await Ytsearch(match.replace("--thumbnail", "").trim())).url : (isUrl(match) ? match : (await Ytsearch(match)).url);
  } else if (message.reply_message && message.reply_message.text) {
    url = extractUrlFromMessage(message.reply_message.text);
    if (!url) return await message.reply("*No URL found in the replied message.*");
  }
  
  if (!url) return await message.reply("*Need a song URL or query.*\n_Use --thumbnail at end if you want video thumbnail_");
  var aud = await youtube(url);
  if (!aud || !aud.audio || aud.audio.length === 0) return await message.reply("No audio available for this video.");
  var { title = "audio", artist = "Unknown Artist", image = "https://graph.org/file/58ea74675af7836579a3a.jpg" } = aud;
  if (config.AUDIO_DATA !== "original") [artist, title, image] = config.AUDIO_DATA.split(';').map((v, i) => v || [artist, title, image][i]);
  var audbuff = await AddMp3Meta(await getBuffer(aud.audio[0].download), await getBuffer(image), { title, body: artist });
  var isThumbnail = match && match.includes("--thumbnail");
  if (isThumbnail) {
    await message.client.sendMessage(message.chat, { image: { url: image }, caption: `Downloading *${title}*, please wait...` }, { quoted: message });
    await message.reply(audbuff, { mimetype: 'audio/mpeg' }, "audio");
  } else {
    await message.send(`Downloading *${title}*, please wait...`);
    await message.client.sendMessage(message.chat, {
      audio: audbuff,
      mimetype: 'audio/mpeg',
      contextInfo: {
        externalAdReply: {
          title,
          body: artist,
          thumbnail: await getBuffer(image),
          mediaType: 1,
          mediaUrl: url,
          sourceUrl: url,
          showAdAttribution: false,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: message });
  }
});

/*
System({
      pattern: 'song ?(.*)',
      fromMe: isPrivate,
      desc: 'YouTube audio downloader',
      type: 'download',
}, async (message, match) => {
      match = match || message.reply_message.text;
      if (!match) return await message.reply('_Give a YouTube video *Url* or *Query*_');
      const matchUrl = extractUrlFromMessage(match);
      if (isUrl(matchUrl)) {
          const { title, author, thumbnail } = await YtInfo(matchUrl);
          await message.reply("_*" + "downloading " + title + "*_");
          const aud = await AddMp3Meta(await toAudio(await GetYta(matchUrl)), await getBuffer(thumbnail), { title: title, body: author });
          await message.reply(aud, { mimetype: 'audio/mpeg' }, "audio");
      } else {
          const { title, author, thumbnail, url } = await Ytsearch(match);
          await message.reply("_*" + "downloading " + title + "*_");
          const aud = await AddMp3Meta(await toAudio(await GetYta(url)), await getBuffer(thumbnail), { title: title, body: author.name });
          await message.reply(aud, { mimetype: 'audio/mpeg' }, "audio");
     }
});


System({
    pattern: 'play ?(.*)',
    fromMe: isPrivate,
    desc: 'YouTube video player',
    type: 'download',
}, async (message, match) => {
      if (!match) return await message.reply('_Give a *Query* to play the song or video_');
      if (isUrl(match)) {
          const matchUrl = extractUrlFromMessage(match);
          const yt = await YtInfo(matchUrl);
          await message.reply(`*_${yt.title}_*\n\n\n\`\`\`1.⬢\`\`\` *audio*\n\`\`\`2.⬢\`\`\` *video*\n\n_*Send a number as a reply to download*_`, {
            contextInfo: {
              externalAdReply: {
                title: yt.author,
                body: yt.seconds,
                thumbnail: await getBuffer(yt.thumbnail),
                mediaType: 1,
                mediaUrl: yt.url,
                sourceUrl: yt.url,
                showAdAttribution: false,
                renderLargerThumbnail: true
              }
            }
          });
      } else {
          const yt = await Ytsearch(match);
          await message.reply(`*_${yt.title}_*\n\n\n\`\`\`1.⬢\`\`\` *audio*\n\`\`\`2.⬢\`\`\` *video*\n\n_*Send a number as a reply to download*_`, {
            contextInfo: {
              externalAdReply: {
                title: yt.author.name,
                body: yt.ago,
                thumbnail: await getBuffer(yt.image),
                mediaType: 1,
                mediaUrl: yt.url,
                sourceUrl: yt.url,
                showAdAttribution: false,
                renderLargerThumbnail: true
              }
            }
          });
      }
});
  
  System({
    on: 'text',
    fromMe: isPrivate,
    dontAddCommandList: true,
  }, async (message) => {
    if (message.isBot) return;
    if (!message.reply_message.fromMe || !message.reply_message.text) return;
    if (!message.body.includes('⬢')) return;
    let match = message.body.replace('⬢', '');
    if (message.body.includes('1')) {
      const ytAudio = await Ytsearch(match);
      const msg = await message.send(`_*Now playing : ${ytAudio.title} 🎶*_`);
      const data = config.AUDIO_DATA.split(';');
      const aud = await AddMp3Meta(
        await toAudio(await GetYta(ytAudio.url), 'mp3'),
        await getBuffer(data[2]),
        {
          title: data[0],
          body: data[1],
        }
      );
      await message.client.sendMessage(message.from, {
        audio: aud,
        mimetype: 'audio/mpeg',
        contextInfo: {
          externalAdReply: {
            title: ytAudio.author.name,
            body: ytAudio.ago,
            thumbnail: await getBuffer(ytAudio.image),
            mediaType: 1,
            mediaUrl: ytAudio.url,
            sourceUrl: ytAudio.url,
            showAdAttribution: false,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: msg });
    } else if (message.body.includes('2')) {
      const data = await Ytsearch(match);
      const q = await message.send(`_*Now playing : ${data.title} 🎶*_`);
      await message.send(
        await GetYtv(data.url),
        { caption: `_*${data.title}*_`, quoted: q },
        'video'
      );
    } else {
      return;
    }
  });
  */

  System({
       pattern: 'yts ?(.*)',
       fromMe: isPrivate,
       desc: "yt search",
       type: "search",
  }, async (message, match) => {
      if (!match) {
        return await message.reply('_Please provide an *Query*');
      } else {
        if (isUrl(match)) {
          return await message.reply("_Not a *Url* Please provide an *Query*");
        } else {
          const videos = await yts(match);
          const result = videos.all.map(video => `*🏷️ Title :* _*${video.title}*_\n*📁 Duration :* _${video.duration}_\n*🔗 Link :* _${video.url}_`);
          return await message.reply(`\n\n_*Result Of ${match} 🔍*_\n\n`+result.join('\n\n')+"\n\n*🤍 صنع بواسطة لوكي*")
        }
      }
  });
