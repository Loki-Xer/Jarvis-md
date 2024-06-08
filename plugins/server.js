/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const Heroku = require("heroku-client");
const { version } = require("../package.json");
const { System, isPrivate, sleep, shell } = require("../lib/");
const Config = require("../config");
const { SUDO } = require("../config");
const heroku = new Heroku({ token: Config.HEROKU_API_KEY });
const baseURI = "/apps/" + Config.HEROKU_APP_NAME;
const simpleGit = require("simple-git");
const git = simpleGit();
const exec = require("child_process").exec;
const { gitPull, getDeployments, redeploy, updateBot } = require("./client/");

System({
    pattern: "shutdown",
    fromMe: true,
    type: "server",
    desc: "shutdown bot",
}, async (message) => {
    await message.send(`_Jarvis is shutting down..._`);
    return await shell("npm stop");
});

System({
    pattern: "setvar",
    fromMe: true,
    type: "server",
    desc: "Set environment variable",
}, async (message, match) => {
    const server = message.client.server;
    if (!match) return await message.send(`Example: .setvar SUDO:917025673121`); 
    const key = match.slice(0, match.indexOf(':')).trim();
    const value = match.slice(match.indexOf(':') + 1).trim();
    if (!key || !value) return await message.send(`_*Example: .setvar SUDO:917025673121*_`); 
    if (server !== "HEROKU") return await message.reply("_setvar only works in Heroku_");
    await message.send(`_*updated var ${key.toUpperCase()}: ${value}*`);
    heroku.patch(baseURI + "/config-vars", {
        body: {
            [key.toUpperCase()]: value,
        },
    })
});

System({
    pattern: "platform",
    fromMe: true,
    type: "server",
    desc: "Show which platform you delpoyed",
}, async (m, match) => {
    m.reply("_*" + "You ara delpoyed on " + m.client.server + "*_");
});

System({
    pattern: "delvar",
    fromMe: true,
    type: "server",
    desc: "Delete environment variable",
}, async (message, match) => {
    if (!match) return await message.send("_Example: delvar sudo_");
    if (message.client.server !== "HEROKU") return await message.reply("_*delvar only works in Heroku*_");   
    heroku.get(baseURI + "/config-vars")
        .then(async (vars) => {
            const key = match.trim().toUpperCase();
            if (vars[key]) {
                await message.send(`_Deleted ${key}_`);
                await heroku.patch(baseURI + "/config-vars", {
                    body: {
                        [key]: null,
                    },
                });
            } else {
                await message.send(`_${key} not found_`);
            }
        })
        .catch(async (error) => {
            await message.send(`*HEROKU: ${error.body.message}*`);
        });
});

System({
    pattern: "allvar",
    fromMe: true,
    type: "server",
    desc: "all environment variables",
}, async (message) => {
    delete Config.DATABASE;
    delete Config.ALIVE_DATA;
    delete Config.GOODBYE_MSG;
    delete Config.WELCOME_MSG;
    if (message.client.server !== "HEROKU") {
        delete Config.HEROKU_API_KEY;
        delete Config.HEROKU_APP_NAME;
    }
    if (message.client.server !== "KOYEB") {
        delete Config.KOYEB_API;
    }
    let s = '\n*All Your Vars*\n\n';
    for (const key in Config) {
        s += `*${key}*: ${Config[key]}\n\n`;
    }
    await message.reply(s);
});

System({
    pattern: "getvar",
    fromMe: true,
    type: "server",
    desc: "Show env",
}, async (message, match) => {
    if(!match) return message.reply("_*eg: getvar sudo*_");
    const requestedVar = match.trim().toUpperCase();
    if (Config.hasOwnProperty(requestedVar)) {
        message.reply(`*${requestedVar}*: ${Config[requestedVar]}`);
    } else {
        message.reply(`_*Variable '${requestedVar}' not found.*_`);
    }
});

System({
    pattern: "getsudo", 
    fromMe: true, 
    desc: "shows sudo", 
    type: "server" 
 }, async (message, match) => {
    await message.send("_*SUDO NUMBER'S ARA :*_ "+"```"+Config.SUDO+"```")
});

