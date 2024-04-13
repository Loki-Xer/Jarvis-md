/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const { System, updateProfilePicture } = require("../lib");


System({
	pattern: "setpp",
	fromMe: true,
	desc: "Set profile picture",
	type: "user",
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
	type: "user",
}, async (message, match) => {
	return await message.send( message.mention.jid?.[0] || message.reply_message.jid || message.jid);
});

System({
	pattern: "pp$",
	fromMe: true,
	desc: "Set full screen profile picture",
	type: "user",
}, async (message, match) => {
	if (!message.reply_message.image)
	return await message.reply("_Reply to a photo_");
	let media = await message.reply_message.download();
	await updateProfilePicture(media, message, message.user.jid);
	return await message.reply("_Profile Picture Updated_");
});


System({
    pattern: "dlt",
    fromMe: true,
    desc: "deletes a message",
    type: "user",
}, async (message) => {
    await message.client.sendMessage(message.chat, { delete: message.reply_message });
});

System({
    pattern: "privacy",
    fromMe: true,
    desc: "To change privacy of WhatsApp",
    type: "user"
}, async (message, match) => {
    let responseMessage;

    switch (match) {
        case "lastseenEveryone":
            await message.updateLastSeen("all");
            responseMessage = "_*Last seen privacy updated to everyone*_";
            break;
        case "lastseenNobody":
            await message.updateLastSeen("none");
            responseMessage = "_*Last seen privacy updated to nobody*_";
            break;
        case "lastseenMyContactsExcept":
            await message.updateLastSeen("contact_blacklist");
            responseMessage = "_*Last seen privacy updated to my contacts except*_";
            break;
        case "lastseenMyContacts":
            await message.updateLastSeen("contacts");
            responseMessage = "_*Last seen privacy updated to my contacts*_";
            break;
        case "lastseen":
            await message.sendPollMessage({ name: "\nChoose one to update last seen privacy\n", values: [{ displayText: "everyone", id: "privacy lastseenEveryone" }, { displayText: "nobody", id: "privacy lastseenNobody" }, { displayText: "my contacts except", id: "privacy lastseenMyContactsExcept" }, { displayText: "my contacts", id: "privacy lastseenMyContacts" }, { displayText: "Online privacy", id: "Onlineprivacy" }, { displayText: "home", id: "privacy" }], withPrefix: true, participates: [message.sender] });
            return;
        case "ppsettingsEveryone":
            await message.updatePpSettings("all");
            responseMessage = "_*Profile picture privacy updated to everyone*_";
            break;
        case "ppsettingsNobody":
            await message.updatePpSettings("none");
            responseMessage = "_*Profile picture privacy updated to nobody*_";
            break;
        case "ppsettingsContactsExcept":
            await message.updatePpSettings("contact_blacklist");
            responseMessage = "_*Profile picture privacy updated to my contacts except*_";
            break;
        case "ppsettingsContacts":
            await message.updatePpSettings("contacts");
            responseMessage = "_*Profile picture privacy updated to my contacts*_";
            break;
        case "ppsettings":
            await message.sendPollMessage({ name: "\nChoose one to update profile picture privacy", values: [{ displayText: "everyone", id: "privacy ppsettingsEveryone" }, { displayText: "nobody", id: "privacy ppsettingsNobody" }, { displayText: "my contacts except", id: "privacy ppsettingsContactsExcept" }, { displayText: "my contacts", id: "privacy ppsettingsContacts" }, { displayText: "home", id: "privacy" }], withPrefix: true, participates: [message.sender] });
            return;
        case "statusPrivacyEveryone":
            await message.updateStatusPrivacy("all");
            responseMessage = "_*Status privacy updated to everyone*_";
            break;
        case "statusPrivacyNobody":
            await message.updateStatusPrivacy("none");
            responseMessage = "_*Status privacy updated to nobody*_";
            break;
        case "statusPrivacyMyContactsExcept":
            await message.updateStatusPrivacy("contact_blacklist");
            responseMessage = "_*Status privacy updated to my contacts except*_";
            break;
        case "statusPrivacyMyContacts":
            await message.updateStatusPrivacy("contacts");
            responseMessage = "_*Status privacy updated to my contacts*_";
            break;
        case "statusPrivacy":
            await message.sendPollMessage({ name: "Choose one to update status privacy\n", values: [{ displayText: "everyone", id: "privacy statusPrivacyEveryone" }, { displayText: "nobody", id: "privacy statusPrivacyNobody" }, { displayText: "my contacts except", id: "privacy statusPrivacyMyContactsExcept" }, { displayText: "my contacts", id: "privacy statusPrivacyMyContacts" }, { displayText: "home", id: "privacy" }], withPrefix: true, participates: [message.sender] });
            return;
        case "ReadReceiptsprivacyNobody":
            await message.updateReadReceipts("none");
            responseMessage = "_*Read Receipts privacy updated to nobody*_";
            break;
        case "ReadReceiptsprivacyEveryone":
            await message.updateReadReceipts("all");
            responseMessage = "_*Read Receipts privacy updated to everyone*_";
            break;
        case "ReadReceiptsprivacy":
            await message.sendPollMessage({ name: "Choose one to update Read Receipts privacy\n", values: [{ displayText: "everyone", id: "privacy ReadReceiptsprivacyEveryone" }, { displayText: "nobody", id: "privacy ReadReceiptsprivacyNobody" }, { displayText: "home", id: "privacy" }], withPrefix: true, participates: [message.sender] });
            return;
        case "GroupsAddprivacyEveryone":
            await message.groupsAddingPrivacy("all");
            responseMessage = "_*Groups Add privacy updated to everyone*_";
            break;
        case "GroupsAddprivacyNobody":
            await message.groupsAddingPrivacy("none");
            responseMessage = "_*Groups Add privacy updated to nobody*_";
            break;
        case "GroupsAddprivacyMyContactsExcept":
            await message.groupsAddingPrivacy("contact_blacklist");
            responseMessage = "_*Groups Add privacy updated to my contacts except*_";
            break;
        case "GroupsAddprivacyMyContacts":
            await message.groupsAddingPrivacy("contacts");
            responseMessage = "_*Groups Add privacy updated to my contacts*_";
            break;
        case "GroupsAddprivacy":
            await message.sendPollMessage({ name: "\nChoose one to update Groups Add privacy\n", values: [{ displayText: "everyone", id: "privacy GroupsAddprivacyEveryone" }, { displayText: "nobody", id: "privacy GroupsAddprivacyNobody" }, { displayText: "my contacts except", id: "privacy GroupsAddprivacyMyContactsExcept" }, { displayText: "my contacts", id: "privacy GroupsAddprivacyMyContacts" }, { displayText: "home", id: "privacy" }], withPrefix: true, participates: [message.sender] });
            return;
        case "disappearingfirst":
            await message.updateDisappearingMsg("86400");
            responseMessage = "_*Disappearing Mode updated to 24 hour*_";
            break;
        case "disappearingtwos":
            await message.updateDisappearingMsg("604800");
            responseMessage = "_*Disappearing Mode updated to 7 days*_";
            break;
        case "disappearingoff":
            await message.updateDisappearingMsg("0");
            responseMessage = "_*Disappearing Mode off*_";
            break;
        case "disappearingnine":
            await message.updateDisappearingMsg("7776000");
            responseMessage = "_*Disappearing Mode updated to 90 days*_";
            break;
        case "disappearing":
            await message.sendPollMessage({ name: "\nChoose one to update disappearing message privacy\n", values: [{ displayText: "24 hour", id: "privacy disappearingfirst" }, { displayText: "7 days", id: "privacy disappearingtwos" }, { displayText: "90 days", id: "privacy disappearingnine" }, { displayText: "off", id: "privacy disappearingoff" }, { displayText: "home", id: "privacy" }], withPrefix: true, participates: [message.sender] });
            return;
        case "Onlineprivacyall":
            await message.onlineLastSeen("all");
            responseMessage = "_*Online privacy updated to every one*_";
            break;
        case "OnlineprivacyMatchas":
            await message.onlineLastSeen("match_last_seen");
            responseMessage = "_*Online privacy updated to same as last seen*_";
            break;
        case "Onlineprivacy":
            await message.sendPollMessage({ name: "\nChoose one to update Online privacy settings\n", values: [{ displayText: "everyone", id: "privacy Onlineprivacyall" }, { displayText: "same as last seen", id: "privacy OnlineprivacyMatchas" }, { displayText: "home", id: "privacy" }], withPrefix: true, participates: [message.sender] });
            return;
        case "mydatasettings":
            const { readreceipts, profile, status, online, last, groupadd, calladd } = await message.getSettings(message.user.id);
            const name = await message.getName(message.user.id);
            const cap = `*♺ My Privacy*\n\n*Name:* ${name}\n*Online:* ${online}\n*Profile:* ${profile}\n*Last Seen:* ${last}\n*Read Receipts:* ${readreceipts}\n*Group Add Settings:* ${groupadd}\n*Call Add Settings:* ${calladd}`;
            await message.client.sendMessage(message.chat, { image: { url: await message.getPP(message.user.id) }, caption: cap });
            return;
        default:
            await message.sendPollMessage({ name: "\nChoose one setting to continue\n", values: [{ displayText: "last seen privacy", id: "privacy lastseen" }, { displayText: "profile picture privacy", id: "privacy ppsettings" }, { displayText: "status privacy", id: "privacy statusPrivacy" }, { displayText: "Read Receipts privacy", id: "privacy ReadReceiptsprivacy" }, { displayText: "Groups Add privacy", id: "privacy GroupsAddprivacy" }, { displayText: "disappearing message settings", id: "privacy disappearing" }, { displayText: "Online privacy settings", id: "privacy Onlineprivacy" }, { displayText: "my settings", id: "privacy mydatasettings" }], withPrefix: true, participates: [message.sender] });
            return;
    }
    
    await message.send(responseMessage);
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
})

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
})

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
})

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
})

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
})