const Discord = require("discord.js");
const fs = require("fs");

const client = new Discord.Client({
	ws: { Intents: new Discord.Intents(Discord.Intents.ALL) },
	partials: ["MESSAGE", "REACTION"]
})

const config = require("./config.json");

fs.readdir('./eventos', (err, files) => {
	if (err) return console.error(err);

	files.forEach(file => {
		const evento = require("./eventos/" + file);
		const nome = file.split(".")[0];
		client.on(nome, evento.bind(null, client));
	})
})

client.login(config.TOKEN)
.then(console.log("Liguei"))