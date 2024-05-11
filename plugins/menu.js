const plugins = require("../lib/utils");
const { System, isPrivate, isUrl, version } = require("../lib");
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
    type: "info",
    dontAddCommandList: true,
}, async (message) => {
    let [date, time] = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }).split(",");
    let menu = `╭━━━〔 ${BOT_INFO.split(';')[0]} ⁩〕━━━┈⊷\n┃⛯╭──────────────\n┃⚆│ *ᴏᴡɴᴇʀ* :  ${BOT_INFO.split(';')[1]}\n┃⚆│ *ᴜꜱᴇʀ* : ${message.pushName.replace(/[\r\n]+/gm, "")}\n┃⚆│ *ᴘʟᴜɢɪɴꜱ* : ${plugins.commands.length}\n┃⚆│ *ᴅᴀᴛᴇ* : ${date}\n┃⚆│ *ᴛɪᴍᴇ* : ${time}\n┃⚆│ *ᴜᴘᴛɪᴍᴇ* : ${clockString(uptime())} \n┃⚆│ *ᴠᴇʀꜱɪᴏɴ* : ᴠ${version}\n┃⛯╰──────────────\n╰━━━━━━━━━━━━━━━┈⊷\n\n\n╭━━━━━━━━━━━━━━━┈⊷\n╽`;
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
        menu += `\n┃  ╭─────────────┈⊷\n┃  │  *${cmmd} ➻*\n┃  ╰┬────────────┈⊷\n┃  ┌┤`;
        cmnd.filter(({ type }) => type == cmmd).forEach(({ cmd }) => menu += `\n┃  │ •  *${cmd.trim()}*`);
        menu += `\n┃  ╰─────────────┈⊷`;
    });
    menu += ` ╰━━━━━━━━━━━┈⊷\n`;
    menu += ``;
    const url = BOT_INFO.split(';')[2];
    if (isUrl(url)) await message.sendFromUrl(url, { caption: menu, gifPlayback: true });
    else await message.send(menu);
});

System({
    pattern: "list",
    fromMe: isPrivate,
    desc: "Show All commands",
    type: "info"
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
        await message.client.sendMessage(message.jid, { text: menu, contextInfo: { externalAdReply: { title, body, thumbnailUrl: thumbnail, renderLargerThumbnail: true, mediaType: 1, mediaUrl: '', sourceUrl: "", showAdAttribution: true } } });
    } else {
        await message.send(menu);
    }
});
