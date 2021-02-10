const Discord = require("discord.js");

module.exports.run = async (client, message, args) => {
    message.delete();
    message.channel.send(new Discord.MessageEmbed()
    .setAuthor("B")
    )
}

module.exports.config = {
    name: 'embed',
    description: 'Usado para comer casadas',
    aliases: [],
    permissions: [],
    category: 'util',
    usage: []
}