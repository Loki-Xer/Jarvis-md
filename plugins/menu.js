const plugins = require("../lib/utils");
const { System, isPrivate, isUrl, version, sendUrl } = require("../lib");
const { BOT_INFO, MEDIA_DATA } = require("../config");
const { uptime } = require("os");


const clockString = (duration) => {
    let seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    
    return hours + ":" + minutes + ":" + seconds;
}

System({
    pattern: "menu",
    fromMe: isPrivate,
    desc: "Show All commands",
    type: "user",
}, async (message) => {
    let [date, time] = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }).split(",");
    let menu = `╭━━━〔 ${BOT_INFO.split(';')[0]} ⁩〕━━━┈⊷\n┃⛯╭──────────────\n┃⛯│ *owner* :  ${BOT_INFO.split(';')[1]}\n┃⛯│ *user* : ${message.pushName.replace(/[\r\n]+/gm, "")}\n┃⛯│ *plugins* : ${plugins.commands.length}\n┃⛯│ *date* : ${date}\n┃⛯│ *time* : ${time}\n┃⛯│ *uptime* : ${clockString(uptime())} \n┃⛯│ *version* : ᴠ${version}\n┃⛯╰──────────────\n╰━━━━━━━━━━━━━━━┈⊷\n\n\n╭━━━━━━━━━━━━━━━┈⊷\n╽`;
    let cmnd = [], category = [];
    plugins.commands.forEach(command => {
        const cmd = command.pattern?.toString().match(/(\W*)([A-Za-züşiğ öç1234567890]*)/)?.[2];
        if (!command.dontAddCommandList && cmd) {
            const type = (command.type || "misc").toLowerCase();
            cmnd.push({ cmd, type });
            if (!category.includes(type)) category.push(type);
        }
    });
    cmnd.sort();
    category.sort().forEach(cmmd => {
        menu += `\n┃  ╭─────────────┈⊷\n┃  │  *${cmmd} ⏎*\n┃  ╰┬────────────┈⊷\n┃  ┌┤`;
        cmnd.filter(({ type }) => type == cmmd).forEach(({ cmd }) => menu += `\n┃  │ ☍  *${cmd.trim()}*`);
        menu += `\n┃  ╰─────────────┈⊷`;
    });
    menu += ` ╰━━━━━━━━━━━┈⊷\n`;
    menu += `made with 🤍`;
    const url = BOT_INFO.split(';')[2];
    if (isUrl(url)) await message.sendFromUrl(url, { caption: menu, gifPlayback: true });
    else await message.send(menu);
});

System({
    pattern: "list",
    fromMe: isPrivate,
    desc: "Show All commands",
    type: "user",
    dontAddCommandList: true,
}, async (message, match) => {
    if (match === "cmd") return;
    let menu = "\nمصنوع من🤍\n\n";
    let cmnd = plugins.commands.filter(command => !command.dontAddCommandList && command.pattern);
    cmnd = cmnd.map(command => ({
        cmd: command.pattern.toString().match(/(\W*)([A-Za-züşiğ öç1234567890]*)/)[2],
        desc: command.desc || false
    }));
    cmnd.sort((a, b) => a.cmd.localeCompare(b.cmd));
    cmnd.forEach(({ cmd, desc }, num) => {
        menu += `*${(num + 1)}. ${cmd.trim()}*\n${desc ? `*use: ${desc}*\n\n\n` : '\n\n'}`;
    });
    if (MEDIA_DATA) {
        const [title, body, thumbnail] = MEDIA_DATA.split(";");
        await message.client.sendMessage(message.jid, { text: menu, contextInfo: { externalAdReply: { title, body, thumbnailUrl: thumbnail, renderLargerThumbnail: true, mediaType: 1, mediaUrl: '', sourceUrl: "https://github.com/Loki-Xer/Jarvis-md", showAdAttribution: true } } });
    } else {
        await message.send(menu);
    }
});


System({
    pattern: "url",
    fromMe: isPrivate,
    desc: "make media into url",
    type: "converter",
}, async (message, match, m) => {
    if (!message.reply_message.i || (!message.reply_message.image && !message.reply_message.video && !message.reply_message.audio && !message.reply_message.sticker)) return await message.reply('*Reply to image,video,audio,sticker*');
    return await sendUrl(message);
});
