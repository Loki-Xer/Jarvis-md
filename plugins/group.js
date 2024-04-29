/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const {
    isUrl,
    sleep,
    System,
    isAdmin,
    isPrivate,
    parsedJid,
    warnMessage,
    extractUrlFromMessage,
} = require("../lib/");

const isBotAdmins = async (message) => {
	const groupMetadata = await message.client.groupMetadata(message.chat)
	const admins = await groupMetadata.participants.filter(v => v.admin !== null).map(v => v.id)
	return admins.includes(message.user_id)
}

System({
    pattern: 'add ?(.*)',
    type: 'group',
    fromMe: true,
    desc: "add a person to group"
}, async (message, match) => {
    if (!message.isGroup) return;
    match = message.reply_message.sender || match;
    let isadmin = await isAdmin(message, message.user.jid);
    if (!isadmin) return await message.send("_I'm not admin_");
    if (!match) return await message.send("_Mention user to add");
    match = match.replaceAll(' ', '');
    if (match) {
        let users = match.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        let info = await message.client.onWhatsApp(users);
        ex = info.map((jid) => jid.jid);
        if (!ex.includes(users)) return await message.reply('h');
        const su = await message.client.groupParticipantsUpdate(message.jid, [users], "add");
        if (su[0].status == 403) {
            await message.reply("_Couldn\'t add. Invite sent!_");
            return await message.sendGroupInviteMessage(users);
        } else if (su[0].status == 408) {
            await message.send(`Couldn\'t add @${users.split("@")[0]} because they left the group recently. group Invitation sent!`, {
                mentions: [users]
            });
            const code = await message.client.groupInviteCode(message.jid);
            return await message.client.sendMessage(users, { text: `https://chat.whatsapp.com/${code}` }); 
        } else if (su[0].status == 401) {
            return await message.send(`Couldn\'t add @${users.split("@")[0]} because they blocked the bot number.`, {
                mentions: [users]
            });
        } else if (su[0].status == 200) {
            return await message.send(`@${users.split("@")[0]}, Added to the group.`, {
                mentions: [users]
            });
        } else if (su[0].status == 409) {
            return await message.send(`@${users.split("@")[0]}, Already in the group.`, {
                mentions: [users]
            });
        } else {
            return await message.reply(JSON.stringify(su));
        }
    }
});


System({
	pattern: "kick$",
	fromMe: true,
	desc: "kicks a person from group",
	type: "group",
}, async (message, match) => {
	if (!message.isGroup)
	return await message.send("_This command is for groups_");
	match = message.mention.jid?.[0] || message.reply_message.sender || match
	if (!match) return await message.send("_Mention user to kick");
	let isadmin = await isAdmin(message, message.user.jid);
	if (!isadmin) return await message.send("_I'm not admin_");
	const jid = parsedJid(match)
	await await message.client.groupParticipantsUpdate(message.jid, jid, "remove");
	return await message.client.sendMessage(message.chat, {text: `_@${jid[0].split("@")[0]} kicked successfully_`, mentions: jid, });
});

System({
	pattern: "promote$",
	fromMe: true,
	desc: "promote a member",
	type: "group",
}, async (message, match) => {
	if (!message.isGroup)
	return await message.send("_This command is for groups_");
	match = message.mention.jid?.[0] || message.reply_message.sender || match
	if (!match) return await message.send("_Mention user to promote_");
	let isadmin = await isAdmin(message, message.user.jid);
	if (!isadmin) return await message.send("_I'm not admin_");
	let jid = parsedJid(match);
	await await message.client.groupParticipantsUpdate(message.jid, jid, "promote");
	return await message.client.sendMessage(message.chat, {text: `_@${jid[0].split("@")[0]} promoted as admin successfully_`, mentions: jid, });
});


