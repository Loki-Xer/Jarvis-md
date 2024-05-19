const simpleGit = require('simple-git');
const axios = require('axios');
const Heroku = require("heroku-client");
const git = simpleGit();
const Config = require("../../config");
const heroku = new Heroku({ token: Config.HEROKU_API_KEY });

const axiosConfig = {
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        "Authorization": `Bearer ${Config.KOYEB_API}`
    }
};

const gitPull = async () => {
    try {
        await git.fetch();
        const newCommits = await git.log(['main..origin/main']);
        if (newCommits.total > 0) {
            const update = await git.pull("origin", "main");
            if (update && update.summary.changes && update.files.includes('package.json')) {
                await git.reset("hard", ["HEAD"]);
                await git.pull();
                return "_Successfully updated. Please manually update npm modules if applicable!_";
            } else {
                return "Bot is already working on the latest version.";
            }
        }
    } catch (error) {
        console.error("Error pulling latest changes:", error);
        return "Could not pull latest changes!";
    }
}

const getDeployments = async () => {
    try {
        const validStatus = new Set(['STOPPED', 'STOPPING', 'ERROR', 'ERRPRING']);
        const response = await axios.get('https://app.koyeb.com/v1/deployments', axiosConfig);
        const deploymentStatuses = response.data.deployments.map(deployment => deployment.status);
        return deploymentStatuses.filter(status => !validStatus.has(status)).length > 1;
    } catch (error) {
        throw new Error("Error fetching deployments");
    }
}

const redeploy = async () => {
    try {
        if (!Config.KOYEB_API) throw new Error("KOYEB_API key is not set.");
        const { data } = await axios.get(`https://app.koyeb.com/v1/services`, axiosConfig);
        if (!data.services.length) throw new Error("No services found.");
        await axios.post(`https://app.koyeb.com/v1/services/${data.services[0].id}/redeploy`, { "deployment_group": "prod" }, axiosConfig);
        return '_Update started._';
    } catch (error) {
        return '*Error redeploying.*\n*Ensure KOYEB_API key is properly set.*\n_E.g.: KOYEB_API: api key from https://app.koyeb.com/account/api ._';
    }
}

const updateBot = async (message) => {
    try {
        const commits = await git.log(['main..origin/main']);
        if (commits.total === 0) return message.send(`_Jarvis is on the latest version: v${version}_`);       
        await message.send("*Updating Jarvis, please wait...*");        
        await git.fetch('upstream', 'main');
        await git.reset('hard', ['FETCH_HEAD']);      
        const app = await heroku.get('/apps/' + Config.HEROKU_APP_NAME);
        const git_url = app.git_url.replace("https://", "https://api:" + Config.HEROKU_API_KEY + "@");
        await git.addRemote('heroku', git_url);
        await git.push('heroku', 'main');     
        return await message.send('_*Bot updated...  Restarting*_');
    } catch (error) {
        return message.send('*Error updating bot.*');
    }
}

module.exports = { gitPull, getDeployments, redeploy, updateBot };
