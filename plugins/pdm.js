const { System, setData } = require("../lib/");

System({
    pattern: "pdm",
    fromMe: true,
    desc: "To get info about promot and demote",
    type: "user",
}, async (message, match) => {
    if (!message.isGroup) return;
    if (match === "on") { 
      const pdm = setData(message.jid, "active", "true", "pdm");
    if (pdm) return await message.send("_*activated*_");
     await message.send("_*error*_");
    } else if (match === "off") {
     const pdm = setData(message.jid, "disactive", "false", "pdm");
    if (pdm) return await message.send("_*deactivated*_");
     await message.send("_*error*_");
    } else {
     await message.sendPollMessage({
        name: "\n*Choose a setting to pdm settings*\n",
        values: [
            { displayText: "*on*", id: "pdm on" },
            { displayText: "*off*", id: "pdm off" }
            ],
        withPrefix: true,
        participates: [message.sender]
    });
}});

System({
    pattern: "antiviewones",
    fromMe: true,
    desc: "To get info about promot and demote",
    type: "user",
}, async (message, match) => {
    if (match === "on") { 
      const pdm = setData(message.user.id, "active", "true", "antiviewones");
    if (pdm) return await message.send("_*activated*_");
     await message.send("_*error*_");
    } else if (match === "off") {
     const pdm = setData(message.user.id, "disactive", "false", "antiviewones");
    if (pdm) return await message.send("_*deactivated*_");
     await message.send("_*error*_");
    } else {
    if (!message.isGroup) return message.send("_*antiviewones on/off*_");
     await message.sendPollMessage({
        name: "\n*Choose a a settings to on/off antiviewones*\n",
        values: [
            { displayText: "*on*", id: "pdm on" },
            { displayText: "*off*", id: "pdm off" }
            ],
        withPrefix: true,
        participates: [message.sender]
    });
}});