/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const Heroku = require("heroku-client");
const { version } = require("../package.json");
const { System, isPrivate, updateBot, tiny, redeploy, getvar, sleep, delvar, getallvar, change_env, get_deployments, getJson } = require("../lib/");
const Config = require("../config");
const { SUDO } = require("../config");
const heroku = new Heroku({ token: Config.HEROKU_API_KEY });
const baseURI = "/apps/" + Config.HEROKU_APP_NAME;
const simpleGit = require("simple-git");
const git = simpleGit();
const exec = require("child_process").exec;



System({
    pattern: "shutdown",
    fromMe: true,
    type: "server",
    desc: "Heroku Dyno off",
}, async (message) => {
    const server = message.client.server;
    if (server !== "heroku") return await message.reply("_shutdown only works in Heroku_");    
    await heroku.get(baseURI + "/formation").then(async (formation) => {
    await message.send(`_Jarvis is shutting down..._`);
    await heroku.patch(baseURI + "/formation/" + formation[0].id, { body: { quantity: 0 }, });
    }).catch(async (error) => {
        await message.send(`HEROKU: ${error.body.message}`);
    });
});



System({
    pattern: "setvar ",
    fromMe: true,
    type: "server",
    desc: "Set environment variable",
},
async (message, match) => {
    const server = message.client.server;
    if (!match) return await message.send(`Example: .setvar SUDO:917025673121`); 
    const key = match.slice(0, match.indexOf(':')).trim();
    const value = match.slice(match.indexOf(':') + 1).trim();
    if (!key || !value) return await message.send(`Example: .setvar SUDO:917025673121`); 
    if (server !== "heroku" && server !== "koyeb") return await message.reply("_setvar only works in Heroku or Koyeb_");
    if (server === "heroku") {
        await heroku.patch(baseURI + "/config-vars", {
            body: {
                [key.toUpperCase()]: value,
            },
        })
        .then(async () => {
            await message.send(`${key.toUpperCase()}: ${value}`);
        })
        .catch(async (error) => {
            await message.send(`HEROKU: ${error.body.message}`);
        });
    } else if (server === "koyeb") {
        let check = await get_deployments();
        if (check === 'true')
            return await message.reply('_Please wait..._\n_Currently 2 instances are running in Koyeb, wait to stop one of them._');
        let data = await change_env(match);
        return await message.reply(data);
    }
});



System({
    pattern: "delvar ",
    fromMe: true,
    type: "server",
    desc: "Delete environment variable",
},
async (message, match) => {
    const server = message.client.server;
    if (!match) return await message.send("_Example: delvar sudo_");
    if (server !== "heroku" && server !== "koyeb") return await message.reply("_delvar only works in Heroku or Koyeb_")
    if (server === "heroku") {
        heroku
            .get(baseURI + "/config-vars")
            .then(async (vars) => {
                const key = match.trim().toUpperCase();

                if (vars[key]) {
                    await heroku.patch(baseURI + "/config-vars", {
                        body: {
                            [key]: null,
                        },
                    });

                    return await message.send(`_Deleted ${key}_`);
                }

                await message.send(`_${key} not found_`);
            })
            .catch(async (error) => {
                await message.send(`*HEROKU: ${error.body.message}*`);
            });
    } else if (server === "koyeb") {
        let check = await get_deployments();
        if (check === 'true')
            return await message.reply('_Please wait..._\n_Currently 2 instances are running in Koyeb, wait to stop one of them._');
        
        let data = await delvar(match);
        return await message.reply(data);
    }
});



System({
    pattern: "allvar",
    fromMe: true,
    type: "server",
    desc: "all environment variables",
}, async (message) => {
    const server = message.client.server;
    if (server !== "heroku" && server !== "koyeb") {
        await message.reply("_allvar only works in Heroku or Koyeb_");
        return;
    }
    
    if (server === "heroku") {
        let msg = "Here are all your Heroku vars\n\n\n";

        try {
            const keys = await heroku.get(baseURI + "/config-vars");

            for (const key in keys) {
                msg += `${key} : ${keys[key]}\n\n`;
            }

            await message.send(msg);
        } catch (error) {
            await message.send(`HEROKU: ${error.message}`);
        }
    } else if (server === "koyeb") {
        let msg = "Here are all your Koyeb vars\n\n";
        let data = await getallvar();
        return await message.reply(msg + data);
    }
});



System({
    pattern: "getvar ",
    fromMe: true,
    type: "server",
    desc: "Show env",
}, async (message, match) => {
    const server = message.client.server;
    if (!match) return await message.send(`_Example: getvar sudo_`);
    
    if (server !== "heroku" && server !== "koyeb") {
        await message.reply("_getvar only works in Heroku or Koyeb_");
        return;
    }
    
    if (server === "heroku") {
        const key = match.trim().toUpperCase();
        
        heroku
            .get(baseURI + "/config-vars")
            .then(async (vars) => {
                if (vars[key]) {
                    return await message.send(`_${key} : ${vars[key]}_`);
                }
                await message.send(`${key} not found`);
            })
            .catch(async (error) => {
                await message.send(`HEROKU: ${error.body.message}`);
            });
    } else if (server === "koyeb") {
        let data = await getvar(match);
        return await message.reply(data);
    }
});



