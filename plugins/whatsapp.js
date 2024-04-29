/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const { System } = require("../lib");


System({
	pattern: "setpp",
	fromMe: true,
	desc: "Set profile picture",
	type: "whatsapp",
}, async (message) => {
	if (!message.reply_message.image)
	return await message.reply("_Reply to a photo_");
	let buff = await message.reply_message.download();
	await message.setPP(message.user.jid, buff);
	return await message.reply("_Profile Picture Updated_");
});

System({
    pattern: "jid",
    fromMe: true,
    desc: "Give jid of chat/user",
    type: "whatsapp",
}, async (message, match) => {
    let jid = message.quoted ? message.reply_message.sender : message.jid;
    return await message.send(jid);
});

System({
	pattern: "pp$",
	fromMe: true,
	desc: "Set full screen profile picture",
	type: "whatsapp",
}, async (message, match) => {
	if (!message.reply_message.image)
	return await message.reply("_Reply to a photo_");
	let media = await message.reply_message.download();
	await message.client.updateProfile(media, message.user.jid);
	return await message.reply("_Profile Picture Updated_");
});


System({
    pattern: "dlt",
    fromMe: true,
    desc: "deletes a message",
    type: "whatsapp",
}, async (message) => {
    await message.client.sendMessage(message.chat, { delete: message.reply_message });
});


System({
	pattern: 'clear ?(.*)',
	fromMe: true,
	desc: 'delete whatsapp chat',
	type: 'whatsapp'
}, async (message, match) => {
	await message.client.chatModify({
		delete: true,
		lastMessages: [{
			key: message.data.key,
			messageTimestamp: message.messageTimestamp
		}]
	}, message.jid)
	await message.send('_Cleared_')
});

System({
	pattern: 'archive ?(.*)',
	fromMe: true,
	desc: 'archive whatsapp chat',
	type: 'whatsapp'
}, async (message, match) => {
	const lstMsg = {
		message: message.message,
		key: message.key,
		messageTimestamp: message.messageTimestamp
	};
	await message.client.chatModify({
		archive: true,
		lastMessages: [lstMsg]
	}, message.jid);
	await message.send('_Archived_')
});

System({
	pattern: 'unarchive ?(.*)',
	fromMe: true,
	desc: 'unarchive whatsapp chat',
	type: 'whatsapp'
}, async (message, match) => {
	const lstMsg = {
		message: message.message,
		key: message.key,
		messageTimestamp: message.messageTimestamp
	};
	await message.client.chatModify({
		archive: false,
		lastMessages: [lstMsg]
	}, message.jid);
	await message.send('_Unarchived_')
});

System({
	pattern: 'chatpin ?(.*)',
	fromMe: true,
	desc: 'pin a chat',
	type: 'whatsapp'
}, async (message, match) => {
	await message.client.chatModify({
		pin: true
	}, message.jid);
	await message.send('_Pined_')
});

System({
	pattern: 'unpin ?(.*)',
	fromMe: true,
	desc: 'unpin a msg',
	type: 'whatsapp'
}, async (message, match) => {
	await message.client.chatModify({
		pin: false
	}, message.jid);
	await message.send('_Unpined_')
});

System({
    pattern: "block",
    fromMe: true,
    desc: "block a user",
    type: "whatsapp",
}, async (message, match) => {
   let jid = message.quoted ? message.reply_message.sender : message.jid;
   await message.client.updateBlockStatus(jid, "block");
   return await message.reply("_*blocked*_");
});

System({
    pattern: "unblock",
    fromMe: true,
    desc: "block a user",
    type: "whatsapp",
}, async (message, match) => {
    let jid = message.quoted ? message.reply_message.sender : message.jid;
    return await message.client.updateBlockStatus(message.reply_message.sender, "unblock");
    return await message.reply("_*unblocked*_");
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
