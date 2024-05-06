function getUptime() {
    const duration = process.uptime();
    const seconds = Math.floor(duration % 60);
    const minutes = Math.floor((duration / 60) % 60);
    const hours = Math.floor((duration / (60 * 60)) % 24);
    return `_*Runtime: ${hours.toString().padStart(2, "0")} hours ${minutes.toString().padStart(2, "0")} minutes ${seconds.toString().padStart(2, "0")} seconds*_`;
}

async function Runtime(date) { 
    const deployedTime = new Date(date);
    const currentTime = new Date();
    const runtimeMilliseconds = currentTime - deployedTime;
    const days = Math.floor(runtimeMilliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((runtimeMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((runtimeMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((runtimeMilliseconds % (1000 * 60)) / 1000);
    return `_*Runtime: ${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds....*_`
}

module.exports = {
  getUptime,
  Runtime
}
