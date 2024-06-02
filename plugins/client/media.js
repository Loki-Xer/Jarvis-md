const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

async function trim(buff, startTrim, endTrim) {
    try {
        const tempFile = "../temp.mp4";
        const outputFile = "trimmed_video.mp4";
        await fs.promises.writeFile(tempFile, buff);
        await new Promise((resolve, reject) => {
            ffmpeg(tempFile)
                .setStartTime(startTrim)
                .setDuration(parseFloat(endTrim) - parseFloat(startTrim))
                .output(outputFile)
                .on('end', resolve)
                .on('error', reject)
                .run();
        });
        const file = await fs.promises.readFile(outputFile);
        await fs.promises.unlink(tempFile);
        await fs.promises.unlink(outputFile);
        return file;
    } catch (error) {
        return false;;
    }
}

module.exports = { trim };
