const { System, yts, isPrivate } = require('../lib');
const FormData = require('form-data');
const fetch = require('node-fetch');
const crypto = require('crypto');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');


const audioCut = (infile, start, end, filename = "cutted") => new Promise((function(output, error) {
    ffmpeg(infile).setStartTime(start).setDuration(end).save(filename + ".mp3").on("error", (e => error(new Error(e.message)))).on("end", (() => {
        const file = fs.readFileSync(filename + ".mp3");
        output(file);
    }));
}));

const options = {
    host: 'identify-eu-west-1.acrcloud.com',
    endpoint: '/v1/identify',
    signature_version: '1',
    data_type: 'audio',
    secure: true,
    access_key: '8c21a32a02bf79a4a26cb0fa5c941e95',
    access_secret: 'NRSxpk6fKwEiVdNhyx5lR0DP8LzeflYpClNg1gze',
};

function buildStringToSign(
    method,
    uri,
    accessKey,
    dataType,
    signatureVersion,
    timestamp
) {
    return [method, uri, accessKey, dataType, signatureVersion, timestamp].join(
        '\n'
    );
}

function sign(signString, accessSecret) {
    return crypto
        .createHmac('sha1', accessSecret)
        .update(Buffer.from(signString, 'utf-8'))
        .digest()
        .toString('base64');
}

System({
    pattern: 'find',
    fromMe: isPrivate,
    desc: 'Find details of a song',
    type: 'tools',
}, async (message, match, m) => {
    if (!message.reply_message || (!message.reply_message.audio && !message.reply_message.video)) {
        return await message.reply('*Reply to audio or video*');
    }
    const p = await message.reply_message.downloadAndSaveMedia();
    const data = await audioCut(p, 0, 15);
    const current_data = new Date();
    const timestamp = current_data.getTime() / 1000;
    const stringToSign = buildStringToSign(
        'POST',
        options.endpoint,
        options.access_key,
        options.data_type,
        options.signature_version,
        timestamp
    );

    const signature = sign(stringToSign, options.access_secret);

    const form = new FormData();
    form.append('sample', data);
    form.append('sample_bytes', data.length);
    form.append('access_key', options.access_key);
    form.append('data_type', options.data_type);
    form.append('signature_version', options.signature_version);
    form.append('signature', signature);
    form.append('timestamp', timestamp);

    const res = await fetch('http://' + options.host + options.endpoint, {
        method: 'POST',
        body: form,
    });
    const { status, metadata } = await res.json();
    if (status.msg != 'Success') {
        return await message.reply(status.msg);
    }
    const { album, release_date, artists, title } = metadata.music[0];
    const videos = await yts(title);

    const cap = `*❯ Title :* ${title}\n*❯ Album :* ${album.name || ''}\n*❯ Artists :* ${artists !== undefined ? artists.map((v) => v.name).join(', ') : ''}\n*❯ Release Date :* ${release_date}`;
    await message.client.sendMessage(message.chat, { image: { url: `${videos.all[0].image}` }, caption: cap });
});
