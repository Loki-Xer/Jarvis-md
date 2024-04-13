const { System, isPrivate, audioCut } = require('../lib/');
const crypto = require('crypto');
const axios = require('axios');

function sign(signString, accessSecret) {
    return crypto
        .createHmac('sha1', accessSecret)
        .update(Buffer.from(signString, 'utf-8'))
        .digest()
        .toString('base64');
}

function buildStringToSign(
    method,
    uri,
    accessKey,
    dataType,
    signatureVersion,
    timestamp
) {
    return [
        method,
        uri,
        accessKey,
        dataType,
        signatureVersion,
        timestamp
    ].join('\n');
}

System(
    {
        pattern: 'find',
        fromMe: isPrivate,
        desc: 'Find the Song',
        type: 'misc'
    },
    async (message, match, m) => {
        if (
            !message.reply_message ||
            (!message.reply_message.audio &&
                !message.reply_message.video)
        )
            return await message.reply('*Reply to audio or video*');

        const p = await message.reply_message.downloadAndSave();
        const data = await audioCut(p, 0, 15);
        const timestamp = Date.now() / 1000;

        const options = {
            host: 'identify-eu-west-1.acrcloud.com',
            endpoint: '/v1/identify',
            signature_version: '1',
            data_type: 'audio',
            secure: true,
            access_key: '8c21a32a02bf79a4a26cb0fa5c941e95',
            access_secret: 'NRSxpk6fKwEiVdNhyx5lR0DP8LzeflYpClNg1gze'
        };

        const stringToSign = buildStringToSign(
            'POST',
            options.endpoint,
            options.access_key,
            options.data_type,
            options.signature_version,
            timestamp
        );
        const signature = sign(stringToSign, options.access_secret);

        const formData = new FormData();
        formData.append('sample', data);
        formData.append('sample_bytes', data.length);
        formData.append('access_key', options.access_key);
        formData.append('data_type', options.data_type);
        formData.append('signature_version', options.signature_version);
        formData.append('signature', signature);
        formData.append('timestamp', timestamp);

        try {
            const res = await axios.post(
                `http://${options.host}${options.endpoint}`,
                formData,
                { headers: formData.getHeaders() }
            );
            const { status, metadata } = res.data;

            if (status.msg !== 'Success')
                return await message.reply(status.msg);

            const { album, release_date, artists, title } =
                metadata.music[0];
            const videos = await yts(title);

            await message.client.sendMessage(m.jid, {
                image: { url: videos.all[0].image },
                caption: `*Title :* ${title}\n*Album :* ${
                    album.name || ''
                }\n*Artists :* ${
                    artists ? artists.map(v => v.name).join(', ') : ''
                }\n*Release Date :* ${release_date}`
            });
        } catch (error) {
            console.error('Error occurred during request:', error);
            await message.reply(
                'An error occurred while processing your request.'
            );
        }
    }
);