System({
    pattern: "getsudo ?(.*)", 
    fromMe: true, 
    desc: "shows sudo", 
    type: "server" 
 }, async (message, match) => {
    const server = message.client.server;
    await message.send("_*SUDO NUMBER'S ARA :*_ "+"```"+config.SUDO+"```")
  });



System({
    pattern: "setsudo ?(.*)", 
    fromMe: true, 
    desc: "set sudo", 
    type: "server" 
}, async (message, match, m) => {
    const server = message.client.server;
    var newSudo = (message.mention[0] || message.reply_message.sender).split("@")[0];
    
    if (!newSudo)
        return await m.reply("*reply to a number*");

    var setSudo = (Config.SUDO + "," + newSudo).replace(/,,/g, ",");
    setSudo = setSudo.startsWith(",") ? setSudo.replace(",", "") : setSudo;
    
    if (server !== "heroku" && server !== "koyeb") {
        await message.send("setsudo only works in Heroku or Koyeb");
        return;
    }
    
    if (server === "heroku") {
        await heroku.patch(baseURI + "/config-vars", { body: { SUDO: setSudo } })
            .then(async (app) => {
                await message.reply("*new sudo numbers are :* " + setSudo);
                await message.reply("_It takes 30 seconds to take effect_");
            });
    } else if (server === "koyeb") {
        let check = await get_deployments();
        if (check === 'true')
            return await message.reply('_Please wait..._\n_Currently 2 instances are running in Koyeb, wait to stop one of them._');
        
        let data = await change_env("SUDO:" + setSudo);
        await message.reply("*new sudo numbers are :* " + setSudo);
        await message.reply("_It takes 30 seconds to take effect_");
    }
});



System({
    pattern: "update",
    fromMe: true,
    type: "server",
    desc: "Checks for update.",
},
async (message, match) => {
    const server = message.client.server;
    await git.fetch();
    var commits = await git.log([
        Config.BRANCH + "..origin/" + Config.BRANCH,
    ]);

    if (match == "now") {
        if (commits.total === 0) {
            return await message.send(`_Jarvis is on the latest version: v${version}_`);
        } else {
            if (server === "heroku") {
                await updateBot(message);
            } else if (server === "koyeb") {
                await message.send("_*Building started 𐍮*_")
                let check = await get_deployments();
                if (check === 'true') return citel.reply('_Please wait..._\n_Currently 2 instances are running in Koyeb, wait to stop one of them._');
                let data = await redeploy();
                return await message.reply("updateing started");
            } else {
                await require("simple-git")().reset("hard", ["HEAD"]);
                await require("simple-git")().pull();
                await message.send("_Successfully updated. Please manually update npm modules if applicable!_");
            }
        }
    } else if (commits.total === 0) {
            return await message.send(`_Jarvis is on the latest version: v${version}_`);
        } else {
        var availupdate = "*Updates available for Jarvis-md* \n\n";
        commits["all"].map((commit, num) => {
            availupdate += num + 1 + " ●  " + tiny(commit.message) + "\n";
        });

        return await message.client.sendMessage(message.jid, {
            text: `${availupdate}\n\n _type *${Config.HANDLERS} update now*_`
        });
    }
});



System({
    pattern: "restart",
    fromMe: true,
    desc: "for restart bot",
    type: "server",
}, async (message, match, m) => {
    const server = message.client.server;
    await message.send("_*Restarting*_");
    if (server === "heroku") {
        await heroku.delete(baseURI + "/dynos").catch(async (error) => {
            await message.sendMessage(`HEROKU : ${error.body.message}`);
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
    pattern: "mode ",
    fromMe: true,
    type: "server",
    desc: "change work type",
},
async (message, match) => {
    const server = message.client.server;
    if (!match)
        return await message.sendPollMessage({ name: "Choose mode to change mode", values: [{ displayText: "private", id: "mode private"}, { displayText: "public", id: "mode public"}], onlyOnce: true, withPrefix: true, participates: [message.sender] });
   
if (!match === "private" || !match === "public") 
    return await message.sendPollMessage({ name: "Choose mode to change mode", values: [{ displayText: "private", id: "mode private"}, { displayText: "public", id: "mode public"}], onlyOnce: true, withPrefix: true, participates: [message.sender] });
    

    const key = "WORK_TYPE";
    const value = match;
    
    if (!key || !value)
        return await message.sendPollMessage({ name: "Choose mode to change mode", values: [{ displayText: "private", id: "mode private"}, { displayText: "public", id: "mode public"}], onlyOnce: true, withPrefix: true, participates: [message.sender] });
    
    if (server !== "heroku" && server !== "koyeb") {
        return await message.reply("_*Mod cmd only works in Heroku or Koyeb*_");
    }
    
    if (server === "heroku") {
        await heroku.patch(baseURI + "/config-vars", {
            body: {
                [key.toUpperCase()]: value,
            },
        })
        .then(async () => {
            await message.send(`_*Work type change to ${value}*_`);
        })
        .catch(async (error) => {
            await message.send(`HEROKU: ${error.body.message}`);
        });
    } else if (server === "koyeb") {
        let check = await get_deployments();
        if (check === 'true')
        return await message.reply('_Please wait..._\n_Currently 2 instances are running in Koyeb, wait to stop one of them._');
        let data = await change_env(`WORK_TYPE: ${match}`);
        return await message.reply(`_*Work type change to ${value}*_`);
    }
});