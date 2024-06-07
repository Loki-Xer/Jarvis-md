/*------------------------------------------------------------------------------------------------------------------------------------------------------

Copyright (C) 2023 Loki - Xer.
Licensed under the GPL-3.0 License; you may not use this file except in compliance with the License.
Jarvis - Loki-Xer

------------------------------------------------------------------------------------------------------------------------------------------------------*/

const { System } = require("../lib");
const { parsedJid } = require("./client/");

System({
    pattern: "setpp",
    fromMe: true,
    desc: "Set profile picture",
    type: "whatsapp",
}, async (message) => {
    if (!message.reply_message || !message.reply_message.image)
        return await message.reply("_Reply to a photo_");
    let buff = await message.reply_message.download();
    await message.setPP(message.user.jid, buff);
    return await message.reply("_Profile Picture Updated_");
});

System({
    pattern: "jid",
    fromMe: true,
    desc: "Give JID of chat/user",
    type: "whatsapp",
}, async (message) => {
    let jid = message.quoted && message.reply_message ? message.reply_message.sender : message.jid;
    return await message.send(jid);
});

System({
    pattern: "pp$",
    fromMe: true,
    desc: "Set full screen profile picture",
    type: "whatsapp",
}, async (message, match) => {
    if (match === "remove") {
        await message.client.removeProfilePicture(message.user.jid);
        return await message.reply("_Profile Picture Removed_");
    }
    if (!message.reply_message || !message.reply_message.image)
        return await message.reply("_Reply to a photo_");
    let media = await message.reply_message.download();
    await message.client.updateProfile(media, message.user.jid);
    return await message.reply("_Profile Picture Updated_");
});

System({
    pattern: "dlt",
    fromMe: true,
    desc: "Deletes a message",
    type: "whatsapp",
}, async (message) => {
    if (!message.reply_message) return await message.reply("_Reply to a message to delete it_");
    await message.client.sendMessage(message.chat, { delete: message.reply_message.key });
});

System({
    pattern: 'clear ?(.*)',
    fromMe: true,
    desc: 'Delete WhatsApp chat',
    type: 'whatsapp'
}, async (message) => {
    await message.client.chatModify({ delete: true }, message.jid);
    await message.send('_Cleared_');
});

System({
    pattern: 'archive ?(.*)',
    fromMe: true,
    desc: 'Archive WhatsApp chat',
    type: 'whatsapp'
}, async (message) => {
    await message.client.chatModify({ archive: true }, message.jid);
    await message.send('_Archived_');
});

System({
    pattern: 'unarchive ?(.*)',
    fromMe: true,
    desc: 'Unarchive WhatsApp chat',
    type: 'whatsapp'
}, async (message) => {
    await message.client.chatModify({ archive: false }, message.jid);
    await message.send('_Unarchived_');
});

System({
    pattern: 'chatpin ?(.*)',
    fromMe: true,
    desc: 'Pin a chat',
    type: 'whatsapp'
}, async (message) => {
    await message.client.chatModify({ pin: true }, message.jid);
    await message.send('_Pinned_');
});

System({
    pattern: 'unpin ?(.*)',
    fromMe: true,
    desc: 'Unpin a chat',
    type: 'whatsapp'
}, async (message) => {
    await message.client.chatModify({ pin: false }, message.jid);
    await message.send('_Unpinned_');
});

System({
    pattern: "block",
    fromMe: true,
    desc: "Block a user",
    type: "whatsapp",
}, async (message) => {
    let jid = message.quoted ? message.reply_message.sender : message.jid;
    await message.client.updateBlockStatus(jid, "block");
    await message.reply("_*Blocked*_");
});

System({
    pattern: "unblock",
    fromMe: true,
    desc: "Unblock a user",
    type: "whatsapp",
}, async (message) => {
    let jid = message.quoted ? message.reply_message.sender : message.jid;
    await message.client.updateBlockStatus(jid, "unblock");
    await message.reply("_*Unblocked*_");
});

System({
    pattern: "setbio",
    fromMe: true,
    desc: "To change your profile status",
    type: "whatsapp",
}, async (message, match) => {
    match = match || message.reply_message.text;
    if (!match) return await message.send('*Need Status!*\n*Example: setbio Hey there! I am using WhatsApp*.');
    await message.client.updateProfileStatus(match);
    await message.send('_Profile status updated_');
});

System({
    pattern: 'setname ?(.*)',
    fromMe: true,
    desc: 'To change your profile name',
    type: 'whatsapp'
}, async (message, match) => {
    match = match || message.reply_message.text;
    if (!match) return await message.send('*Need Name!*\n*Example: setname your name*.');
    await message.client.updateProfileName(match);
    await message.send('_Profile name updated_');
});

System({
    pattern: "forward",
    fromMe: true,
    desc: "Forwards the replied message",
    type: "whatsapp",
}, async (message, match) => {
    if (!message.quoted) return await message.reply('Reply to message');
    if (!match) return await message.reply("*Provide a JID; use 'jid' command to get JID*");
    let jids = parsedJid(match);
    for (let jid of jids) {
        await message.client.forwardMessage(jid, message.reply_message.message);
    }
    await message.reply("_Message forwarded_");
});

System({
    pattern: 'caption ?(.*)',
    fromMe: true,
    desc: 'Change video or image caption',
    type: 'whatsapp',
}, async (message, match) => {
    if (!message.quoted || (!message.reply_message.video && !message.reply_message.image))
        return await message.reply('*_Reply to an image or video_*');
    if (!match) return await message.reply("*Need a query, e.g., .caption Hello*");
    await message.client.forwardMessage(message.jid, message.reply_message.message, { caption: match });
});