System({
	pattern: "demote$",
	fromMe: true,
	desc: "demote a member",
	type: "group",
}, async (message, match) => {
	if (!message.isGroup)
	return await message.send("_This command is for groups_");
	match = message.mention.jid?.[0] || message.reply_message.sender || match
	if (!match) return await message.send("_Mention user to demote");
	let isadmin = await isAdmin(message, message.user.jid);
	if (!isadmin) return await message.send("_I'm not admin_");
	let jid = parsedJid(match);
	await await message.client.groupParticipantsUpdate(message.jid, jid, "demote");
	return await message.client.sendMessage(message.chat, {text: `_@${jid[0].split("@")[0]} demoted from admin successfully_`, mentions: jid, });
});


System({
    pattern: 'invite ?(.*)',
    fromMe: true,
    desc: "Provides the group's invitation link.",
    type: 'group'
}, async (message) => {
    if (!message.isGroup) return await message.reply("_This command is for groups_");
    let isadmin = await isAdmin(message, message.user.jid);
    if (!isadmin) return await message.send("_I'm not admin_");
    const data = await message.client.groupInviteCode(message.jid);
    return await message.reply(`https://chat.whatsapp.com/${data}`);
});


System({
	pattern: "mute",
	fromMe: true,
	desc: "nute group",
	type: "group",
}, async (message) => {
	if (!message.isGroup)
	return await message.send("_This command is for groups_");
	let isadmin = await isAdmin(message, message.user.jid);
	if (!isadmin) return await message.send("_I'm not admin_");
	const mute = await message.send("_Muting Group_");
	await sleep(500);
	await message.client.groupSettingUpdate(message.jid, "announcement");
	return await mute.edit("_Group Muted successfully_");
});

System({
	pattern: "unmute",
	fromMe: true,
	desc: "unmute group",
	type: "group",
}, async (message) => {
	if (!message.isGroup)
	return await message.send("_This command is for groups_");
	let isadmin = await isAdmin(message, message.user.jid);
	if (!isadmin) return await message.send("_I'm not admin_");
	const mute = await message.send("_Unmuting Group_");
	await sleep(500);
	await message.client.groupSettingUpdate(message.jid, "not_announcement");
	return await mute.edit("_Group Unmuted successfully_");
});

System({
	pattern: "kickall",
	fromMe: true,
	desc: "Adds a person to group",
	type: "group",
}, async (message) => {
	let { participants } = await message.client.groupMetadata(message.jid);
	let isadmin = await isAdmin(message, message.user.jid);
	if (!isadmin) return await message.send("_I'm not admin_");
        for (let key of participants) {
	let jid = parsedJid(key.id);
	await await message.client.groupParticipantsUpdate(message.jid, jid, "remove");
	return await message.client.sendMessage(message.chat, {text: `_@${jid[0].split("@")[0]} kicked successfully_`, mentions: jid, });
}});


System({
    pattern: "tag",
    fromMe: true,
    desc: "mention all users in the group",
    type: "group",
}, async (message, match) => {
    if (!message.isGroup) return;   
    const { participants } = await message.client.groupMetadata(message.from).catch(e => {});
    let admins = await participants.filter(v => v.admin !== null).map(v => v.id);
    let msg = "";
    if (match === "all" || match === "everyone") {
        for (let i = 0; i < participants.length; i++) {
            msg += `${i + 1}. @${participants[i].id.split('@')[0]}\n`;
        }
        await message.send(msg, { mentions: participants.map(a => a.id) });
    } 
    else if (match === "admin" || match === "admins") {
        for (let i = 0; i < admins.length; i++) {
            msg += `${i + 1}. @${admins[i].split('@')[0]}\n`;
        }
        return await message.send(msg, { mentions: participants.map(a => a.id) });
    } 
    else if (match === "me" || match === "mee") {
        await message.client.sendMessage(message.chat, { text: `@${message.sender.split("@")[0]}`, mentions: [message.sender] });
    } 
    else if (match || message.reply_message.text) {
        match = match || message.reply_message.text;
        if (!match) return await message.reply('*Example :* \n_*tag all*_\n_*tag admin*_\n_*tag text*_\n_*Reply to a message*_');
        await message.send(match, { mentions: participants.map(a => a.id) });
    } 
    else if (message.reply_message.i) {
        return await message.client.forwardMessage(message.jid, message.reply_message, { contextInfo: { mentionedJid: participants.map(a => a.id) } });
    } 
    else {
        return await message.reply('*Example :* \n_*tag all*_\n*_tag admin*_\n*_tag text*_\n_*Reply to a message*_');
    }
});