System({
    pattern: "setsudo", 
    fromMe: true, 
    desc: "set sudo", 
    type: "server" 
}, async (message, match, m) => { 
    const newSudo = (message.mention[0] || message.reply_message.sender).split("@")[0];    
    if (!newSudo) return await m.reply("*reply to a number*");
    let setSudo = (Config.SUDO + "," + newSudo).replace(/,,/g, ",");
    setSudo = setSudo.startsWith(",") ? setSudo.replace(",", "") : setSudo;   
    if (message.client.server !== "HEROKU") return await message.send("setsudo only works in Heroku");
    await message.reply("*new sudo numbers are :* " + setSudo);
    await message.reply("_It takes 30 seconds to take effect_");
    await heroku.patch(baseURI + "/config-vars", { body: { SUDO: setSudo } });
});

System({
  pattern: "delsudo ?(.*)",
  fromMe: true,
  desc: "delete sudo sudo",
  type: "server",
}, async (m, text) => {
  if (m.client.server !== "HEROKU") return await message.send("setsudo only works in Heroku");
  let sudoNumber = m.quoted? m.reply_message.sender : text;
  sudoNumber = sudoNumber.split("@")[0];
  if (!sudoNumber) return await m.send("*Need reply/mention/number*");
  let sudoList = Config.SUDO.split(",");
  sudoList = sudoList.filter((number) => number!== sudoNumber);
  let newSudoList = sudoList.join(",");
  await m.send(`NEW SUDO NUMBERS ARE: \n\`\`\`${newSudoList}\`\`\``, { quoted: m.data });
  await m.send("_IT TAKES 30 SECONDS TO MAKE EFFECT_", { quoted: m });
  await heroku
   .patch(baseURI + "/config-vars", { body: { SUDO: newSudoList } })
   .then(async (app) => {});
});

System({
    pattern: "update",
    fromMe: true,
    type: "server",
    desc: "Checks for update.",
}, async (message, match) => {
    const server = message.client.server;
    await git.fetch();
    var commits = await git.log([
        Config.BRANCH + "..origin/" + Config.BRANCH,
    ]);

    if (match == "now") {
        if (commits.total === 0) {
            return await message.send(`_Jarvis is on the latest version: v${version}_`);
        } else {
            if (server === "HEROKU") {
                await updateBot(message);
            } else if (server === "KOYEB") {
                await message.send("_*Building preparing 𐍮*_")
                let check = await getDeployments();
                if (check === 'true') return message.reply('_Please wait..._\n_Currently 2 instances are running in Koyeb, wait to stop one of them._');
                let data = await redeploy();
                return await message.reply(data);
            } else {
                await gitPull(message);
            }
        }
    } else if (commits.total === 0) {
        return await message.send(`_Jarvis is on the latest version: v${version}_`);
    } else {
        var availupdate = "*Updates available for Jarvis-md* \n\n";
        commits["all"].map((commit, num) => {
            availupdate += num + 1 + " ●  " + commit.message + "\n";
        });

        return await message.client.sendMessage(message.jid, {
            text: `${availupdate}\n\n _type *${message.prefix} update now*_`
        });
    }
});

System({
    pattern: "restart",
    fromMe: true,
    desc: "for restart bot",
    type: "server",
}, async (message, match, m) => {
    await message.send("_*Restarting*_");
    if (message.client.server === "HEROKU") {
        await heroku.delete(baseURI + "/dynos").catch(async (error) => {
            await message.send(`HEROKU : ${error.body.message}`);
        });
    } else {
        exec("pm2 restart jarvis", (error, stdout, stderr) => {
            if (error) {
                return message.send(`Error: ${error}`);
            }
            return;
        });
    }
});

System({
    pattern: "mode",
    fromMe: true,
    type: "server",
    desc: "change work type",
}, async (message, value) => {
    if (!value || !["private", "public"].includes(value)) {
    if(!message.isGroup) return message.reply("_*mode private/public*_");
    await message.send("Choose mode", {values: [{ displayText: "private", id: "mode private"}, { displayText: "public", id: "mode public"}], onlyOnce: true, withPrefix: true, participates: [message.sender] }, "poll");
    }
    if(value.toLowerCase() !== "public" && value.toLowerCase() !== "private") return;
    if (message.client.server !== "HEROKU") return await message.reply("_*Mod cmd only works in Heroku or Koyeb*_");
    await heroku.patch(baseURI + "/config-vars", { body: { ["WORK_TYPE".toUpperCase()]: value } })
        .then(async () => { await message.send(`_*Work type changed to ${value}*_`); })
        .catch(async (error) => { await message.send(`HEROKU: ${error.body.message}`); });
});
