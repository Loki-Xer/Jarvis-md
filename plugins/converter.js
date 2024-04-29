/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const fs = require('fs');
const ff = require('fluent-ffmpeg');
const { Image } = require("node-webpmux");
const { fromBuffer } = require('file-type');
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const { exec } = require("child_process");
const {
    config,
    System,
    styletext,
    isPrivate,
    getStyles,
    selectStyle,
    toAudio,
    AddMp3Meta,
    getBuffer,
    webpToPng,
    webp2mp4,
    elevenlabs
} = require("../lib/");
const stickerPackNameParts = config.STICKER_PACKNAME.split(";");

System({
    pattern: "photo",
    fromMe: isPrivate,
    desc: "Sticker to Image",
    type: "converter",
}, async (message) => {
   if (!message.reply_message?.sticker) return await message.reply("_Reply to a sticker_");
   if (message.reply_message.isAnimatedSticker) return await message.reply("_Reply to a non-animated sticker message_");
   let buffer = await webpToPng(await message.reply_message.downloadAndSave());
   return await message.send(buffer, {}, "image");
});

System({
    pattern: "mp3",
    fromMe: isPrivate,
    desc: "mp3 converter",
    type: "converter",
}, async (message, match, m) => {
   if (!(message.reply_message.video || message.reply_message.audio))
   return await message.reply("_Reply to audio or video_");	
   var audioResult = await toAudio(await message.reply_message.download());
   const [firstName, author, image] = config.AUDIO_DATA.split(";");
   const aud = await AddMp3Meta(audioResult, await getBuffer(image), { title: firstName, body: author });
   await message.client.sendMessage(message.jid, { audio: aud, mimetype: "audio/mp4" });
});


System({
    pattern: "ptv",
    fromMe: isPrivate,
    desc: "video into pvt converter",
    type: "converter",
}, async (message) => {
   if (!message.reply_message.video) return message.reply("_*Reply to a video*_");
   const buff = await message.reply_message.download();
   const msg = await message.client.generatPvtMessage(buff);
   await message.client.forward(message.jid, msg);
});

System({
    pattern: "wawe",
    fromMe: isPrivate,
    desc: "audio into wave",
    type: "converter",
}, async (message) => {
   if (!message.reply_message?.audio) return await message.reply("_Reply to an audio_");
   let media = await toAudio(await message.reply_message.download());
   return await message.send(media, { mimetype: 'audio/mpeg', ptt: true, quoted: message.data }, "audio");
});

System({
    pattern: "mp4",
    fromMe: isPrivate,
    desc: "Changes sticker to Video",
    type: "converter",
}, async (message) => {
   if (!message.reply_message?.sticker) return await message.reply("_Reply to a sticker_");
   if (!message.reply_message.isAnimatedSticker) return await message.reply("_Reply to an animated sticker message_");
   let buffer = await webp2mp4(await message.reply_message.download());
   return await message.send(buffer, {}, "video");
});

System({
    pattern: "gif",
    fromMe: isPrivate,
    desc: "Changes sticker to Gif",
    type: "converter",
}, async (message) => {
   if (!message.reply_message?.sticker) return await message.reply("_Reply to a sticker_");
   if (!message.reply_message.isAnimatedSticker) return await message.reply("_Reply to an animated sticker message_");
   const buffer = await webp2mp4(await message.reply_message.download());
   return await message.send(buffer, { gifPlayback: true }, "video");
});

System({
    pattern: 'black',
    fromMe: isPrivate,
    desc: 'make audio into black video',
    type: "converter"
}, async (message) => {
        const ffmpeg = ff();
        if (!message.reply_message?.audio) return await message.send("_Reply to an audio message_");
        const file = './lib/temp/black.jpg';
        const audioFile = './lib/temp/audio.mp3';
        fs.writeFileSync(audioFile, await message.reply_message.download());
        ffmpeg.input(file);
        ffmpeg.input(audioFile);
        ffmpeg.output('./lib/temp/videoMixed.mp4');
        ffmpeg.on('end', async () => {
            await message.send(fs.readFileSync('./lib/temp/videoMixed.mp4'), {}, 'video');
        });
        ffmpeg.on('error', async (err) => {
            console.error('FFmpeg error:', err);
            await message.reply("An error occurred during video conversion.");
        });
        ffmpeg.run();
});


System({
    pattern: "round",
    fromMe: isPrivate,
    desc: "Changes photo to sticker",
    type: "converter",
}, async (msg) => {
   if (!(msg.reply_message.sticker || msg.reply_message.image)) return await msg.reply("_*Reply to photo or sticker*_");
   if (msg.reply_message.isAnimatedSticker) return await message.reply("_Reply to a non-animated sticker message_");
   let media = await msg.reply_message.download();
   let sticker = new Sticker(media, {
        pack: stickerPackNameParts[0], 
        author: stickerPackNameParts[1], 
        type: StickerTypes.ROUNDED ,
        categories: ["🤩", "🎉"], 
        id: "https://github.com/Loki-Xer/jarvis-md",
        quality: 75, 
   });
   const buffer = await sticker.toBuffer();
   await msg.client.sendMessage(msg.chat, { sticker: buffer }, { quoted: msg.reply_message.data });
});

