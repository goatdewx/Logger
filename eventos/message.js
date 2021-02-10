const Discord = require("discord.js");
const fs = require("fs");

const config = require("../config.json");

module.exports = (client, message) => {
	if (message.author.bot || message.channel.type == 'dm') return;

	if (message.content.indexOf(config.PREFIXO) != 0) return;

	const args = message.content.slice(config.PREFIXO.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	fs.readdir('./comandos', (err, files) => {
		if (err) return console.error(err);

		files.forEach(file => {
			const pull = require('../comandos/' + file);

			if (pull.config.name != command) return;
			if (!message.member.hasPermission(pull.config.permissions)) return;

			
			pull.run(client, message, args);
		})
	})
}