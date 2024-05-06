/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const { System, sendAlive, setData, getData, isPrivate, config } = require("../lib/");  

function getUptime() {
    const duration = process.uptime();
    const seconds = Math.floor(duration % 60);
    const minutes = Math.floor((duration / 60) % 60);
    const hours = Math.floor((duration / (60 * 60)) % 24);
    return `_*Runtime: ${hours.toString().padStart(2, "0")} hours ${minutes.toString().padStart(2, "0")} minutes ${seconds.toString().padStart(2, "0")} seconds*_`;
}

async function Runtime(date) { 
    const deployedTime = new Date(date);
    const currentTime = new Date();
    const runtimeMilliseconds = currentTime - deployedTime;
    const days = Math.floor(runtimeMilliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((runtimeMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((runtimeMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((runtimeMilliseconds % (1000 * 60)) / 1000);
    return `_*Runtime: ${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds....*_`
}

System({
	pattern: "ping",
	fromMe: isPrivate,
	desc: "To check ping",
	type: "user",
}, async (message) => {
	const start = new Date().getTime();
	const ping = await message.send("*𝆺𝅥 running 𝆺𝅥*");
	const end = new Date().getTime();
	return await ping.edit("*☇ ꜱᴩᷨᴇͦᴇͭᴅ ☁ :* " + (end - start) + " *ᴍꜱ* ");
});

System({
    pattern: "vv",
    fromMe: true,
    desc: "get view ones message",
    type: "tool",
}, async (message) => {
   if (!message.reply_message.viewones) return await message.send("_*Reply to a view once*_");
   return await message.client.forwardMessage(message.chat, message.reply_message.message, { readViewOnce: true });
});

System({
   pattern: "uptime",
   fromMe: true,
   desc: "get the running time of the bot",
   type: "tool",
}, async (message) => {
    const uptime = getUptime();
    return await message.reply(uptime);
});

System({
   pattern: "runtime",
   fromMe: true,
   desc: "get the delpoyed running time of the bot",
   type: "tool",
}, async (m) => {
    const { loginData } = await getData(m.user.number);
    const runtime = await Runtime(loginData.message);
    await m.reply(runtime);
});

System({
   pattern: "reboot",
   fromMe: true,
   desc: "to reboot your bot",
   type: "user",
}, async (message, match, m) => {
    await message.reply('_Rebooting..._')
    require('pm2').restart('index.js');
});

System({
    pattern: 'alive ?(.*)',
    fromMe: isPrivate,
    desc: 'Check if the bot is alive',
    type: 'user'
},
async (message, match) => {
    const { alive } = await getData(message.user.id);
    if (match === "get" && message.sudo.includes(message.sender))
        return await message.send(alive?.message);
    if (match && message.sudo.includes(message.sender)) {
        if (await setData(message.user.id, match, "true", "alive"))
            return await message.send('_Alive Message Updated_');
        else
            return await message.send('_Error in updating_');
    }
    const data = alive ? alive.message : config.ALIVE_DATA;
    return await sendAlive(message, data);
});
