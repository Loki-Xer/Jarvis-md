const isBotAdmins = async (message) => {
  	const groupMetadata = await message.client.groupMetadata(message.chat)
	  const admins = await groupMetadata.participants.filter(v => v.admin !== null).map(v => v.id)
  	return admins.includes(message.user_id)
}

const getAllGroups = async (client) => {
    const list = await client.groupFetchAllParticipating();
    return Object.values(list).map(group => `JID: ${group.id}\nGroup Name: ${group.subject}\n`).join("\n");
};

module.exports = {
  isBotAdmins,
  getAllGroups
}