System({
    pattern: "fancy",
    fromMe: isPrivate,
    desc: "converts text to fancy text",
    type: "converter",
}, async (message, match) => {
    if (message.reply_message.text) {
        if (!match) return message.send(`*_reply to a message and use ${message.prefix} fancy 7`);
        const style = await getStyles(message.reply_message.text);
        const text = await selectStyle(style, match);
        await message.reply(text.result);
    } else if (match) {
        const [text, index] = match.split(' ');
        if (!index) return await message.send(`*_use ${message.prefix} fancy hy 7`);
        const style = await getStyles(text);
        const selectedStyle = await selectStyle(style, index);
        await message.reply(selectedStyle.result);
    } else {
        let text = `*Fancy text*\n\n*Example:*\n*reply to a text and ${message.prefix} fancy 7*\n*or*\n*use ${message.prefix} fancy hy 5*\n\n`;
        const styleResults = await getStyles("Fancy");
        styleResults.forEach((style, index) => {
            text += `${index + 1}. ${style.result}\n`;
        });
        return await message.reply(text);
    }
});

System({
    pattern: "circle",
    fromMe: isPrivate,
    desc: "Changes photo to sticker",
    type: "converter",
}, async (message) => {
   if (!(message.reply_message.sticker || message.reply_message.image)) return await message.reply("_*Reply to photo or sticker*_");
   if (message.reply_message.isAnimatedSticker) return await message.reply("_Reply to a non-animated sticker message_");
   let media = await message.reply_message.download();
   let sticker = new Sticker(media, {
        pack: stickerPackNameParts[0], 
        author: stickerPackNameParts[1], 
        type: StickerTypes.CIRCLE ,
        categories: ["🤩", "🎉"],
        id: "https://github.com/Loki-Xer/jarvis-md", 
        quality: 75,
   });
  const buffer = await sticker.toBuffer();
  await message.client.sendMessage(message.chat, { sticker: buffer }, { quoted: message.reply_message.data });
});


System({
    pattern: "crop",
    fromMe: isPrivate,
    desc: "Changes photo to sticker",
    type: "converter",
}, async (msg) => {
   if (!(msg.reply_message.sticker || msg.reply_message.image)) return await msg.reply("_*Reply to photo or sticker*_");  
   if (msg.reply_message.isAnimatedSticker) return await message.reply("_Reply to a non-animated sticker message_");
   let media = await msg.reply_message.download();
   let sticker = new Sticker(media, {
        pack: stickerPackNameParts[0], 
        author: stickerPackNameParts[1], 
        type: StickerTypes.CROPPED,
        categories: ["🤩", "🎉"],
        id: "https://github.com/Loki-Xer/jarvis-md", 
        quality: 75, 
   });
   const buffer = await sticker.toBuffer();
   await msg.client.sendMessage(msg.chat, { sticker: buffer }, { quoted: msg.reply_message.data });
});

System({
    pattern: "take",
    fromMe: isPrivate,
    desc: "Changes Exif data of stickers",
    type: "converter",
}, async (message, match) => {
   let data;
   if (!message.reply_message || (!message.reply_message.sticker && !message.reply_message.audio)) return await message.reply("_Reply to a sticker or audio_");
   if (message.reply_message.sticker) {
        const stickerPackName = (match || config.STICKER_PACKNAME).split(";");
		await message.send(await message.reply_message.download(), {
			packname: stickerPackName[0],
			author: stickerPackName[1]
		}, "sticker");
   } else if (message.reply_message.audio) {
   const buff = await message.reply_message.download();
   const audioBuffer = Buffer.from(buff);
   const audioResult = await toAudio(audioBuffer, 'mp4');
   if (match) data = match.split(";");
        data = config.AUDIO_DATA.split(";");
   await message.client.sendMessage(message.jid, {
                audio: await AddMp3Meta(audioResult, await getBuffer(data[2]), {
                    title: data[0],
                    body: data[1]
                }),
                mimetype: "audio/mp4"
            });
        }
});


System({
    pattern: "sticker",
    fromMe: isPrivate,
    desc: "_Converts Photo or video to sticker_",
    type: "converter",
}, async (message, match) => {
   if (!(message.reply_message.video || message.reply_message.image)) return await message.reply("_Reply to photo or video_");   
   let buff = await message.reply_message.download();
   await message.send(buff, {
	packname: stickerPackNameParts[0],
	author: stickerPackNameParts[1]
   }, "sticker");
});

