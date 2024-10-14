const { System, isPrivate} = require("../lib/");


System({
  pattern: 'ndtvnews ?(.*)',
  fromMe: true,
  desc: 'news',
  type: 'okk',
}, async (message, match, m) => {
  const apiUrl = 'https://api.guruapi.tech/news';
  const res = await fetch(apiUrl);
  const data = (await res.json()).result;
  let formattedList = '';
    data.slice(0, 5).forEach(item => {
    const title = item.title || 'No Title Available';
    const description = item.description || 'No Description Available';
    const link = item.link || 'No Link Available';
    formattedList += `*TITLE:* ${title}\n`;
    formattedList += `*DESCRIPTION:* ${description}\n`;
    formattedList += `*LINK:* ${link}\n\n`;
  });
  const buttonText = "Visit News";
  const buttonUrl = data[0].link;
  await message.send([
    {
      name: "cta_url",
      display_text: buttonText,
      url: buttonUrl,
      merchant_url: buttonUrl,
      action: "url",
      icon: "",
      style: "link"
    }
  ], {
    body: formattedList,
    footer: "*JARVIS-MD*",
    title: "Top 5 News"
  }, "button");
});