System({
	pattern: "gpp$",
	fromMe: true,
	desc: "Set full-screen profile picture",
	type: "group",
}, async (message) => {
    if (!message.isGroup) { return await message.send("_This command is for groups_"); }
    let isadmin = await isAdmin(message, message.user.jid);
    if (!isadmin) { return await message.send("_I'm not an admin_"); }
    if (!message.reply_message.image) { return await message.send("_Reply to a photo_"); }
    try { const media = await message.reply_message.download();
    await message.client.updateProfile(media, message.jid);
    return await message.send("_Group Profile Picture Updated_"); } catch (error) {
    console.error("Error updating profile picture:", error);
    return await message.send("_Failed to update profile picture_");
}});

System({
    pattern: 'revoke ?(.*)',
    fromMe: true,
    desc: "Revoke Group invite link.",
    type: 'group'
}, async (message) => {
    if (!message.isGroup)
    return await message.reply("_This command is for groups_");
    let isadmin = await isAdmin(message, message.user.jid);
    if (!isadmin) return await message.send("_I'm not admin_");
    await message.client.groupRevokeInvite(message.jid)
    await message.send('_Revoked_');
});

System({
    pattern: 'join ?(.*)',
    fromMe: true,
    desc: "to join a group",
    type: 'group'
}, async (message, match) => {
   match = match || message.reply_message.text;
   if(!match) return await message.send('_Enter a valid group link!_');
   if(!isUrl(match)) return await message.send('_Enter a valid group link!_');
   const matchUrl = extractUrlFromMessage(match);
   if(!matchUrl) return await message.send('_Enter a valid group link!_');
   if (matchUrl && matchUrl.includes('chat.whatsapp.com')) {
       const groupCode = matchUrl.split('https://chat.whatsapp.com/')[1];
       const joinResult = await message.client.groupAcceptInvite(groupCode);
       if (joinResult) return await message.reply('_Joined!_'); 
           await message.reply('_Invalid Group Link!_'); 
   } else {
       await message.reply('_Invalid Group Link!_'); 
   }
});

System({
	pattern: 'left ?(.*)',
	fromMe: true,
	desc: 'Left from group',
	type: 'group'
}, async (message) => {
    if (!message.isGroup) return await message.reply("_This command is for groups_");
    await message.client.groupLeave(message.jid);
});

System({
    pattern: 'lock ?(.*)',
    fromMe: true,
    desc: "only allow admins to modify the group's settings",
    type: 'group'
}, async (message, match) => {
    if (!message.isGroup)
    return await message.reply("_This command is for groups_");
    let isadmin = await isAdmin(message, message.user.jid);
    if (!isadmin) return await message.send("_I'm not admin_");
    const meta = await message.client.groupMetadata(message.chat)
    if (meta.restrict) return await message.send("_Already only admin can modify group settings_")
    await client.groupSettingUpdate(message.jid, 'locked')
    return await message.send("*Only admin can modify group settings*")
});

System({
    pattern: 'unlock ?(.*)',
    fromMe: true,
    desc: "allow everyone to modify the group's settings -- like display picture etc.",
    type: 'group'
}, async (message, match) => {
    if (!message.isGroup)
    return await message.reply("_This command is for groups_");
    let isadmin = await isAdmin(message, message.user.jid);
    if (!isadmin) return await message.send("_bot not admin_");
    const meta = await message.client.groupMetadata(message.jid);
    if (!meta.restrict) return await message.send("_Already everyone can modify group settings_")
    await message.client.groupSettingUpdate(message.jid, 'unlocked')
    return await message.send("*Everyone can modify group settings*")
});


