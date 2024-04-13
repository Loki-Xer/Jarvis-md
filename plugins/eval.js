const lib = require("../lib/");
const util = require("util");

lib.System({
  pattern: 'eval',
  on: "text",
  fromDev: false,
  fromMe: true,
  desc: 'Runs a server code',
  dontAddCommandList: true,
}, async (message, match, m, client) => {
  if (message.body.startsWith(">")) {
    try {
      let evaled = await eval(message.body.replace(">", ""));
      if (typeof evaled !== "string") evaled = util.inspect(evaled);
      await message.reply(evaled);
    } catch (err) {
      await message.reply(util.format(err));
    }
  }
});
