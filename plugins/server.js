/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const Heroku = require("heroku-client");
const { version } = require("../package.json");
const { System, isPrivate, sleep } = require("../lib/");
const Config = require("../config");
const { SUDO } = require("../config");
const heroku = new Heroku({ token: Config.HEROKU_API_KEY });
const baseURI = "/apps/" + Config.HEROKU_APP_NAME;
const simpleGit = require("simple-git");
const git = simpleGit();
const exec = require("child_process").exec;
const axios = require('axios');

async function updateBot(message) {
    const commits = await git.log(['main..origin/main']);
    if (commits.total === 0) return message.send('_Jarvis is on the latest version: v${version}_');
    const app = await heroku.get('/apps/' + Config.HEROKU_APP_NAME);
    await message.send("*Updating Jarvis, please wait...*");
    git.fetch('upstream', 'main');
    git.reset('hard', ['FETCH_HEAD']);
    const git_url = app.git_url.replace("https://", "https://api:" + Config.HEROKU_API_KEY + "@");
    try {
        await git.addRemote('heroku', git_url);
    } catch {
        console.log('Heroku remote adding error');
    }
    await git.push('heroku', 'main');
    return await message.send('*Bot updated...*\n_Restarting._');
}

async function getDeployments() {
    const validStatus = new Set(['STOPPED', 'STOPPING', 'ERROR', 'ERRPRING']);
    const response = await axios.get('https://app.koyeb.com/v1/deployments', { headers: { 'Content-Type': 'application/json;charset=UTF-8', "Authorization": `Bearer ${Config.KOYEB_API}` } });
    const deploymentStatuses = response.data.deployments.map(deployment => deployment.status);
    return deploymentStatuses.filter(status => !validStatus.has(status)).length > 1;
}

async function redeploy() {
    if (!Config.KOYEB_API)return '*Error redeploying.*\n*Ensure KOYEB_API key is properly set.*\n_E.g.: KOYEB_API:api key from https://app.koyeb.com/account/api ._';
    const { data } = await axios.get(`https://app.koyeb.com/v1/services`, { headers: { 'Content-Type': 'application/json;charset=UTF-8', "Authorization": `Bearer ${Config.KOYEB_API}` } });
    if (!data.services.length) throw new Error("No services found.");
    await axios.post(`https://app.koyeb.com/v1/services/${data.services[0].id}/redeploy`, { "deployment_group": "prod" }, axiosConfig);
    return '_Update started._';
}

System({
    pattern: "shutdown",
    fromMe: true,
    type: "server",
    desc: "Heroku Dyno off",
}, async (message) => {
    const server = message.client.server;
    if (server !== "HEROKU") return await message.reply("_shutdown only works in Heroku_");    
    await heroku.get(baseURI + "/formation").then(async (formation) => {
    await message.send(`_Jarvis is shutting down..._`);
    await heroku.patch(baseURI + "/formation/" + formation[0].id, { body: { quantity: 0 }, });
    }).catch(async (error) => {
        await message.send(`HEROKU: ${error.body.message}`);
    });
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
    if (server !== "HEROKU") return await message.reply("_setvar only works in Heroku or Koye_");
   
    heroku.patch(baseURI + "/config-vars", {
        body: {
            [key.toUpperCase()]: value,
        },
    })
    .then(async () => {
        await message.send(`_*updated var ${key.toUpperCase()}: ${value}*`);
    })
    .catch(async (error) => {
        await message.send(`_HEROKU: ${error.body.message}_`);
    });
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
                await heroku.patch(baseURI + "/config-vars", {
                    body: {
                        [key]: null,
                    },
                });
                await message.send(`_Deleted ${key}_`);
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
    const server = message.client.server;
    const newSudo = (message.mention[0] || message.reply_message.sender).split("@")[0];    
    if (!newSudo) return await m.reply("*reply to a number*");
    let setSudo = (Config.SUDO + "," + newSudo).replace(/,,/g, ",");
    setSudo = setSudo.startsWith(",") ? setSudo.replace(",", "") : setSudo;   
    if (server !== "HEROKU") return await message.send("setsudo only works in Heroku");   
    await heroku.patch(baseURI + "/config-vars", { body: { SUDO: setSudo } })
        .then(async () => {
            await message.reply("*new sudo numbers are :* " + setSudo);
            await message.reply("_It takes 30 seconds to take effect_");
        })
        .catch(async (error) => {
            console.error("Error setting sudo:", error);
            await message.reply("An error occurred while setting sudo.");
        });
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
                await git.reset("hard", ["HEAD"])
                await git.pull()
                await message.send("_Successfully updated. Please manually update npm modules if applicable!_");
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
    pattern: "mode",
    fromMe: true,
    type: "server",
    desc: "change work type",
}, async (message, value) => {
    if (!value || !["private", "public"].includes(value)) {
    if(!message.isGroup) return message.reply("_*mode private/public*_");
   await message.sendPollMessage({ name: "Choose mode", values: [{ displayText: "private", id: "mode private"}, { displayText: "public", id: "mode public"}], onlyOnce: true, withPrefix: true, participates: [message.sender] });
    }
    if (message.client.server !== "HEROKU") return await message.reply("_*Mod cmd only works in Heroku or Koyeb*_");
    await heroku.patch(baseURI + "/config-vars", { body: { ["WORK_TYPE".toUpperCase()]: value } })
        .then(async () => { await message.send(`_*Work type changed to ${value}*_`); })
        .catch(async (error) => { await message.send(`HEROKU: ${error.body.message}`); });
});