System({
    pattern: "exif",
    fromMe: isPrivate,
    desc: "get exif data",
    type: "converter",
}, async (message, match, m) => {
   if (!message.reply_message || !message.reply_message.sticker)
   return await message.reply("_Reply to sticker_");
   let img = new Image();
   await img.load(await message.reply_message.download());
   const exif = JSON.parse(img.exif.slice(22).toString());
   const stickerPackId = exif['sticker-pack-id'];
   const stickerPackName = exif['sticker-pack-name'];
   const stickerPackPublisher = exif['sticker-pack-publisher'];
   const cap = (`*Sticker Pack ID -->* ${stickerPackId}\n\n*Pack name -->* ${stickerPackName}\n\n*Publisher Name -->* ${stickerPackPublisher}`)
   await message.reply(cap);
});

System({
    pattern: "aitts",
    type: "converter",
    fromMe: isPrivate,
    desc: 'generate ai voices'
}, async (message, match) => {
   if (match == 'list') 
   return await message.send(` *List of Aitts*\n\n 1 _rachel_ \n 2 _clyde_ \n 3 _domi_ \n 4 _dave_ \n 5 _fin_ \n 6 _bella_ \n 7 _antoni_ \n 8 _thomas_ \n 9 _charlie_ \n 10 _emily_ \n 11 _elli_ \n 12 _callum_ \n 13 _patrick_ \n 14 _harry_ \n 15 _liam_ \n 16 _dorothy_ \n 17 _josh_ \n 18 _arnold_ \n 19 _charlotte_ \n 20 _matilda_ \n 21 _matthew_ \n 22 _james_ \n 23 _joseph_ \n 24 _jeremy_ \n 25 _michael_ \n 26 _ethan_ \n 27 _gigi_ \n 28 _freya_ \n 29 _grace_ \n 30 _daniel_ \n 31 _serena_ \n 32 _adam_ \n 33 _nicole_ \n 34 _jessie_ \n 35 _ryan_ \n 36 _sam_ \n 37 _glinda_ \n 38 _giovanni_ \n 39 _mimi_ \n`.replace(/├/g, ''));
   const [v, k] = match.split(/,;|/);
   if (!k) return await message.send(`*_need voice id and text_*\n_example_\n\n_*aitts* hey vroh its a test,adam_\n_*aitts list*_`)
   const stream = await elevenlabs(match)
   if (!stream) return await message.send(`_*please upgrade your api key*_\n_get key from http://docs.elevenlabs.io/api-reference/quick-start/introduction_\n_example_\n\nsetvar elvenlabs: your key\n_or update your config.js manually_`);
   return await message.send({ stream }, { mimetype: 'audio/mpeg' }, 'audio');
});

System({
    pattern: 'doc ?(.*)',
    desc: "convert media to document",
    type: 'converter',
    fromMe: isPrivate
}, async (message, match) => {
    match = (match || "converted media").replace(/[^A-Za-z0-9]/g,'-');
    if (!message.quoted || (!message.reply_message.image && !message.reply_message.audio && !message.reply_message.video)) return message.send("_*Reply to a video/audio/image message!*_");
    const media = await message.reply_message.download()
    const { ext, mime } = await fromBuffer(media);
    return await message.client.sendMessage(message.jid, { document: media, mimetype: mime, fileName: match + "." + ext }, { quoted: message });
});

System({
    pattern: 'rotate ?(.*)',
    fromMe: isPrivate,
    desc: 'rotate image or video in any direction',
    type: 'converter'
}, async (message, match) => {
    if (!(message.quoted && (message.reply_message.video || message.reply_message.image))) return await message.reply('*Reply to an image/video*');
    if (!match || !['left', 'right', 'horizontal', 'vertical'].includes(match.toLowerCase())) return await message.reply('*Need rotation type.*\n_Example: .rotate left, right, horizontal, or vertical_');	
    const rotateOptions = { left: 'transpose=2', right: 'transpose=1', horizontal: 'hflip', vertical: 'vflip', };
    const media = await message.reply_message.downloadAndSave();
    const ext = media.endsWith('.mp4') ? 'mp4' : 'jpg';
    const ffmpegCommand = `ffmpeg -y -i ${media} -vf "${rotateOptions[match.toLowerCase()]}" rotated.${ext}`;
    exec(ffmpegCommand, (error, stdout, stderr) => {
	if (error) return message.reply(`Error during rotation: ${error.message}`);
   	let buffer = fs.readFileSync(`rotated.${ext}`);
	message.send(buffer, {}, media.endsWith('.mp4') ? 'video' : 'image');
	fs.unlinkSync(`rotated.${ext}`);
    });
});

System({
    pattern: 'tovv ?(.*)',
    desc: "convert media to view ones",
    type: 'converter',
    fromMe: true
}, async (message, match) => {
    if (message.quoted && (message.reply_message.image || message.reply_message.video || message.reply_message.audio)) return await message.client.forwardMessage(message.jid, message.reply_message, { vv: true });   
    await message.reply("_*Reply to an image, video, or audio to make it viewable*_");
});
