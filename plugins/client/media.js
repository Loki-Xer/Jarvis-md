const fs = require('fs');
const ff = require('fluent-ffmpeg');

function cutMedia(buff, start, end, type) {
  let buf;
  const mediaFile = `../../lib/temp/cut.${type}`;
  const outputFile = `../../lib/temp/outputcut.${type}`;
  fs.writeFileSync(mediaFile, buff);
  ff(mediaFile)
   .setStartTime(`00:${start}`)
   .setDuration(end)
   .output(outputFile)
   .on('end', function(err) {
      if (!err) {
        buf = fs.readFileSync(outputFile);
      }
    })
   .on('error', err => buf = false);

  return buf;
}

module.exports = {
  cutMedia
}
