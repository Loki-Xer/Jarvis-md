const { System, IronMan, isPrivate } = require("../lib/");
const axios = require("axios");

System(
    {
        pattern: "ig ?(.*)",
        fromMe: isPrivate,
        desc: "Get details of Instagram id",
        type: "search"
    },
    async (message, match) => {
        match = match.trim();

        if (!match) {
            await message.send(
                "*Need an Instagram username*\n_Example: .ig sedboy.am_"
            );
            return;
        }

        (async () => {
            try {
                const res = await axios.get(
                    IronMan(`ironman/ig?name=${match}`)
                );
                const {
                    username,
                    full_name: fullName,
                    biography,
                    profile_pic_url: profilePic,
                    posts: postCount,
                    followers: followersCount,
                    following: followingCount,
                    is_verified: isVerified,
                    is_private: isPrivate,
                    external_url: profileUrl
                } = res.data.result.user_info;
                const caption = `*𖢈Username: ${username}*\n*𖢈Name: ${fullName}*\n*𖢈Bio: ${biography}*\n*𖢈Post: ${postCount}*\n*𖢈Followers: ${followersCount}*\n*𖢈Following: ${followingCount}*\n*𖢈Verified: ${isVerified}*\n*𖢈Private: ${isPrivate}*\n*𖢈URL: https://instagram.com/${match}*`;
                await message.client.sendMessage(message.chat, {
                    image: { url: `${profilePic}` },
                    caption: caption
                });
            } catch (error) {
                console.error("Error at IG:", error);
                await message.send(
                    "Username not found check the username or try again later"
                );
            }
        })();
    }
);

System(
    {
        pattern: "google ?(.*)",
        fromMe: isPrivate,
        desc: "Google search",
        type: "search"
    },
    async (message, match) => {
        if (!match) {
            await message.send(
                "*Need a query to search*\n_Example: who is iron man_"
            );
            return;
        }

        try {
            const response = await axios.get(
                IronMan(`ironman/s/google/search?q=${match}`)
            );
            const results = response.data;

            let resultText = `❯ Results of ${match} ❮\n━━━───────────━━━\n`;
            results.forEach((result, index) => {
                const title = result.title;
                const snippet = result.snippet;
                const link = result.link;

                resultText += `❯ *ᴛɪᴛʟᴇ*: ${title}\n❯ *ᴅᴇꜱᴄʀɪᴩᴛɪᴏɴ*: ${snippet}\n❯ *ʟɪɴᴋ*: ${link}\n━━━───────────━━━\n\n`;
            });

            await message.send(resultText);
        } catch (error) {
            console.error("Error at plugin Google:", error);
            await message.send("*No results*\n_Try again after sometime_");
        }
    }
);

System(
    {
        pattern: "gs ?(.*)",
        fromMe: isPrivate,
        desc: "Google search (short)",
        type: "search"
    },
    async (message, match) => {
        if (!match) {
            await message.send(
                "*Need a query to search*\n_Example: who is iron man_"
            );
            return;
        }

        try {
            const response = await axios.get(
                IronMan(`ironman/s/google/search?q=${match}`)
            );
            const xd = response.data[0];

            const tt = xd.title;
            const des = xd.snippet;
            const lnk = xd.link;

            const resulttt = `❀ *ᴛɪᴛʟᴇ*: ${tt}\n❀ *ᴅᴇꜱᴄʀɪᴩᴛɪᴏɴ*: _${des}_\n❀ *ʟɪɴᴋ*: *${lnk}*`;

            await message.send(resulttt);
        } catch (error) {
            console.error("Error at plugin GS:", error);
            await message.send("*Not Found*\n_Try again later_");
        }
    }
);

System(
    {
        pattern: "scs (.*)",
        fromMe: isPrivate,
        desc: "SoundCloud search",
        type: "search"
    },
    async (message, match) => {
        if (!match) {
            await message.send(
                "*Need a query to search*\n_Example: .scs life waster_"
            );
            return;
        }

        const fullResult = match.trim().startsWith("-full");

        try {
            const query = fullResult
                ? match.replace("-full", "").trim()
                : match.trim();
            const response = await axios.get(
                IronMan(`ironman/s/soundcloud?query=${query}`)
            );
            const results = response.data.result;

            if (!results || results.length === 0) {
                await message.send("No results found.");
                return;
            }

            if (fullResult) {
                let fullit = "";
                results.forEach(result => {
                    fullit += `*Title*: ${result.title}\n*URL*: ${result.url}\n*Artist*: ${result.artist}\n*Views*: ${result.views}\n*Release*: ${result.release}\n*Duration*: ${result.duration}\n\n`;
                });
                await message.send(fullit);
            } else {
                const furina = results[0];
                const title = furina.title;
                const artist = furina.artist;
                const views = furina.views;
                const release = furina.release;
                const duration = furina.duration;
                const thumb = furina.thumb;
                const url = furina.url;

                let caption = `╔═════◇\n\n*➭Title*: ${title}\n*➭Artist*: ${artist}\n*➭Views*: ${views}\n*➭Release*: ${release}\n*➭Duration*: ${duration}\n*➭URL*: ${url}\n\n*Use -full in front of query to get full results*\n_Example: .scs -full ${match}_\n\n╚══════════════════╝`;

                if (thumb) {
                    await message.client.sendMessage(message.chat, {
                        image: { url: thumb },
                        caption: caption
                    });
                } else {
                    await message.send(caption);
                }
            }
        } catch (error) {
            console.error("Error at plugin SCS:", error);
            await message.send(
                "Error fetching SoundCloud results.\n_Check your query and try again_"
            );
        }
    }
);

System(
    {
        pattern: "device ?(.*)",
        fromMe: isPrivate,
        desc: "Get details of a Device",
        type: "search"
    },
    async (message, match, m) => {
        try {
            if (!match) {
                await message.send(
                    "*Need a device name*\n_Example: device Xiaomi 11 i_"
                );
            } else {
                var query = match;
                var response = await axios.get(
                    IronMan(`ironman/device?query=${query}`)
                );
                var data = response.data;

                if (Array.isArray(data) && data.length > 0) {
                    const { id, name, img, description } = data[0];
                    const cap = `*➭Name:* ${name}\n*➭Id:* ${id}\n*➭Description:* ${description}`;
                    await message.client.sendMessage(message.chat, {
                        image: { url: img },
                        caption: cap
                    });
                } else {
                    await message.send("*Device not Found*");
                }
            }
        } catch (error) {
            console.error("Error at plugin DEVICE:", error);
            await message.send(
                "Error fetching device information. Please try again later."
            );
        }
    }
);


System({
    pattern: 'wallpaper ?(.*)',
    fromMe: isPrivate,
    desc: 'wallpaper search',
    type: 'search',
}, async (message, match, m) => {
    try {
        if (!match) {
            await message.send("*Need a wallpaper name*\n_Example: .wallpaper mountain_");
        } else {
            const query = match.trim(); 
            const response = await axios.get(IronMan(`ironman/wallpaper?search=${query}`));

            if (response.data.length > 0) {
                const images = response.data;
                const randomIndexes = Array.from({ length: 5 }, () => Math.floor(Math.random() * images.length));
                const randomImages = randomIndexes.map(index => images[index]);

                for (const url of randomImages) {
                    await message.client.sendMessage(message.chat, { image: { url }, caption: "" });
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } else {
                await message.send("No wallpapers found for the given query.");
            }
        }
    } catch (error) {
        console.error(error);
    }
});