System({
    pattern: 'gname ?(.*)',
    fromMe: true,
    desc: "To change the group's subject",
    type: 'group'
}, async (message, match, client) => {
    match = match || message.reply_message.text
    if (!message.isGroup) return await message.reply("_This command is for groups_");
    if (!match) return await message.send('*Need Subject!*\n*Example: gname New Subject!*.')
    const meta = await message.client.groupMetadata(message.chat)
    if (!meta.restrict) {
      await message.client.groupUpdateSubject(message.chat, match)
      return await message.send("*Subject updated*") 
    }
    const isbotAdmin = await isBotAdmins(message)
    if (!isbotAdmin) return await message.send("I'm not an admin")
    await client.groupUpdateSubject(message.chat, match)
    return await message.send("*Subject updated*")
})


System({
    pattern: 'gdesc ?(.*)',
    fromMe: true,
    desc: "To change the group's description",
    type: 'group'
}, async (message, match, client) => {
    match = match || message.reply_message.text
    if (!message.isGroup)
    return await message.reply("_This command is for groups_");
    if (!match) return await message.send('*Need Description!*\n*Example: gdesc New Description!*.')
    const meta = await message.client.groupMetadata(message.jid);
    if (!meta.restrict) {
    await message.client.groupUpdateDescription(message.jid, match)
    return await message.send("_*Description updated*_")
    } const isbotAdmin = await isBotAdmins(message.data)
    if (!isbotAdmin) return await message.send("_I'm not an admin_")
    await message.client.groupUpdateDescription(message.jid, match)
    return await message.send("_*Description updated*_")
})

System({
    pattern: 'gjid ?(.*)',
    fromMe: true,
    desc: "To get group jid",
    type: 'group'
}, async (message, match, client) => {
    match = match || message.reply_message.text
    if (!message.isGroup) return await message.reply("_This command is for groups_");
    let { participants } = await message.client.groupMetadata(message.jid);
    let participant = participants.map((u) => u.id);
    let str = " *Group Jids* \n\n";
    participant.forEach((result) => { str += ` ${result}\n`; });
    await message.reply(str);
});

System({
    pattern: 'ginfo ?(.*)',
    fromMe: true,
    desc: 'Shows group invite info',
    type: 'group'
}, async (message, match) => {
    match = match || message.reply_message.text
    if (!match) return await message.reply('*Need Group Link*\n_Example : ginfo group link_')
    const [link, invite] = match.match(/chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i) || []
    if (!invite) return await message.reply('*Invalid invite link*')
    try { const response = await message.client.groupGetInviteInfo(invite)
    await message.send("id: " + response.id + "\nsubject: " + response.subject + "\nowner: " + `${response.owner ? response.owner.split('@')[0] : 'unknown'}` + "\nsize: " + response.size + "\nrestrict: " + response.restrict + "\nannounce: " + response.announce + "\ncreation: " + require('moment-timezone')(response.creation * 1000).tz('Asia/Kolkata').format('DD/MM/YYYY HH:mm:ss') + "\ndesc" + response.desc)
    } catch (error) {
    await message.reply('*Invalid invite link*') }
})

System({
    pattern: "create",
    fromMe: true,
    desc: "to create a group",
    type: "group",
}, async (m, match) => {
    let gName = match || m.pushName;
    if (!m.reply_message.sender) return m.reply("_reply to a user_");
    const group = await m.client.groupCreate(gName, [m.reply_message.sender, m.sender]);
    await m.send("_Group successfully created_ ");
});

System({
	pattern: "warn",
	fromMe: true,
	desc: "Warn a user",
	type: "group",
}, async (message, match) => {
        let user = message.reply_message?.sender || message.mention?.jid?.[0];
	const jid = parsedJid(user);
	if (!user) return message.reply("_Reply to someone's message to warn or to reset warn reply to a user and type *warn reset*_");
	let isBotAdmin = await isAdmin(message, message.user.jid);
	if(!isBotAdmin) return await message.send("_I'm not admin_");
	let userIsAdmin = await isAdmin(message, user);
	if(userIsAdmin) return await message.client.sendMessage(message.chat, { text: `_user is admin @${jid[0].split("@")[0]}_`, mentions: jid });
        await warnMessage(message, match, user)
})
